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
	url: string;
	isListed: boolean;
}
