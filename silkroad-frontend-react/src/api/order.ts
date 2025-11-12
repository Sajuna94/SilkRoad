import type { CartItem, InsertCartItemInput, InsertOrderInput, Order, UpdateCartItemInput } from "@/types/order";
import { api } from "./instance";

// 可能之後整合功能 讓所有 table 都支援這四種資料操作
// 權限問題交給後端處理

export async function addOrder(input: InsertOrderInput): Promise<Order> {
    const res = await api.post<Order>(`/order`, input);
    return res.data;
}

// 取得購物車所有商品（透過 customer_id）
export async function getOrderItems(customerId: number): Promise<CartItem[]> {
    const res = await api.get<CartItem[]>(`/cart/${customerId}`);
    return res.data;
}

// 取得單一購物車商品（透過 cart_id + product_id）
export async function getCartItem(cartId: number, productId: number): Promise<CartItem> {
    const res = await api.get<CartItem>(`/cart/${cartId}/product/${productId}`);
    return res.data;
}

// 新增購物車商品（product_id 必須在 body 裡）, 預計讓 cartId 由後端抓
export async function addCartItem(input: InsertCartItemInput): Promise<CartItem> {
    const res = await api.post<CartItem>("/cart", input);
    return res.data;
}

// 更新購物車商品（使用複合主鍵）
export async function updateCartItem(input: UpdateCartItemInput): Promise<CartItem> {
    const res = await api.put<CartItem>(`/cart/${input.cartId}/product/${input.productId}`, input);
    return res.data;
}

// 刪除購物車商品（使用複合主鍵）
export async function deleteCartItem(cartId: number, productId: number): Promise<void> {
    await api.delete(`/cart/${cartId}/product/${productId}`);
}