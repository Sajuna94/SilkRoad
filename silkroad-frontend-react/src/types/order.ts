export interface OrderItem {
  orderId: number;
  productId: number;
  quantity: number;
  options: {
    size: string;
    sugar: string;
    ice: string;
  };
}

export interface Order {
  id: number;
  customerId: number;
  vendorId: number;
  createdAt: string;
  total: number;
  items: OrderItem[];
}

export type InsertOrderInput = Omit<Order, "id">;

export interface Cart {
  customerId: number; // PK + ref
  vendorId: number;
  createdAt: string;
  note: string;
  items?: CartItem[];
}

export interface CartItem {
  cartId: number; // PK + ref
  productId: number; // PK + ref
  quantity: number;
  options: {
    size: string;
    sugar: string;
    ice: string;
  };
}

// all fields except cartId are required to insert a new cart item
export type InsertCartItemInput = Omit<CartItem, "cartId">;

// requires cartId and productId to identify which cart item to update
export type UpdateCartItemInput = Partial<
  Omit<CartItem, "cartId" | "productId">
> & { cartId: number; productId: number };
