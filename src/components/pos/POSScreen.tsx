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
import { cn } from '../../lib/utils';
import { Search, UserPlus, Tag, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    offlineSales,
    setOfflineSales,
    searchQuery,
    setSearchQuery
  } = useCartStore();
  
  const { cart, addToCart, total, subtotal, discountAmount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedBranchId) {
      productsApi.getAll(selectedBranchId).then(setProducts);
    }
  }, [selectedBranchId]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    const saleData = {
      items: cart.filter(i => !i.isBundle),
      bundles: cart.filter(i => i.isBundle),
      total,
      discount: discountAmount,
      paymentMethod,
      customerId: selectedCustomer?.id,
      branchId: selectedBranchId,
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
          <div className="flex gap-2 w-full sm:w-auto">
            <button className={cn(
              "flex-1 sm:flex-none px-4 py-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
              theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50"
            )}>
              <Tag size={18} />
              Categories
            </button>
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
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Information</label>
            <button className={cn(
              "w-full p-3 rounded-2xl border border-dashed flex items-center justify-between transition-all",
              theme === 'dark' ? "border-slate-700 hover:border-pink-500/50" : "border-slate-200 hover:border-emerald-500/50"
            )}>
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
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
