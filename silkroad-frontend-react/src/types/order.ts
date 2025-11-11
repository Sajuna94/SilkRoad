export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    options: {
        size: string;
        sugar: string;
        ice: string;
    };
}

// all fields except id are required to insert a new cart item
export type InsertCartItemInput = Omit<CartItem, "id">;

// requires id to identify which cart item to update
export type UpdateCartItemInput = Partial<Omit<CartItem, "id">> & { id: number };