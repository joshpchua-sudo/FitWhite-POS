import { create } from 'zustand';
import { CartItem, PaymentMethod, Customer, Product, Bundle, Sale, DailySummary, BranchPerformance } from '../types/index';

interface CartState {
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  discount: number;
  setDiscount: (discount: number) => void;
  
  discountType: 'fixed' | 'percent';
  setDiscountType: (type: 'fixed' | 'percent') => void;
  
  products: Product[];
  setProducts: (products: Product[]) => void;
  
  bundles: Bundle[];
  setBundles: (bundles: Bundle[]) => void;
  
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  
  dailySales: Sale[];
  setDailySales: (sales: Sale[]) => void;
  
  summary: DailySummary;
  setSummary: (summary: DailySummary) => void;
  
  branchPerformance: BranchPerformance[];
  setBranchPerformance: (performance: BranchPerformance[]) => void;
  
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  
  offlineSales: any[];
  setOfflineSales: (sales: any[] | ((prev: any[]) => any[])) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  setCart: (update) => set((state) => ({ 
    cart: typeof update === 'function' ? update(state.cart) : update 
  })),
  
  paymentMethod: 'Cash',
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  
  selectedCustomer: null,
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  
  discount: 0,
  setDiscount: (discount) => set({ discount }),
  
  discountType: 'fixed',
  setDiscountType: (discountType) => set({ discountType }),
  
  products: [],
  setProducts: (products) => set({ products }),
  
  bundles: [],
  setBundles: (bundles) => set({ bundles }),
  
  customers: [],
  setCustomers: (customers) => set({ customers }),
  
  dailySales: [],
  setDailySales: (dailySales) => set({ dailySales }),
  
  summary: { total_revenue: 0, total_transactions: 0 },
  setSummary: (summary) => set({ summary }),
  
  branchPerformance: [],
  setBranchPerformance: (branchPerformance) => set({ branchPerformance }),
  
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  
  offlineSales: JSON.parse(localStorage.getItem('offlineSales') || '[]'),
  setOfflineSales: (update) => set((state) => {
    const nextSales = typeof update === 'function' ? update(state.offlineSales) : update;
    localStorage.setItem('offlineSales', JSON.stringify(nextSales));
    return { offlineSales: nextSales };
  }),
  
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
