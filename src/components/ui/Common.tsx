import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Theme } from '../../types';

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  theme?: Theme;
}

export function NavItem({ active, onClick, icon, label, theme }: NavItemProps) {
  const activeClasses = {
    light: "bg-emerald-50 text-emerald-600",
    dark: "bg-pink-900/30 text-pink-400",
    clinic: "bg-pink-50 text-pink-600",
    neopos: "bg-gray-800 text-pink-500"
  };

  const inactiveClasses = {
    light: "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
    dark: "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
    clinic: "text-slate-500 hover:bg-pink-50/50 hover:text-pink-700",
    neopos: "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
  };

  const currentTheme = theme || 'light';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group",
        active ? activeClasses[currentTheme] : inactiveClasses[currentTheme]
      )}
    >
      <span className={cn("transition-colors", active ? "" : "opacity-70 group-hover:opacity-100")}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {active && (
        <motion.div 
          layoutId="active-pill" 
          className={cn("ml-auto w-1.5 h-1.5 rounded-full", currentTheme === 'clinic' ? "bg-pink-600" : "bg-emerald-600")} 
        />
      )}
    </button>
  );
}

interface PaymentOptionProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  theme?: Theme;
}

export function PaymentOption({ active, onClick, icon, label, disabled, theme }: PaymentOptionProps) {
  const currentTheme = theme || 'light';
  
  const activeClasses = {
    light: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    dark: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    clinic: "bg-pink-600 text-white border-pink-600 shadow-sm"
  };

  const inactiveClasses = {
    light: "bg-white text-slate-500 border-slate-200 hover:border-emerald-300",
    dark: "bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500",
    clinic: "bg-white text-slate-500 border-pink-100 hover:border-pink-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all",
        active ? activeClasses[currentTheme] : inactiveClasses[currentTheme],
        disabled && "opacity-40 cursor-not-allowed grayscale"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  theme?: Theme;
}

export function StatCard({ label, value, icon, trend, theme }: StatCardProps) {
  return (
    <div className={cn(
      "p-6 border rounded-2xl shadow-sm transition-colors",
      theme === 'dark' || theme === 'neopos' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
      theme === 'neopos' && "bg-gray-900 border-gray-800"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", theme === 'dark' || theme === 'neopos' ? "bg-slate-800" : "bg-slate-50", theme === 'neopos' && "bg-gray-800")}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-lg",
          theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "text-pink-600 bg-pink-50" : "text-emerald-600 bg-emerald-50"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <h4 className={cn("text-2xl font-black", theme === 'dark' || theme === 'neopos' ? "text-slate-100" : "text-slate-900")}>{value}</h4>
    </div>
  );
}
