export interface Product {
  _id?: string;
  name: string;
  price: number;
  priceRange?: string;
  imageUrl?: string;
  quantity?: number;
  category?: string;
  unit?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  apartmentName: string;
  flatNumber: string;
}

export interface GroceryKit {
  _id?: string;
  name: string;
  price: number;
  imageUrl?: string;
  description: string;
  items: string[];
  popular?: boolean;
}
