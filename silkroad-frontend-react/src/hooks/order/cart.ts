import { addCartItem, deleteCartItem, getCartItem, getCartItems, updateCartItem } from "@/api/cart";
import type { CartItem, InsertCartItemInput, UpdateCartItemInput } from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";


export const useCartItem = (cartId: number, productId: number) => {
	return useQuery<CartItem>({
		queryKey: ["cartItem", cartId, productId],
		queryFn: async () => getCartItem(cartId, productId),
		enabled: !!cartId && !!productId,
	});
}

export const useCartItems = (customerId: number) => {
	return useQuery<CartItem[]>({
		queryKey: ["cartItems", customerId],
		queryFn: async () => getCartItems(customerId),
		enabled: !!customerId,
	});
}

export const useInsertCartItem = () => {
	const queryClient = useQueryClient();

	return useMutation<CartItem, AxiosError, InsertCartItemInput>({
		mutationFn: addCartItem,
		onSuccess: (newItem) => {
			queryClient.setQueryData<CartItem[]>(["cartItems", newItem.cartId], (old) =>
				old ? [...old, newItem] : [newItem]
			);
			queryClient.setQueryData(["cartItem", newItem.cartId, newItem.productId], newItem);
		},
	});
};

export const useUpdateCartItem = () => {
	const queryClient = useQueryClient();

	return useMutation<CartItem, AxiosError, UpdateCartItemInput>({
		mutationFn: updateCartItem,
		onSuccess: (newItem) => {
			queryClient.setQueryData<CartItem[]>(["cartItems", newItem.cartId], (old) =>
				old ? old.map(item => item.productId === newItem.productId ? newItem : item) : [newItem]
			);
			queryClient.setQueryData(["cartItem", newItem.cartId, newItem.productId], newItem);
		},
	});
};

export const useDeleteCartItem = () => {
	const queryClient = useQueryClient();

	return useMutation<void, AxiosError, { cartId: number; productId: number }>({
		mutationFn: ({ cartId, productId }) => deleteCartItem(cartId, productId),
		onSuccess: (_, { cartId, productId }) => {
			queryClient.removeQueries({ queryKey: ["cartItem", cartId, productId] });

			queryClient.setQueryData<CartItem[]>(["cartItems", cartId], (old) =>
				old?.filter(item => item.productId !== productId) ?? []
			);
		},
	});
};