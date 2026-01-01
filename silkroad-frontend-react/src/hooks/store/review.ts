import { api, type ApiErrorBody } from "@/api/instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 定義評論的資料結構
export type Review = {
  review_id: number;
  rating: number;
  content: string;
  created_at: string;
  // 提交評論後回傳的額外欄位 (可選，因為 GET /reviews 可能不包含這些)
  order_id?: number;
  customer_id?: number;
  vendor_id?: number;
};

// 提交評論的請求結構
type PostReviewReq = {
  order_id: number;
  rating: number;
  review_content?: string; // optional
};

/**
 * 取得特定商家的評論列表
 * URL: /user/vendor/<int:vendor_id>/reviews
 * Method: GET
 */
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

/**
 * 提交訂單評論
 * URL: /customer/review
 * Method: POST
 */
export const usePostReview = () => {
  const qc = useQueryClient();

  return useMutation<Review, ApiErrorBody, PostReviewReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/customer/review", payload);
      // 後端回傳 data 是一個陣列，取第一筆作為新建立的評論物件
      return res.data.data[0];
    },
    onSuccess: (newReview) => {
      console.log("Review posted successfully:", newReview);
      
      // 如果回傳資料包含 vendor_id，自動刷新該商家的評論列表
      if (newReview.vendor_id) {
        qc.invalidateQueries({
          queryKey: ["vendor-reviews", newReview.vendor_id],
        });
      }
      
      // 這裡也可以選擇 invalidate 訂單列表，因為該訂單現在狀態可能變成「已評論」
      // qc.invalidateQueries({ queryKey: ["orders"] }); 
    },
    onError: (error) => {
      console.error("評論提交失敗:", error.response?.data);
    },
  });
};