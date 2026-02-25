import React from 'react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react';
import { PaymentMethod } from '../../types';

export function PaymentOptions() {
  const { paymentMethod, setPaymentMethod, theme } = useStore();

  const methods: { id: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { id: 'Cash', icon: <Banknote size={20} />, label: 'Cash' },
    { id: 'Card', icon: <CreditCard size={20} />, label: 'Card' },
    { id: 'GCash', icon: <QrCode size={20} />, label: 'GCash' },
    { id: 'Store Credit', icon: <Wallet size={20} />, label: 'Credit' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {methods.map((method) => (
        <button
          key={method.id}
          onClick={() => setPaymentMethod(method.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
            paymentMethod === method.id
              ? (theme === 'clinic' ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200" : "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200")
              : (theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300")
          )}
        >
          {method.icon}
          <span className="text-[10px] font-black uppercase tracking-tighter">{method.label}</span>
        </button>
      ))}
    </div>
  );
}
