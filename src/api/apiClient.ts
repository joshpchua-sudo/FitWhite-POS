import { Branch, Product, Bundle, Customer, Sale, DailySummary, BranchPerformance, User, Treatment } from '../types';

const API_BASE = '/api';

export const apiClient = {
  async fetchBranches(): Promise<Branch[]> {
    const res = await fetch(`${API_BASE}/branches`);
    return res.json();
  },

  async fetchProducts(branchId: string): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products?branchId=${branchId}`);
    return res.json();
  },

  async fetchBundles(branchId: string): Promise<Bundle[]> {
    const res = await fetch(`${API_BASE}/bundles?branchId=${branchId}`);
    return res.json();
  },

  async fetchCustomers(branchId: string): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers?branchId=${branchId}`);
    return res.json();
  },

  async fetchDailyReports(branchId: string, date?: string): Promise<{ sales: Sale[], summary: DailySummary }> {
    const res = await fetch(`${API_BASE}/reports/daily?branchId=${branchId}${date ? `&date=${date}` : ''}`);
    return res.json();
  },

  async fetchBranchPerformance(period: string): Promise<BranchPerformance[]> {
    const res = await fetch(`${API_BASE}/reports/performance?period=${period}`);
    return res.json();
  },

  async fetchNotifications(branchId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/notifications?branchId=${branchId}`);
    return res.json();
  },

  async checkout(saleData: any): Promise<{ success: boolean; saleId?: number; error?: string }> {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    return res.json();
  },

  async syncOfflineSales(sales: any[]): Promise<any[]> {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sales })
    });
    return res.json();
  },

  async fetchTreatments(customerId: number): Promise<Treatment[]> {
    const res = await fetch(`${API_BASE}/customers/${customerId}/treatments`);
    return res.json();
  },

  async saveTreatment(treatment: any): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/treatments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(treatment)
    });
    return res.json();
  },

  async saveCustomer(customer: any, id?: number): Promise<{ success: boolean }> {
    const url = id ? `${API_BASE}/customers/${id}` : `${API_BASE}/customers`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    return res.json();
  },

  async deleteCustomer(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async saveProduct(product: any, id?: number): Promise<{ success: boolean }> {
    const url = id ? `${API_BASE}/products/${id}/stock` : `${API_BASE}/products`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async saveBundle(bundle: any): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/bundles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bundle)
    });
    return res.json();
  },

  async deleteBundle(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/bundles/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async markNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/read`, { method: 'POST' });
    return res.json();
  }
};
