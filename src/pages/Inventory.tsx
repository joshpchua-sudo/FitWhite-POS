import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/useCartStore';
import { productsApi } from '../api/products';
import { cn } from '../lib/utils';
import { Package, Plus, Search, Trash2, AlertTriangle, Tag } from 'lucide-react';
import { Product } from '../types/index';

export function Inventory() {
  const { theme, selectedBranchId } = useUserStore();
  const { products, setProducts } = useCartStore();
  const [inventoryTab, setInventoryTab] = useState<'products' | 'services' | 'low-stock'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedBranchId) {
      productsApi.getAll(selectedBranchId).then(setProducts);
    }
  }, [selectedBranchId]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (inventoryTab === 'products') return matchesSearch && p.category !== 'Service';
    if (inventoryTab === 'services') return matchesSearch && p.category === 'Service';
    if (inventoryTab === 'low-stock') return matchesSearch && p.stock <= 10 && p.category !== 'Service';
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Inventory Management</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your products, services and stock levels.</p>
        </div>
        <button className={cn(
          "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
          theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
        )}>
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      <div className={cn(
        "p-2 rounded-2xl flex gap-1 w-full sm:w-fit",
        theme === 'dark' ? "bg-slate-900" : "bg-white border border-slate-100 shadow-sm"
      )}>
        {[
          { id: 'products', label: 'Products', icon: <Package size={16} /> },
          { id: 'services', label: 'Services', icon: <Tag size={16} /> },
          { id: 'low-stock', label: 'Low Stock', icon: <AlertTriangle size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setInventoryTab(tab.id as any)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
              inventoryTab === tab.id 
                ? (theme === 'clinic' ? "bg-pink-600 text-white shadow-md shadow-pink-100" : "bg-emerald-600 text-white shadow-md shadow-emerald-100")
                : (theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
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
              placeholder="Search inventory..." 
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
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        theme === 'dark' ? "bg-slate-800" : "bg-slate-50"
                      )}>
                        {product.category === 'Service' ? <Tag size={18} className="text-slate-400" /> : <Package size={18} className="text-slate-400" />}
                      </div>
                      <span className="text-sm font-bold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black">₱{product.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.category === 'Service' ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg uppercase">N/A</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          product.stock > 20 ? "bg-emerald-500" : product.stock > 5 ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className={cn(
                          "text-xs font-bold",
                          product.stock > 20 ? "text-emerald-600" : product.stock > 5 ? "text-amber-600" : "text-rose-600"
                        )}>{product.stock} {product.unit}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                        <Plus size={16} />
                      </button>
                      <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
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
