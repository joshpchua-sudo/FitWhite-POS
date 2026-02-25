import { apiClient } from './apiClient';

export const inventoryApi = {
  getStatus: (branchId: string) => fetch(`/api/reports/inventory-status?branchId=${branchId}`).then(res => res.json()),
  updateStock: (productId: number, branchId: string, stock: number) => apiClient.saveProduct({ stock }, productId),
};
