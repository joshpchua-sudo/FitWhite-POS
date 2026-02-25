import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { History as HistoryIcon, Search, RotateCcw, Eye, Calendar, Printer } from 'lucide-react';
import { Sale } from '../types';
import { format } from 'date-fns';

export function History() {
  const { theme, selectedBranchId, dailySales, setDailySales } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiClient.fetchDailyReports(selectedBranchId).then(data => {
      setDailySales(data.sales);
    });
  }, [selectedBranchId]);

  const filteredSales = dailySales.filter(s => 
    s.id.toString().includes(searchQuery) ||
    s.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Transaction History</h2>
          <p className="text-slate-500 text-sm font-medium">Review and manage past sales and refunds.</p>
        </div>
        <div className="flex gap-2">
          <button className={cn(
            "px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all",
            theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}>
            <Calendar size={16} />
            Filter by Date
          </button>
        </div>
      </div>

      <div className={cn(
        "rounded-3xl border overflow-hidden",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all",
                theme === 'dark' ? "bg-slate-800 border-slate-700 focus:ring-2 focus:ring-pink-500/20" : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500/20"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "text-[10px] font-black uppercase tracking-widest border-b",
                theme === 'dark' ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-50"
              )}>
                <th className="px-6 py-4">Sale ID</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold">#{sale.id.toString().padStart(6, '0')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500">{format(new Date(sale.timestamp), 'MMM dd, hh:mm a')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black">₱{sale.total_amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-lg uppercase",
                      theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                    )}>{sale.payment_method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-lg uppercase",
                      sale.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>{sale.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                        <Printer size={16} />
                      </button>
                      {sale.status === 'Completed' && (
                        <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
