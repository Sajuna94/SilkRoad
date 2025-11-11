import type { CartItem, InsertCartItemInput, UpdateCartItemInput } from "@/types/order";
import { api } from "./instance";

// 可能之後整合功能 讓所有 table 都支援這四種資料操作
// 權限問題交給後端處理
export async function getCartItems(): Promise<CartItem[]> {
    const res = await api.get<CartItem[]>("/api/cart");
    return res.data;
}

export async function getCartItemByProductId(productId: number): Promise<CartItem> {
    const res = await api.get<CartItem>(`/api/cart/product/${productId}`);
    return res.data;
}

export async function addCartItem(input: InsertCartItemInput): Promise<CartItem> {
    const res = await api.post<CartItem>("/api/cart", input);
    return res.data;
}

export async function updateCartItem(input: UpdateCartItemInput): Promise<CartItem> {
    const res = await api.put<CartItem>(`/api/cart/${input.id}`, input);
    return res.data;
}