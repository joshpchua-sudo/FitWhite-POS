import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { BranchPerformance } from '../types';

export function HQDashboard() {
  const { theme, branches } = useUserStore();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    lowStockAlerts: 0
  });
  const [performance, setPerformance] = useState<BranchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, perfData] = await Promise.all([
          apiClient.fetchHQStats(),
          apiClient.fetchBranchPerformance(period)
        ]);
        setStats(statsData);
        setPerformance(perfData);
      } catch (error) {
        console.error("Failed to fetch HQ data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const StatCard = ({ title, value, icon, trend, color }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-6 rounded-3xl border transition-all shadow-sm",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", color)}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
            trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black tracking-tight">
        {typeof value === 'number' && title.includes('Sales') ? `₱${value.toLocaleString()}` : value.toLocaleString()}
      </h3>
    </motion.div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
              theme === 'clinic' ? "bg-pink-600" : "bg-emerald-600"
            )}>
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">HQ Command Center</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Global oversight and multi-branch performance analytics.</p>
        </div>

        <div className={cn(
          "p-1.5 rounded-2xl flex gap-1 w-full sm:w-auto",
          theme === 'dark' ? "bg-slate-900" : "bg-white border border-slate-100 shadow-sm"
        )}>
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                period === p 
                  ? (theme === 'clinic' ? "bg-pink-600 text-white shadow-md" : "bg-emerald-600 text-white shadow-md")
                  : (theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Global Sales" 
          value={stats.totalSales} 
          icon={<TrendingUp size={20} className="text-emerald-600" />} 
          trend={12}
          color="bg-emerald-50"
        />
        <StatCard 
          title="Total Transactions" 
          value={stats.totalTransactions} 
          icon={<Activity size={20} className="text-blue-600" />} 
          trend={8}
          color="bg-blue-50"
        />
        <StatCard 
          title="Active Customers" 
          value={stats.totalCustomers} 
          icon={<Users size={20} className="text-purple-600" />} 
          trend={15}
          color="bg-purple-50"
        />
        <StatCard 
          title="Stock Alerts" 
          value={stats.lowStockAlerts} 
          icon={<AlertCircle size={20} className="text-rose-600" />} 
          color="bg-rose-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Performance Table */}
        <div className={cn(
          "lg:col-span-2 rounded-3xl border overflow-hidden",
          theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
        )}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black text-lg flex items-center gap-2">
              <Building2 size={20} className="text-slate-400" />
              Branch Performance
            </h3>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={cn(
                  "text-[10px] font-black uppercase tracking-widest border-b",
                  theme === 'dark' ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-50"
                )}>
                  <th className="px-6 py-4">Branch Name</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Transactions</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {performance.map((branch) => (
                  <tr key={branch.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                          theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400"
                        )}>
                          {branch.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold">{branch.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black">₱{branch.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{branch.transactions} orders</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Online</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
          <div className={cn(
            "p-6 rounded-3xl border",
            theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          )}>
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
              <Activity size={20} className="text-slate-400" />
              System Health
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Database Sync', status: 'Optimal', color: 'text-emerald-500' },
                { label: 'API Latency', status: '24ms', color: 'text-emerald-500' },
                { label: 'Cloud Storage', status: '82% Full', color: 'text-amber-500' },
                { label: 'Active Sessions', status: '142', color: 'text-blue-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  <span className={cn("text-[10px] font-black uppercase", item.color)}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-6 rounded-3xl border",
            theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          )}>
            <h3 className="font-black text-lg mb-6">Quick HQ Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Manage Branches', icon: <Building2 size={16} />, color: 'bg-blue-50 text-blue-600' },
                { label: 'Staff Permissions', icon: <ShieldCheck size={16} />, color: 'bg-purple-50 text-purple-600' },
                { label: 'Global Inventory', icon: <Package size={16} />, color: 'bg-amber-50 text-amber-600' },
                { label: 'System Logs', icon: <Calendar size={16} />, color: 'bg-slate-50 text-slate-600' }
              ].map((action, idx) => (
                <button 
                  key={idx}
                  className={cn(
                    "w-full p-4 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-between group transition-all",
                    theme === 'dark' ? "bg-slate-800/50" : "bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", action.color)}>
                      {action.icon}
                    </div>
                    <span className="text-xs font-bold">{action.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
