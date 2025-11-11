export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  price: number;
  description: string;
  options: {
    size?: string[];
    sugar?: string[];
    ice?: string[];
  };
  imageUrl: string;
  isListed: boolean;
  createdAt: string;

  //
  quantity: number;
  note: string;
}
