import { api, type ApiErrorBody } from "@/api/instance";
import type { 
  OrderSummary, 
  CreateOrderInput, 
  OrderDetailResponse,
  UpdateOrderInput 
} from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// ------------------------------------------
// 1. 取得使用者所有訂單列表 (/view_user_orders)
// ------------------------------------------
export const useUserOrders = (userId?: number) => {
  return useQuery<OrderSummary[], AxiosError<ApiErrorBody>>({
    queryKey: ["orders", userId],
    // 只有當 userId 存在時才執行 query
    enabled: !!userId, 
    queryFn: async () => {
      // 後端要求 POST 方法，並且 body 帶 user_id
      const res = await api.post("/order/view_user_orders", { 
        user_id: userId 
      });
      // 根據後端: res.data = { data: result_list, success: true, ... }
      return res.data.data;
    },
  });
};

// ------------------------------------------
// 2. 取得單筆訂單詳細內容 (/view)
// ------------------------------------------
export const useOrderDetails = (orderId?: number, userId?: number, vendorId?: number) => {
  return useQuery<OrderDetailResponse, AxiosError<ApiErrorBody>>({
    queryKey: ["order", orderId],
    enabled: !!orderId && !!userId, // 確保有 id 才打 API
    queryFn: async () => {
      // 後端要求 POST，並傳入 order_id, user_id, vendor_id
      const res = await api.post("/order/view", {
        order_id: orderId,
        user_id: userId,
        vendor_id: vendorId // 根據你的後端註解，這可能也是必填
      });
      
      // 後端回傳格式: { data: [...items], order_info: {...}, success: true }
      // 我們將其整合成一個物件回傳
      return {
        order_info: res.data.order_info,
        data: res.data.data
      };
    },
  });
};

// ------------------------------------------
// 3. 建立訂單 (/trans)
// ------------------------------------------
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiErrorBody>, CreateOrderInput>({
    mutationFn: async (newOrderData) => {
      // 後端要求 POST /trans
      const res = await api.post("/order/trans", newOrderData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // 建立成功後，讓訂單列表失效，觸發重新抓取
      queryClient.invalidateQueries({ queryKey: ["orders", variables.customer_id] });
    },
  });
};

// ------------------------------------------
// 4. 更新訂單資訊 (/update)
// ------------------------------------------
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiErrorBody>, UpdateOrderInput>({
    mutationFn: async (updateData) => {
      const res = await api.post("/order/update", updateData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // 更新成功後，重新抓取該筆訂單的詳細資料
      queryClient.invalidateQueries({ queryKey: ["order", variables.order_id] });
      // 也可以選擇讓列表更新
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};