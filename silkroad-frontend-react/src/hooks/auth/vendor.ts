
import { api, type ApiErrorBody } from "@/api/instance";
import type { Product } from "@/types/store";
import type { Vendor } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ToggleProductReq = {
	product_id: number;
	is_listed: boolean;
}[];

export const useToggleProducts = () => {
	const qc = useQueryClient();

	return useMutation<Product[], ApiErrorBody, ToggleProductReq>({
		mutationFn: async (payload) => {
			const res = await api.patch("/vendor/", payload);
			return res.data;
		},
		onSuccess: () => {
			// 商品狀態改變，通常需要刷新 vendor / products
			qc.invalidateQueries({ queryKey: ["vendor"] });
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => {
			console.error("商品上下架失敗:", error.response?.data);
		},
	});
};

type AddProductReq = {
	name: string;
	price: number;
	description: string;
	options: {
		size: string[];
		ice: string[];
		sugar: string[];
	};
	image_url: string;
};

export const useAddProduct = () => {
	const qc = useQueryClient();

	return useMutation<Product, ApiErrorBody, AddProductReq>({
		mutationFn: async (payload) => {
			const res = await api.post("/vendor/product/add", payload);
			return res.data.data;
		},
		onSuccess: (product) => {
			console.log("新增商品成功:", product);

			// 視你的結構決定要不要直接塞 cache
			qc.invalidateQueries({ queryKey: ["vendor"] });
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => {
			console.error("新增商品失敗:", error.response?.data);
		},
	});
};

export const useVendor = (vendorId: number) => {
	return useQuery<Vendor, ApiErrorBody>({
		queryKey: ["vendor", vendorId],
		queryFn: async () => {
			const res = await api.get(`/vendor/${vendorId}`);
			return res.data.data[0];
		},
		enabled: !!vendorId,
		retry: false,
	});
};

export const useVendors = () => {
	return useQuery<Vendor[], ApiErrorBody>({
		queryKey: ["vendors"],
		queryFn: async () => {
			const res = await api.get("/vendors");
			return res.data.data;
		},
		retry: false,
	});
};
