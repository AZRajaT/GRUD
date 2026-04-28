export interface Product {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: ProductPagination;
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
  message?: string;
}
