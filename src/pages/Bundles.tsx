import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/useCartStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { Tag, Plus, Search, Trash2, Package } from 'lucide-react';
import { Bundle } from '../types/index';

export function Bundles() {
  const { theme, selectedBranchId } = useUserStore();
  const { bundles, setBundles } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiClient.fetchBundles(selectedBranchId).then(setBundles);
  }, [selectedBranchId]);

  const filteredBundles = bundles.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Bundle Packages</h2>
          <p className="text-slate-500 text-sm font-medium">Create and manage promotional service bundles.</p>
        </div>
        <button className={cn(
          "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
          theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
        )}>
          <Plus size={20} />
          Create Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBundles.map((bundle) => (
          <div 
            key={bundle.id}
            className={cn(
              "p-6 rounded-3xl border transition-all hover:shadow-xl group",
              theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600"
              )}>
                <Tag size={24} />
              </div>
              <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="text-lg font-black mb-2">{bundle.name}</h3>
            <div className="space-y-2 mb-6">
              {bundle.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Package size={12} className="text-slate-300" />
                  <span>{item.quantity}x {item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bundle Price</span>
                <span className={cn(
                  "text-xl font-black",
                  theme === 'clinic' ? "text-pink-600" : "text-emerald-600"
                )}>₱{bundle.price.toLocaleString()}</span>
              </div>
              <button className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                theme === 'dark' ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}>
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
