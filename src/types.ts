export interface Branch {
  id: string;
  name: string;
  type: 'COMPANY-OWNED' | 'MANAGED';
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  stock: number;
  price_adjustment: number;
}

export interface Bundle {
  id: number;
  name: string;
  price: number;
  items: { quantity: number; name: string; price: number }[];
}

export interface CartItem extends Product {
  quantity: number;
  variantId?: number;
  variantName?: string;
  isBundle?: boolean;
}

export interface Sale {
  id: number;
  branch_id: string;
  branch_name?: string;
  customer_id?: number;
  customer_name?: string;
  total_amount: number;
  discount_amount: number;
  payment_method: string;
  status: string;
  timestamp: string;
  items: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  store_credit: number;
  allergies?: string;
  notes?: string;
  created_at: string;
}

export interface Treatment {
  id: number;
  customer_id: number;
  treatment_name: string;
  dosage?: string;
  notes?: string;
  administered_by?: string;
  branch_id?: string;
  branch_name?: string;
  timestamp: string;
}

export interface DailySummary {
  total_revenue: number;
  total_transactions: number;
}

export interface User {
  id: number;
  username: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER';
  branch_id: string;
  branch_name: string;
}
