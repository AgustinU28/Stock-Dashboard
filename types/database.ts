export interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  price: number;
  category: string;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  change_amount: number;
  reason: string;
  created_at: string;
}

export interface SaleWithProduct extends Sale {
  product: Pick<Product, "id" | "name" | "sku"> | null;
}
