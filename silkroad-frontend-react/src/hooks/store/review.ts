import { api, type ApiErrorBody } from "@/api/instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Review = {
	review_id: number;
	rating: number;
	content: string;
	created_at: string;
	order_id?: number;
	customer_id?: number;
	vendor_id?: number;
};

type PostReviewReq = {
	order_id: number;
	rating: number;
	review_content?: string; // optional
};


export const useVendorReviews = (vendorId: number) => {
	return useQuery<Review[], ApiErrorBody>({
		queryKey: ["vendor-reviews", vendorId],
		queryFn: async () => {
			// 確保 vendorId 存在才發送請求
			if (!vendorId) return [];

			const res = await api.get(`/user/vendor/${vendorId}/reviews`);
			return res.data.data;
		},
		// 當 vendorId 有值時才啟用查詢
		enabled: !!vendorId,
	});
};


export const usePostReview = () => {
	const qc = useQueryClient();

	return useMutation<Review, ApiErrorBody, PostReviewReq>({
		mutationFn: async (payload) => {
			const res = await api.post("/customer/review", payload);
			return res.data.data[0];
		},
		onSuccess: (newReview) => {
			console.log("Review posted successfully:", newReview);

			// 刷新該店家的評論列表
			if (newReview.vendor_id) {
				// 確保 vendor_id 是數字類型
				const vendorId = Number(newReview.vendor_id);
				qc.invalidateQueries({
					queryKey: ["vendor-reviews", vendorId],
				});
				// 強制 refetch
				qc.refetchQueries({ queryKey: ["vendor-reviews", vendorId] });
				console.log(`Invalidating vendor-reviews for vendor ${vendorId}`);
			}

			// 刷新訂單列表（因為訂單中會顯示是否已評論）
			qc.invalidateQueries({ queryKey: ["orders"] });

			// 也刷新所有評論相關的快取（確保萬無一失）
			// qc.invalidateQueries({ queryKey: ["vendor-reviews"] });
		},
		onError: (error) => {
			console.error("評論提交失敗:", error.response?.data);
		},
	});
};