import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useCartStore } from '../../store/useCartStore';
import { useCart } from '../../hooks/useCart';
import { ProductList } from './ProductList';
import { Cart } from './Cart';
import { PaymentOptions } from './PaymentOptions';
import { Receipt } from './Receipt';
import { productsApi } from '../../api/products';
import { salesApi } from '../../api/sales';
import { apiClient } from '../../api/apiClient';
import { cn } from '../../lib/utils';
import { Search, UserPlus, Tag, ShoppingBag, CheckCircle2, ChevronRight, X, Percent, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../../types/index';

export function POSScreen() {
  const { 
    theme, 
    selectedBranchId, 
    isOnline,
    branches
  } = useUserStore();

  const {
    products, 
    setProducts, 
    paymentMethod, 
    selectedCustomer, 
    setSelectedCustomer,
    customers,
    setCustomers,
    offlineSales,
    setOfflineSales,
    searchQuery,
    setSearchQuery,
    discount,
    setDiscount,
    discountType,
    setDiscountType
  } = useCartStore();
  
  const { cart, addToCart, total, subtotal, discountAmount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (selectedBranchId) {
      productsApi.getAll(selectedBranchId).then(setProducts);
      // Also fetch customers if needed
      if (selectedBranchId !== 'Admin') {
        apiClient.fetchCustomers(selectedBranchId).then(setCustomers).catch(() => {});
      }
    }
  }, [selectedBranchId]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    const saleData = {
      items: cart.filter(i => !i.isBundle),
      bundles: cart.filter(i => i.isBundle),
      total_amount: total,
      discount_amount: discountAmount,
      payment_method: paymentMethod,
      customer_id: selectedCustomer?.id,
      branch_id: selectedBranchId,
      items_list: cart // For receipt
    };

    try {
      if (isOnline) {
        const result = await salesApi.checkout(saleData);
        if (result.success) {
          setLastSale({ ...saleData, id: result.saleId });
          setShowReceipt(true);
          clearCart();
        } else {
          alert(result.error || "Checkout failed");
        }
      } else {
        // Offline mode
        const offlineSale = { ...saleData, id: Date.now(), timestamp: new Date().toISOString() };
        setOfflineSales((prev) => [...prev, offlineSale]);
        setLastSale(offlineSale);
        setShowReceipt(true);
        clearCart();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Side: Products */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 lg:p-6 border-b bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products or services..." 
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 transition-all",
                theme === 'dark' ? "bg-slate-800 border-slate-700 focus:ring-pink-500/20" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto relative">
            <button 
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
                theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50",
                selectedCategory && (theme === 'clinic' ? "border-pink-500 text-pink-500" : "border-emerald-500 text-emerald-500")
              )}
            >
              <Tag size={18} />
              {selectedCategory || 'Categories'}
            </button>

            <AnimatePresence>
              {showCategoryMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "absolute top-full right-0 mt-2 w-48 rounded-2xl border shadow-xl z-50 overflow-hidden",
                    theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                  )}
                >
                  <button 
                    onClick={() => { setSelectedCategory(null); setShowCategoryMenu(false); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    All Items
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setShowCategoryMenu(false); }}
                      className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ProductList products={filteredProducts} onAddToCart={addToCart} />
        </div>
      </div>

      {/* Right Side: Cart & Summary */}
      <div className={cn(
        "w-full lg:w-[400px] border-l flex flex-col bg-white dark:bg-slate-900 shadow-2xl z-10",
        theme === 'dark' ? "border-slate-800" : "border-slate-100"
      )}>
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
              theme === 'clinic' ? "bg-pink-600" : "bg-emerald-600"
            )}>
              <ShoppingBag size={20} />
            </div>
            <h3 className="font-black text-lg">Current Order</h3>
          </div>
          <button 
            onClick={() => clearCart()}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            Clear All
          </button>
        </div>

        <Cart />

        <div className="p-6 space-y-6 border-t bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Discount</label>
              <button 
                onClick={() => setShowDiscountModal(true)}
                className={cn(
                  "w-full p-3 rounded-2xl border flex items-center justify-between transition-all",
                  theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                )}
              >
                <div className="flex items-center gap-2">
                  {discountType === 'percent' ? <Percent size={14} className="text-slate-400" /> : <Banknote size={14} className="text-slate-400" />}
                  <span className="text-xs font-bold">
                    {discount > 0 ? (discountType === 'percent' ? `${discount}%` : `₱${discount}`) : 'No Discount'}
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Information</label>
            <button 
              onClick={() => setShowCustomerModal(true)}
              className={cn(
                "w-full p-3 rounded-2xl border border-dashed flex items-center justify-between transition-all",
                theme === 'dark' ? "border-slate-700 hover:border-pink-500/50" : "border-slate-200 hover:border-emerald-500/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <UserPlus size={16} className="text-slate-400" />
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
                </span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Method</label>
            <PaymentOptions />
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3",
              theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            )}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={22} />
                COMPLETE PAYMENT
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showReceipt && lastSale && (
          <Receipt 
            sale={lastSale} 
            branch={currentBranch} 
            onClose={() => setShowReceipt(false)} 
            onPrint={() => window.print()} 
          />
        )}
      </AnimatePresence>

      {/* Customer Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-black text-lg">Select Customer</h3>
                <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto">
                <button 
                  onClick={() => { setSelectedCustomer(null); setShowCustomerModal(false); }}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all",
                    !selectedCustomer ? (theme === 'clinic' ? "border-pink-500 bg-pink-50/50" : "border-emerald-500 bg-emerald-50/50") : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="font-bold">Walk-in Customer</span>
                  {!selectedCustomer && <CheckCircle2 size={18} className={theme === 'clinic' ? "text-pink-500" : "text-emerald-500"} />}
                </button>
                {customers.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => { setSelectedCustomer(c); setShowCustomerModal(false); }}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all",
                      selectedCustomer?.id === c.id ? (theme === 'clinic' ? "border-pink-500 bg-pink-50/50" : "border-emerald-500 bg-emerald-50/50") : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{c.phone || 'No Phone'}</p>
                    </div>
                    {selectedCustomer?.id === c.id && <CheckCircle2 size={18} className={theme === 'clinic' ? "text-pink-500" : "text-emerald-500"} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {showDiscountModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-black text-lg">Apply Discount</h3>
                <button onClick={() => setShowDiscountModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button 
                    onClick={() => setDiscountType('fixed')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                      discountType === 'fixed' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400"
                    )}
                  >
                    ₱ Peso
                  </button>
                  <button 
                    onClick={() => setDiscountType('percent')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                      discountType === 'percent' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400"
                    )}
                  >
                    % Percent
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="Enter amount..."
                    className={cn(
                      "w-full p-4 rounded-2xl border text-center text-2xl font-black focus:outline-none focus:ring-2",
                      theme === 'dark' ? "bg-slate-800 border-slate-700 focus:ring-pink-500/20" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20"
                    )}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                    {discountType === 'fixed' ? '₱' : '%'}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(val => (
                    <button 
                      key={val}
                      onClick={() => { setDiscount(val); setDiscountType('percent'); }}
                      className="py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {val}%
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowDiscountModal(false)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95",
                    theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
                  )}
                >
                  APPLY DISCOUNT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

