// types/order.ts

// --- 1. 用於 /trans (建立訂單) 的 Input ---
export interface CreateOrderInput {
  customer_id: number;
  vendor_id: number;
  policy_id: number | null; // 沒有折扣券時傳 null
  note: string;
  payment_methods: string; // 'cash' 或 'button'
  is_delivered: boolean; // true=外送, false=自取
	shipping_address?: string;
}

// 建立訂單的回傳
export interface CreateOrderResponse {
  order_id: number;
  total_amount: number;
  message: string;
  success: boolean;
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
  refund_status: string | null;
  created_at: string;
  note?: string;

  // 後端可能回傳的地址資訊
  address_info?: string;

  // ★ 評論狀態
  has_reviewed: boolean;
  review_id: number | null;

  // ★ 新增這行：後端回傳了 items 陣列
  items: OrderDetailItem[];

  // ★ 配送狀態
  deliver_status?: 'delivering' | 'delivered' | null;
}

// --- 2.5 用於 /view_vendor_orders (vendor 訂單列表) 的回傳結構 ---
export interface VendorOrderSummary {
  order_id: number;
  user_id: number; // vendor 查看的是客戶的訂單，所以是 user_id
  total_price: number;
  discount_amount: number;
  is_completed: boolean;
  is_delivered: boolean;
  payment_methods: string;
  refund_status: string | null;
  note: string;
  created_at: string;
  items: OrderDetailItem[];
  // 供 vendor 列表顯示的地址資訊（外送訂單）
  address_info?: string;
  // ★ 配送狀態
  deliver_status?: 'delivering' | 'delivered' | null;
}

// --- 3. 用於 /view (單筆訂單詳細) 的回傳結構 ---
export interface OrderDetailInfo {
  discount_amount: number;
  note: string;
  payment_methods: string;
  refund_status: string;
  refund_at: string | null;
  is_completed: boolean;
  is_delivered: boolean;
  total_price: number;
  address_info?: string;
  deliver_status?: 'delivering' | 'delivered' | null;
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
  deliver_status?: 'delivering' | 'delivered' | null;
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

export interface CheckReviewStatusInput {
  order_id: number;
}

export interface ReviewData {
  review_id: number;
  rating: number;
  content: string;
  created_at: string;
}

export interface CheckReviewStatusResponse {
  success: boolean;
  message: string;
  has_reviewed: boolean;
  data: ReviewData | null;
}

// --- 客戶折扣券查詢成功回傳 ---
export interface CustomerDiscountPolicy {
  policy_id: number;
  vendor_id: number;
  vendor_name: string;
  status: "used" | "available";
  code: string;
  type: string;
  value: number;
  min_purchase: number;
	max_discount: number | null;
  membership_limit: number;
  expiry_date: string;
}

export interface ViewCustomerDiscountPoliciesResponse {
  success: true;
  user_current_level: number;
  count: number;
  data: CustomerDiscountPolicy[];
}
