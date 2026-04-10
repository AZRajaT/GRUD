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

export interface KitItem {
  product: Product;
  quantity: number;
}

export interface GroceryKit {
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  description?: string;
  items: KitItem[];
  category?: string;
  isActive?: boolean;
  popular?: boolean;
  totalItems?: number;
  savingsPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KitsPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface KitsResponse {
  success: boolean;
  data: {
    kits: GroceryKit[];
    pagination: KitsPagination;
  };
}

export interface KitResponse {
  success: boolean;
  data: {
    kit: GroceryKit;
  };
  message?: string;
}
