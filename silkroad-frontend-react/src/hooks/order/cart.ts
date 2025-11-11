import { addCartItem, getCartItemByProductId, getCartItems, updateCartItem } from "@/api/order";
import type { CartItem, InsertCartItemInput, UpdateCartItemInput } from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";


export const useCartItem = (productId: number) => {
    return useQuery<CartItem>({
        queryKey: ["cartItem", productId],
        queryFn: async () => getCartItemByProductId(productId),
        enabled: !!productId,
    });
}

export const useCartItems = () => {
    return useQuery<CartItem[]>({
        queryKey: ["cartItems"],
        queryFn: async () => getCartItems(),
    });
}

export const useInsertCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation<CartItem, AxiosError, InsertCartItemInput>({
        mutationFn: async (variables) => addCartItem(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cartItems"] });
        },
    });
};

export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation<CartItem, AxiosError, UpdateCartItemInput>({
        mutationFn: async (variables) => updateCartItem(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cartItems"] });
        },
    });
};

