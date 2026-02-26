import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/useCartStore';
import { productsApi } from '../api/products';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { Package, Plus, Search, Trash2, AlertTriangle, Tag, X, Minus, Edit2 } from 'lucide-react';
import { Product } from '../types/index';
import { motion, AnimatePresence } from 'motion/react';

export function Inventory() {
  const { theme, selectedBranchId } = useUserStore();
  const { products, setProducts } = useCartStore();
  const [inventoryTab, setInventoryTab] = useState<'products' | 'services' | 'low-stock'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Product',
    price: 0,
    stock: 0,
    unit: 'pcs'
  });

  useEffect(() => {
    if (selectedBranchId) {
      productsApi.getAll(selectedBranchId).then(setProducts);
    }
  }, [selectedBranchId]);

  const handleSaveProduct = async () => {
    if (!newProduct.name) return;
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, branch_id: selectedBranchId })
      });
      const data = await res.json();
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? data : p));
      } else {
        setProducts([...products, data]);
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setNewProduct({ name: '', category: 'Product', price: 0, stock: 0, unit: 'pcs' });
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await apiClient.deleteProduct(id);
      if (res.success) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Failed to delete product. It might be linked to existing sales.");
      }
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  const adjustStock = async (id: number, delta: number) => {
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      const data = await res.json();
      setProducts(products.map(p => p.id === id ? data : p));
    } catch (error) {
      console.error("Failed to adjust stock", error);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (inventoryTab === 'products') return matchesSearch && p.category !== 'Service';
    if (inventoryTab === 'services') return matchesSearch && p.category === 'Service';
    if (inventoryTab === 'low-stock') return matchesSearch && p.stock <= 100 && p.category !== 'Service';
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Inventory Management</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your products, services and stock levels.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setNewProduct({ name: '', category: 'Product', price: 0, stock: 0, unit: 'pcs' }); setShowAddModal(true); }}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
            theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
          )}
        >
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
                <React.Fragment key={product.id}>
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                            product.stock > 100 ? "bg-emerald-500" : product.stock > 20 ? "bg-amber-500" : "bg-rose-500"
                          )} />
                          <span className={cn(
                            "text-xs font-bold",
                            product.stock > 100 ? "text-emerald-600" : product.stock > 20 ? "text-amber-600" : "text-rose-600"
                          )}>{product.stock} {product.unit}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => adjustStock(product.id, 1)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          onClick={() => adjustStock(product.id, -1)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Minus size={16} />
                        </button>
                        <button 
                          onClick={() => { setEditingProduct(product); setNewProduct(product); setShowAddModal(true); }}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {product.variants && product.variants.length > 0 && product.variants.map(variant => (
                    <tr key={`v-${variant.id}`} className="bg-slate-50/30 dark:bg-slate-800/20 border-l-4 border-emerald-500">
                      <td className="px-12 py-3">
                        <span className="text-xs font-medium text-slate-500 italic">— {variant.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Variant</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-xs font-bold text-slate-500">₱{(product.price + (variant.price_adjustment || 0)).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            variant.stock > 10 ? "bg-emerald-400" : "bg-rose-400"
                          )} />
                          <span className="text-[10px] font-bold text-slate-500">{variant.stock} {product.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {/* Variant actions could go here */}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-black text-lg">{editingProduct ? 'Edit Item' : 'Add New Item'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Name</label>
                  <input 
                    type="text" 
                    className={cn(
                      "w-full p-3 rounded-xl border text-sm",
                      theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
                      <option value="Supplies">Supplies</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price (₱)</label>
                    <input 
                      type="number" 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                {newProduct.category !== 'Service' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Stock</label>
                      <input 
                        type="number" 
                        className={cn(
                          "w-full p-3 rounded-xl border text-sm",
                          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                        )}
                        value={newProduct.stock}
                        onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</label>
                      <input 
                        type="text" 
                        placeholder="pcs, ml, box..."
                        className={cn(
                          "w-full p-3 rounded-xl border text-sm",
                          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                        )}
                        value={newProduct.unit}
                        onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <button 
                  onClick={handleSaveProduct}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95",
                    theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
                  )}
                >
                  {editingProduct ? 'UPDATE ITEM' : 'SAVE ITEM'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
