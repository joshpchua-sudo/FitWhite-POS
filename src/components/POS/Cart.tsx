import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, subtotal, discountAmount, total } = useCart();
  const { theme } = useStore();

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={32} className="opacity-20" />
        </div>
        <p className="text-sm font-medium">Your cart is empty</p>
        <p className="text-[10px] uppercase tracking-widest font-bold mt-1">Add items to start</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div 
            key={`${item.id}-${item.isBundle ? 'b' : 'p'}-${item.variantId || ''}`}
            className={cn(
              "p-3 rounded-2xl border flex items-center gap-3 group transition-all",
              theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
            )}
          >
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold truncate">{item.name}</h5>
              {item.variantName && (
                <p className="text-[10px] text-pink-500 font-bold uppercase">{item.variantName}</p>
              )}
              <p className="text-xs font-black text-slate-500">₱{item.price.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                <button 
                  onClick={() => updateQuantity(item.id, -1, item.isBundle, item.variantId)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1, item.isBundle, item.variantId)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              <button 
                onClick={() => removeFromCart(item.id, item.isBundle, item.variantId)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        "p-6 border-t space-y-3",
        theme === 'dark' ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"
      )}>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Subtotal</span>
          <span className="font-bold">₱{subtotal.toLocaleString()}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-rose-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Discount</span>
            <span className="font-bold">-₱{discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-end pt-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total Amount</span>
          <span className={cn(
            "text-2xl font-black",
            theme === 'clinic' ? "text-pink-600" : "text-emerald-600"
          )}>₱{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
