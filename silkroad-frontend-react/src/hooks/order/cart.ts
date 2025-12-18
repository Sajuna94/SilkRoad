
import { useQuery } from "@tanstack/react-query";
import { api, type ApiErrorBody } from "@/api/instance";
import type { CartItem } from "@/types/order";
import type { Product } from "@/types/store";

export type CartItemsRes = {
	cart_id: number;
	items: (Omit<CartItem, "product_id"> & { product: Product; })[];
};

export const useCartItems = () => {
	return useQuery<CartItemsRes, ApiErrorBody>({
		queryKey: ["cartItems"],
		queryFn: async () => {
			const res = await api.get("/cart/items");
			return res.data.data;
		},
	});
}