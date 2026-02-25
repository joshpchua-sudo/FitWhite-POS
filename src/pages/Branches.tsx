import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/useCartStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { Building2, Globe, TrendingUp, ShoppingBag, AlertTriangle, X, BarChart3, Users as UsersIcon } from 'lucide-react';
import { BranchStatusCard } from '../components/admin/BranchStatusCard';
import { Branch, BranchPerformance } from '../types/index';
import { motion, AnimatePresence } from 'motion/react';

export function Branches() {
  const { theme, branches } = useUserStore();
  const { branchPerformance } = useCartStore();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const viewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDetailsModal(true);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Branch Monitor</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time status and performance across all locations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.filter(b => b.id !== 'Admin').map((branch) => {
          const performance = branchPerformance.find(p => p.id === branch.id);
          return (
            <div 
              key={branch.id}
              className={cn(
                "p-8 rounded-3xl border transition-all hover:shadow-xl group relative overflow-hidden",
                theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
              )}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  <Building2 size={28} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    branch.type === 'COMPANY-OWNED' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                  )}>{branch.type}</span>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Online</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black mb-1">{branch.name}</h3>
              <p className="text-slate-400 text-xs font-medium mb-8 flex items-center gap-2">
                <Globe size={14} />
                Central Management Active
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Revenue</p>
                  <p className="text-lg font-black tracking-tight">₱{(performance?.revenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
                  <p className="text-lg font-black tracking-tight">{performance?.transactions || 0}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <button 
                  onClick={() => viewDetails(branch)}
                  className={cn(
                    "text-xs font-black uppercase tracking-widest transition-colors",
                    theme === 'clinic' ? "text-pink-600 hover:text-pink-700" : "text-emerald-600 hover:text-emerald-700"
                  )}
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
                    <AlertTriangle size={16} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedBranch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    theme === 'clinic' ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{selectedBranch.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch Performance Metrics</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <BarChart3 className="text-blue-500 mb-4" size={24} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-xl font-black tracking-tight">₱{(branchPerformance.find(p => p.id === selectedBranch.id)?.revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <ShoppingBag className="text-emerald-500 mb-4" size={24} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
                    <p className="text-xl font-black tracking-tight">{branchPerformance.find(p => p.id === selectedBranch.id)?.transactions || 0}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <UsersIcon className="text-purple-500 mb-4" size={24} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff Count</p>
                    <p className="text-xl font-black tracking-tight">4</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Activity</h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <ShoppingBag size={14} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">New Sale Completed</p>
                            <p className="text-[10px] text-slate-400">2 minutes ago</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600">+₱1,200</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
