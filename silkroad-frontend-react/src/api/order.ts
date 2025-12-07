import type { CartItem, InsertOrderInput, Order } from "@/types/order";
import { api } from "./instance";

// 可能之後整合功能 讓所有 table 都支援這四種資料操作
// 權限問題交給後端處理

export async function addOrder(input: InsertOrderInput): Promise<Order> {
  // 後端尚未完成時使用假資料
  return Promise.resolve({
    id: Math.floor(Math.random() * 100000),
    customerId: input.customerId,
    vendorId: input.vendorId,
    createdAt: new Date().toISOString(),
    total: input.total,
    items: input.items,
  });
}

export async function getOrders(customerId: number): Promise<Order[]> {
  // 後端未完成時 Mock 假資料
  return Promise.resolve([
    {
      id: 101,
      customerId,
      vendorId: 1,
      createdAt: "2025-01-01T12:00:00",
      total: 120,
      items: [
        {
          orderId: 101,
          productId: 13,
          quantity: 2,
          options: { size: "L", sugar: "50%", ice: "正常" },
        },
      ],
    },
    {
      id: 102,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 60,
      items: [
        {
          orderId: 102,
          productId: 12,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 103,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 600,
      items: [
        {
          orderId: 103,
          productId: 7,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
        {
          orderId: 103,
          productId: 6,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
        {
          orderId: 103,
          productId: 5,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
        {
          orderId: 103,
          productId: 11,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
        {
          orderId: 103,
          productId: 10,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 104,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-04T10:20:00",
      total: 60,
      items: [
        {
          orderId: 104,
          productId: 4,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 105,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 60,
      items: [
        {
          orderId: 105,
          productId: 3,
          quantity: 2,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 106,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 60,
      items: [
        {
          orderId: 106,
          productId: 2,
          quantity: 1,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 107,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 1000,
      items: [
        {
          orderId: 107,
          productId: 1,
          quantity: 2,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 108,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 1000,
      items: [
        {
          orderId: 108,
          productId: 1,
          quantity: 2,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 109,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 1000,
      items: [
        {
          orderId: 109,
          productId: 1,
          quantity: 2,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 110,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 87,
      items: [
        {
          orderId: 110,
          productId: 2,
          quantity: 2,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
    {
      id: 111,
      customerId,
      vendorId: 2,
      createdAt: "2025-01-02T10:20:00",
      total: 666,
      items: [
        {
          orderId: 111,
          productId: 4,
          quantity: 2,
          options: { size: "M", sugar: "無糖", ice: "少冰" },
        },
      ],
    },
  ]);
}

// 取得購物車所有商品（透過 customer_id）
export async function getOrderItems(customerId: number): Promise<CartItem[]> {
  const res = await api.get<CartItem[]>(`/cart/${customerId}`);
  return res.data;
}

// 取得單一購物車商品（透過 cart_id + product_id）
export async function getCartItem(
  cartId: number,
  productId: number
): Promise<CartItem> {
  const res = await api.get<CartItem>(`/cart/${cartId}/product/${productId}`);
  return res.data;
}
