import { create } from 'zustand';
import { User, Branch, Product, Bundle, Customer, Sale, DailySummary, BranchPerformance, CartItem, Theme, View, PaymentMethod } from '../types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  currentView: View;
  setCurrentView: (view: View) => void;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
  
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  
  products: Product[];
  setProducts: (products: Product[]) => void;
  
  bundles: Bundle[];
  setBundles: (bundles: Bundle[]) => void;
  
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  
  dailySales: Sale[];
  setDailySales: (sales: Sale[]) => void;
  
  summary: DailySummary;
  setSummary: (summary: DailySummary) => void;
  
  branchPerformance: BranchPerformance[];
  setBranchPerformance: (performance: BranchPerformance[]) => void;
  
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  
  offlineSales: any[];
  setOfflineSales: (sales: any[] | ((prev: any[]) => any[])) => void;
  
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  discount: number;
  setDiscount: (discount: number) => void;
  
  discountType: 'fixed' | 'percent';
  setDiscountType: (type: 'fixed' | 'percent') => void;
  
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  currentView: 'pos',
  setCurrentView: (currentView) => set({ currentView }),
  
  theme: 'clinic',
  setTheme: (theme) => set({ theme }),
  
  branches: [],
  setBranches: (branches) => set({ branches }),
  
  selectedBranchId: 'Admin',
  setSelectedBranchId: (selectedBranchId) => set({ selectedBranchId }),
  
  products: [],
  setProducts: (products) => set({ products }),
  
  bundles: [],
  setBundles: (bundles) => set({ bundles }),
  
  customers: [],
  setCustomers: (customers) => set({ customers }),
  
  cart: [],
  setCart: (update) => set((state) => ({ 
    cart: typeof update === 'function' ? update(state.cart) : update 
  })),
  
  dailySales: [],
  setDailySales: (dailySales) => set({ dailySales }),
  
  summary: { total_revenue: 0, total_transactions: 0 },
  setSummary: (summary) => set({ summary }),
  
  branchPerformance: [],
  setBranchPerformance: (branchPerformance) => set({ branchPerformance }),
  
  isOnline: navigator.onLine,
  setIsOnline: (isOnline) => set({ isOnline }),
  
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  
  offlineSales: JSON.parse(localStorage.getItem('offlineSales') || '[]'),
  setOfflineSales: (update) => set((state) => {
    const nextSales = typeof update === 'function' ? update(state.offlineSales) : update;
    localStorage.setItem('offlineSales', JSON.stringify(nextSales));
    return { offlineSales: nextSales };
  }),
  
  paymentMethod: 'Cash',
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  
  selectedCustomer: null,
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  
  discount: 0,
  setDiscount: (discount) => set({ discount }),
  
  discountType: 'fixed',
  setDiscountType: (discountType) => set({ discountType }),

  isSidebarOpen: false,
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
