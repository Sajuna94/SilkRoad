export interface OrderItem {
	order_id: number;
	product_id: number;
	quantity: number;
	options: {
		size: string;
		sugar: string;
		ice: string;
	};
}

export interface Order {
	id: number;
	customer_id: number;
	vendor_id: number;
	created_at: string;
	total: number;
	items: OrderItem[];
}

export type InsertOrderInput = Omit<Order, "id">;

export interface Cart {
	customer_id: number; // PK + ref
	vendor_id: number;
	created_at: string;
	note: string;
	items?: CartItem[];
}

export interface CartItem {
	cart_id: number; // PK + ref
	product_id: number; // PK + ref
	quantity: number;
	options: {
		size: string;
		sugar: string;
		ice: string;
	};
}

// // all fields except cart_id are required to insert a new cart item
// export type InsertCartItemInput = Omit<CartItem, "cart_id">;
//
// // requires cart_id and product_id to identify which cart item to update
// export type UpdateCartItemInput = Partial<
// 	Omit<CartItem, "cart_id" | "product_id">
// > & { cart_id: number; product_id: number };
