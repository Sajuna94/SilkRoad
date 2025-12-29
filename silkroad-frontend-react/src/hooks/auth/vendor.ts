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
			return res.data.data;
		},
		retry: false,
	});
}

//---for discount policy---
export type DiscountPolicy = {
    policy_id: number;
    vendor_id: number;
    is_available: boolean;
    type: string;
    value: number;
    min_purchase: number;
    max_discount: number;
    membership_limit: number;
    expiry_date: string;
    start_date?: string;
};

export type AddDiscountReq = {
    vendor_id: number;
    type: string;
    value: number;
    min_purchase: number;
    max_discount: number;
    membership_limit: number;
    expiry_date: string;
};

export type UpdateDiscountReq = AddDiscountReq & {
    policy_id: number;
    code: string;
    start_date: string;
};

export type DiscountPoliciesRes = {
    data: DiscountPolicy[];
    policy_amount: number;
    message: string;
    success: boolean;
};

// --- Hooks ---

/**
 * 獲取商家的所有折價券
 */
export const useVendorDiscounts = (vendorId: number) => {
    return useQuery<DiscountPoliciesRes, ApiErrorBody>({
        queryKey: ["discountPolicies", vendorId],
        queryFn: async () => {
            const res = await api.post("/vendor/view_discount", { vendor_id: vendorId });
            return res.data;
        },
        enabled: !!vendorId,
    });
};

/**
 * 新增折價券政策
 */
export const useAddDiscount = () => {
    const qc = useQueryClient();

    return useMutation<{ policy_id: number; success: boolean }, ApiErrorBody, AddDiscountReq>({
        mutationFn: async (payload) => {
            const res = await api.post("/vendor/add_discount", payload);
            return res.data;
        },
        onSuccess: (_, variables) => {
            // 刷新該商家的折價券列表
            qc.invalidateQueries({ queryKey: ["discountPolicies", variables.vendor_id] });
        },
    });
};

/**
 * 更新折價券政策
 */
export const useUpdateDiscount = () => {
    const qc = useQueryClient();

    return useMutation<{ policy_id: number; success: boolean }, ApiErrorBody, UpdateDiscountReq>({
        mutationFn: async (payload) => {
            const res = await api.post("/vendor/update_discount", payload);
            return res.data;
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["discountPolicies", variables.vendor_id] });
        },
    });
};

/**
 * 停用（使無效）折價券政策
 */
export const useInvalidateDiscount = () => {
    const qc = useQueryClient();

    return useMutation<{ success: boolean }, ApiErrorBody, { policy_id: number; vendor_id: number }>({
        mutationFn: async (payload) => {
            const res = await api.post("/vendor/invalid_discount", payload);
            return res.data;
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["discountPolicies", variables.vendor_id] });
        },
    });
};