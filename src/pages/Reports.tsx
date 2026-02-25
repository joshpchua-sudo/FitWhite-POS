import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { salesApi } from '../api/sales';
import { cn } from '../lib/utils';
import { BarChart3, TrendingUp, ShoppingBag, Download, Calendar, Trophy } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format } from 'date-fns';

export function Reports() {
  const { theme, selectedBranchId, summary, setSummary, branchPerformance, setBranchPerformance, branches } = useStore();
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    salesApi.getDailyReports(selectedBranchId).then(data => {
      setSummary(data.summary);
    });
    salesApi.getPerformance(reportPeriod).then(setBranchPerformance);
  }, [selectedBranchId, reportPeriod]);

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Business Intelligence</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time performance metrics and sales analytics.</p>
        </div>
        <div className="flex gap-2">
          <button className={cn(
            "px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all",
            theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}>
            <Download size={16} />
            Export PDF
          </button>
          <button className={cn(
            "px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all",
            theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Total Revenue" 
          value={`₱${summary.total_revenue.toLocaleString()}`} 
          trend="+12.5%" 
          color="emerald" 
          theme={theme} 
        />
        <StatCard 
          icon={<ShoppingBag size={24} />} 
          label="Transactions" 
          value={summary.total_transactions.toString()} 
          trend="+5.2%" 
          color="blue" 
          theme={theme} 
        />
        <StatCard 
          icon={<BarChart3 size={24} />} 
          label="Avg. Ticket" 
          value={`₱${(summary.total_revenue / (summary.total_transactions || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          trend="-2.1%" 
          color="pink" 
          theme={theme} 
        />
        <StatCard 
          icon={<Trophy size={24} />} 
          label="Top Branch" 
          value={branchPerformance[0]?.name || 'N/A'} 
          trend="Leader" 
          color="amber" 
          theme={theme} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className={cn(
          "lg:col-span-2 p-8 rounded-3xl border",
          theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
        )}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-lg">Branch Performance</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    reportPeriod === p 
                      ? (theme === 'clinic' ? "bg-pink-600 text-white shadow-md" : "bg-emerald-600 text-white shadow-md")
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: theme === 'dark' ? '#64748b' : '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: theme === 'dark' ? '#64748b' : '#94a3b8' }}
                  tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="revenue" radius={[10, 10, 10, 10]} barSize={40}>
                  {branchPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? (theme === 'clinic' ? '#db2777' : '#059669') : (theme === 'dark' ? '#334155' : '#e2e8f0')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers List */}
        <div className={cn(
          "p-8 rounded-3xl border",
          theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
        )}>
          <h3 className="font-black text-lg mb-6">Top Branches</h3>
          <div className="space-y-6">
            {branchPerformance.map((branch, idx) => (
              <div key={branch.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                    idx === 0 
                      ? (theme === 'clinic' ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-600")
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{branch.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{branch.transactions} sales</p>
                  </div>
                </div>
                <span className="text-sm font-black">₱{branch.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color, theme }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
  };

  return (
    <div className={cn(
      "p-6 rounded-3xl border transition-all hover:scale-[1.02]",
      theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-black px-2 py-1 rounded-lg",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>{trend}</span>
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
    </div>
  );
}
