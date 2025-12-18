export interface Product {
	id: number;
	vendor_id: number;
	name: string;
	price: number;
	description: string;
	options: {
		size: string[];
		sugar: string[];
		ice: string[];
	};
	image_url: string;
	is_listed: boolean;
}
