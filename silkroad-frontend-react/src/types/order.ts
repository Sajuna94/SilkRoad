// types/order.ts

// --- 1. 用於 /trans (建立訂單) 的 Input ---
export interface CreateOrderInput {
  customer_id: number;
  vendor_id: number;
  policy_id: number; // 假設這是後端需要的欄位
  note: string;
  payment_methods: string; // Enum string
}

// --- 2. 用於 /view_user_orders (訂單列表) 的回傳結構 ---
export interface OrderSummary {
  order_id: number;
  vendor_id: number;
  total_price: number;
  discount_amount: number;
  is_completed: boolean;
  // is_delivered 雖然 JSON 沒看到，但如果後端有回傳就留著，若無可設為 optional
  is_delivered?: boolean; 
  payment_methods?: string; // JSON 沒看到這個，設為 optional
  created_at: string;
  note?: string;
  
  // ★ 新增這行：後端回傳了 items 陣列
  items: OrderDetailItem[]; 
}

// --- 3. 用於 /view (單筆訂單詳細) 的回傳結構 ---
export interface OrderDetailInfo {
  note: string;
  payment_methods: string;
  refund_status: string;
  refund_at: string | null;
  is_completed: boolean;
  is_delivered: boolean;
  total_price: number;
}

export interface OrderDetailItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  subtotal: number;
  selected_sugar: string;
  selected_ice: string;
  selected_size: string;
}



// 整合單筆訂單的完整回應
export interface OrderDetailResponse {
  order_info: OrderDetailInfo;
  data: OrderDetailItem[];
}

// --- 4. 用於 /update (更新訂單) 的 Input ---
export interface UpdateOrderInput {
  order_id: number;
  refund_status?: string;
  refund_at?: string;
  is_completed?: boolean;
  is_delivered?: boolean;
}

// --- 5. 折價券相關類型 ---
export type DiscountType = "percent" | "fixed";

export interface DiscountPolicy {
  policy_id: number;
  vendor_id: number;
  code: string | null;
  is_available: boolean;
  type: DiscountType;
  value: number;
  min_purchase: number;
  max_discount: number | null;
  membership_limit: number;
  start_date: string | null; // "YYYY-MM-DD"
  expiry_date: string | null; // "YYYY-MM-DD"
}

export interface AddDiscountPolicyInput {
  vendor_id: number;
  code?: string;
  type: DiscountType;
  value: number;
  min_purchase?: number;
  max_discount?: number;
  membership_limit: number;
  start_date?: string; // "YYYY-MM-DD"
  expiry_date?: string; // "YYYY-MM-DD"
}

export interface ViewDiscountPoliciesInput {
  vendor_id: number;
}

export interface ViewDiscountPoliciesResponse {
  data: DiscountPolicy[];
  policy_amount: number;
  message: string;
  success: boolean;
}

export interface InvalidDiscountPolicyInput {
  policy_id: number;
  vendor_id: number;
}