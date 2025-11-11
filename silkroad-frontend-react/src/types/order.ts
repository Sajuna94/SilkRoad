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
export type UpdateCartItemInput = Partial<Omit<CartItem, "cartId" | "productId">> & { cartId: number; productId: number };