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
    
      if (newReview.vendor_id) {
        qc.invalidateQueries({
          queryKey: ["vendor-reviews", newReview.vendor_id],
        });
      }
      
      qc.invalidateQueries({ queryKey: ["orders"] }); 
    },
    onError: (error) => {
      console.error("評論提交失敗:", error.response?.data);
    },
  });
};