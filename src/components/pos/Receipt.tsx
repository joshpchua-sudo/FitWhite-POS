import React from 'react';
import { Sale, CartItem, Branch } from '../../types/index';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { CheckCircle2, Printer, Download, X } from 'lucide-react';

interface ReceiptProps {
  sale: Partial<Sale> & { items_list?: CartItem[] };
  branch: Branch;
  onClose: () => void;
  onPrint: () => void;
}

export function Receipt({ sale, branch, onClose, onPrint }: ReceiptProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-emerald-600 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-black">Payment Successful</h3>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Transaction #{sale.id || '0000'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 text-slate-800 font-mono text-sm">
          <div className="text-center mb-6">
            <h4 className="font-black text-lg uppercase">FitWhite</h4>
            <p className="text-[10px] font-bold text-slate-500">{branch.name}</p>
            <p className="text-[10px] text-slate-400">{format(new Date(), 'MMM dd, yyyy • hh:mm a')}</p>
          </div>

          <div className="border-t border-dashed border-slate-200 py-4 space-y-2">
            {sale.items_list?.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-4">
                <span className="flex-1">
                  {item.quantity}x {item.name}
                  {item.variantName && <span className="block text-[10px] text-slate-500">({item.variantName})</span>}
                </span>
                <span className="font-bold">₱{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-200 pt-4 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{((sale.total_amount || 0) + (sale.discount_amount || 0)).toLocaleString()}</span>
            </div>
            {(sale.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount</span>
                <span>-₱{sale.discount_amount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg pt-2">
              <span>TOTAL</span>
              <span>₱{(sale.total_amount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method: {sale.payment_method}</p>
            <p className="text-[10px] text-slate-400 mt-4 italic">Thank you for choosing FitWhite!</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex gap-3">
          <button 
            onClick={onPrint}
            className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Printer size={18} />
            Print
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
