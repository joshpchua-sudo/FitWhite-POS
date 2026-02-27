import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/useCartStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { Tag, Plus, Search, Trash2, Package, X, Edit2 } from 'lucide-react';
import { Bundle, Product } from '../types/index';
import { motion, AnimatePresence } from 'motion/react';

export function Bundles() {
  const { theme, selectedBranchId } = useUserStore();
  const { bundles, setBundles, products } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [newBundle, setNewBundle] = useState<Partial<Bundle>>({
    name: '',
    price: 0,
    items: []
  });

  useEffect(() => {
    apiClient.fetchBundles(selectedBranchId).then(setBundles);
  }, [selectedBranchId]);

  const handleSaveBundle = async () => {
    if (!newBundle.name || newBundle.items?.length === 0) return;
    try {
      const res = await apiClient.saveBundle(newBundle, editingBundle?.id);
      if (res.success) {
        apiClient.fetchBundles(selectedBranchId).then(setBundles);
        setShowAddModal(false);
        setEditingBundle(null);
        setNewBundle({ name: '', price: 0, items: [] });
      }
    } catch (error) {
      console.error("Failed to save bundle", error);
    }
  };

  const handleDeleteBundle = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const res = await apiClient.deleteBundle(id);
      if (res.success) {
        setBundles(bundles.filter(b => b.id !== id));
      } else {
        alert("Failed to delete bundle");
      }
    } catch (error) {
      console.error("Failed to delete bundle", error);
    }
  };

  const addItemToBundle = (product: Product) => {
    const items = [...(newBundle.items || [])];
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    setNewBundle({ ...newBundle, items });
  };

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
        <button 
          onClick={() => { setEditingBundle(null); setNewBundle({ name: '', price: 0, items: [] }); setShowAddModal(true); }}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
            theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
          )}
        >
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
              <button 
                onClick={() => handleDeleteBundle(bundle.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
              >
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
              <button 
                onClick={() => { setEditingBundle(bundle); setNewBundle(bundle); setShowAddModal(true); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  theme === 'dark' ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Bundle Modal */}
      <AnimatePresence>
        {showAddModal && (
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
                <h3 className="font-black text-lg">{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bundle Name</label>
                    <input 
                      type="text" 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newBundle.name}
                      onChange={e => setNewBundle({...newBundle, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bundle Price (₱)</label>
                    <input 
                      type="number" 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newBundle.price}
                      onChange={e => setNewBundle({...newBundle, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included Items</label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {newBundle.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="text-xs font-bold">{item.quantity}x {item.name}</span>
                          <button 
                            onClick={() => {
                              const items = [...(newBundle.items || [])];
                              items.splice(idx, 1);
                              setNewBundle({...newBundle, items});
                            }}
                            className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Items to Bundle</label>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {products.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => addItemToBundle(p)}
                        className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between"
                      >
                        <span className="text-xs font-bold">{p.name}</span>
                        <Plus size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-950/20">
                <button 
                  onClick={handleSaveBundle}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95",
                    theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
                  )}
                >
                  {editingBundle ? 'UPDATE BUNDLE' : 'CREATE BUNDLE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
