
import { api, type ApiErrorBody } from "@/api/instance";
import type { Product } from "@/types/store";
import type { Vendor } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UpdateProductPayload = {
	product_id: number;
	is_listed: boolean;
}[];

export const useUpdateProductsListed = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateProductPayload) => {
			const res = await api.patch("/vendor/products/listed", payload);
			return res.data;
		},
		onSuccess: () => {
			// 成功後刷新商品列表

			qc.invalidateQueries({ queryKey: ["products"] });
		},
	});
};

type AddProductReq = {
	name: string;
	price: number;
	description: string;
	options: {
		size: string;
		ice: string;
		sugar: string;
	};
	image_url: string;
};

export const useAddProduct = () => {
	const qc = useQueryClient();

	return useMutation<Product, ApiErrorBody, AddProductReq>({
		mutationFn: async (payload) => {
			const res = await api.post("/vendor/product/add", payload);
			console.log(res);
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
			return res.data.data;
		},
		enabled: !!vendorId,
		retry: false,
	});
};

export const useVendors = () => {
	return useQuery<Vendor[], ApiErrorBody>({
		queryKey: ["vendors"],
		queryFn: async () => {
			const res = await api.get("/vendor/vendors");
			return res.data.data;
		},
		retry: false,
	});
};

export const useVendorProducts = () => {
	return useQuery<Product[], ApiErrorBody>({
		queryKey: ["products"],
		queryFn: async () => {
			const res = await api.get(`/vendor/products`);
			return res.data.products;
		},
		retry: false,
	});
}

export const useVendorProductsByVendorId = (vendorId: number | undefined) => {
	return useQuery<Product[], ApiErrorBody>({
		queryKey: ["vendor-products", vendorId],
		queryFn: async () => {
			if (!vendorId) throw new Error("Vendor ID is required");
			console.log("entry");
			const res = await api.get(`/vendor/${vendorId}/view_products`);

			// API returns simplified product data, so we need to add missing fields
			// description and options will be fetched when user clicks on a product
			// const products = res.data.products.map((p: any) => ({
			// 	...p,
			// 	vendor_id: vendorId,
			// 	description: "", // Will be loaded on-demand
			// 	options: {
			// 		size: [],
			// 		sugar: [],
			// 		ice: []
			// 	}
			// }));

			return res.data.products;
		},
		enabled: !!vendorId,
		retry: false,
	});
}
