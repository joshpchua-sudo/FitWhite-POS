import { apiClient } from './apiClient';
import { Product } from '../types';

export const productsApi = {
  getAll: (branchId: string) => apiClient.fetchProducts(branchId),
  save: (product: any, id?: number) => apiClient.saveProduct(product, id),
  getLowStock: (branchId: string) => apiClient.fetchNotifications(branchId),
};
