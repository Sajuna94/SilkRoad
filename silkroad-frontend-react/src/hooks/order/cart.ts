
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiErrorBody } from "@/api/instance";

// Backend response types
export type CartItemData = {
	cart_item_id: number;
	product_id: number;
	vendor_id: number;
	product_name: string;
	product_image: string;
	price: number;
	quantity: number;
	subtotal: number;
	selected_sugar: string;
	selected_ice: string;
	selected_size: string;
};

export type CartItemsRes = {
	data: CartItemData[];
	total_amount: number;
	message: string;
	success: boolean;
};

// Add to cart request payload
export type AddToCartReq = {
	vendor_id: number;
	product_id: number;
	quantity: number;
	selected_sugar: string;
	selected_ice: string;
	selected_size: string;
};

// Remove from cart request payload
export type RemoveFromCartReq = {
	cart_item_id: number;
};

// Update cart item request payload
export type UpdateCartItemReq = {
	cart_item_id: number;
	quantity?: number;
	selected_sugar?: string;
	selected_ice?: string;
	selected_size?: string;
};

/**
 * Hook to fetch cart items for a customer
 * Supports both logged-in users and guests (session-based cart)
 * @param customerId - The customer's ID (optional for guests, uses session)
 */
export const useCartItems = (customerId?: number) => {
	return useQuery<CartItemsRes, ApiErrorBody>({
		queryKey: ["cartItems"],
		queryFn: async () => {
			// For guests, use 0 as placeholder (backend ignores it and reads from session)
			// For logged-in users, use their customer_id
			const id = customerId ?? 0;
			const res = await api.get(`/cart/view/${id}`);
			return res.data;
		},
	});
};

/**
 * Hook to add an item to the cart
 * Supports both logged-in users and guests (session-based cart)
 */
export const useAddToCart = () => {
	const qc = useQueryClient();

	return useMutation<any, ApiErrorBody, AddToCartReq>({
		mutationFn: async (payload) => {
			const res = await api.post("/cart/add", payload);
			return res.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate the cart query to refetch updated cart data
			// For logged-in users, invalidate by customer_id
			// For guests, the backend uses session
			// if (variables.customer_id) {
			// 	qc.invalidateQueries({ queryKey: ["cartItems", variables.customer_id] });
			// } else {
			qc.invalidateQueries({ queryKey: ["cartItems"] });
			// }
		},
	});
};

/**
 * Hook to remove an item from the cart
 * Supports both logged-in users and guests (session-based cart)
 * @NOTE
 *    this hook does not pass any test
 *    because the there is no any valid product to add to cart so
 *    I can't test it
 *    by Etho 25/12/21
 */
export const useRemoveFromCart = () => {
	const qc = useQueryClient();

	return useMutation<any, ApiErrorBody, RemoveFromCartReq & { customer_id?: number }>({
		mutationFn: async (payload) => {
			const res = await api.post("/cart/remove", {
				cart_item_id: payload.cart_item_id,
				customer_id: payload.customer_id ?? 0, // Backend requires this even for guests
			});
			return res.data;
		},
		onSuccess: () => {
			// Invalidate the cart query to refetch updated cart data
			// Use the same query key as useCartItems hook
			qc.invalidateQueries({ queryKey: ["cartItems"] });
		},
	});
};

/**
 * Hook to update an existing cart item
 * Updates quantity and/or customization options (sugar, ice, size)
 */
export const useUpdateCartItem = () => {
	const qc = useQueryClient();

	return useMutation<any, ApiErrorBody, UpdateCartItemReq>({
		mutationFn: async (payload) => {
			const res = await api.post("/cart/update", payload);
			return res.data;
		},
		onSuccess: () => {
			// Invalidate the cart query to refetch updated cart data
			qc.invalidateQueries({ queryKey: ["cartItems"] });
		},
	});
};