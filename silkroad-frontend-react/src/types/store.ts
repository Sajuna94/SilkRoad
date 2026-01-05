export interface SizeOptionItem {
  name: string;
  price: number;
}

export interface Product {
	id: number;
	vendor_id: number;
	name: string;
	price: number;
	description: string;
	options: {
		size: SizeOptionItem[];
		sugar: string[];
		ice: string[];
	};
	price_step?: number;
	image_url: string;
	is_listed: boolean;
}
