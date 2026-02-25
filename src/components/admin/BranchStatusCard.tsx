import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Branch, Theme } from '../../types/index';

interface BranchStatusCardProps {
  branch: Branch;
  onClick: () => void;
  theme?: Theme;
}

export const BranchStatusCard: React.FC<BranchStatusCardProps> = ({ branch, onClick, theme }) => {
  const [stats, setStats] = useState({ revenue: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);
  const currentTheme = theme || 'light';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/reports/daily?branchId=${branch.id}`);
        const data = await res.json();
        setStats({ revenue: data.summary.total_revenue, transactions: data.summary.total_transactions });
      } catch (err) {
        console.error('Failed to fetch branch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [branch.id]);

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "p-6 border rounded-2xl text-left transition-all shadow-sm hover:shadow-md group",
        currentTheme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "p-3 rounded-xl transition-colors",
          currentTheme === 'dark' ? "bg-slate-800 group-hover:bg-emerald-900/30" : "bg-slate-50 group-hover:bg-emerald-50"
        )}>
          <Building2 size={24} className={cn(
            "transition-colors",
            currentTheme === 'dark' ? "text-slate-500 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600",
            currentTheme === 'clinic' && "group-hover:text-pink-600"
          )} />
        </div>
        <span className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
          branch.type === 'COMPANY-OWNED' 
            ? (currentTheme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600")
            : "bg-amber-50 text-amber-600"
        )}>
          {branch.type}
        </span>
      </div>
      
      <h3 className={cn("text-lg font-bold mb-1", currentTheme === 'dark' ? "text-slate-200" : "text-slate-800")}>{branch.name}</h3>
      <p className="text-xs text-slate-500 mb-6">ID: {branch.id}</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue Today</p>
          <p className={cn("text-sm font-black", currentTheme === 'dark' ? "text-slate-100" : "text-slate-900")}>
            {loading ? '...' : `₱${stats.revenue.toLocaleString()}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Orders</p>
          <p className={cn("text-sm font-black", currentTheme === 'dark' ? "text-slate-100" : "text-slate-900")}>
            {loading ? '...' : stats.transactions}
          </p>
        </div>
      </div>

      <div className={cn(
        "mt-6 pt-6 border-t flex items-center justify-between transition-colors",
        currentTheme === 'dark' ? "border-slate-800 text-emerald-400" : "border-slate-50 text-emerald-600",
        currentTheme === 'clinic' && "text-pink-600"
      )}>
        <span className="text-xs font-bold">View Detailed Report</span>
        <ChevronRight size={16} />
      </div>
    </motion.button>
  );
};
