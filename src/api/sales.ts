import { apiClient } from './apiClient';

export const salesApi = {
  checkout: (saleData: any) => apiClient.checkout(saleData),
  getDailyReports: (branchId: string, date?: string) => apiClient.fetchDailyReports(branchId, date),
  getPerformance: (period: string) => apiClient.fetchBranchPerformance(period),
  syncOffline: (sales: any[]) => apiClient.syncOfflineSales(sales),
};
