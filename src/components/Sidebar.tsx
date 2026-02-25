import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  CheckCircle2, 
  Users,
  Tag,
  Building2,
  Globe,
  User,
  History,
  Settings,
  Moon,
  Palette,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { NavItem } from './ui/Common';
import { Branch, Theme, View, User as UserType } from '../types';
import { useStore } from '../store/useStore';

export function Sidebar() {
  const { 
    user, 
    currentView, 
    setCurrentView, 
    theme, 
    setTheme, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    branches, 
    selectedBranchId, 
    setSelectedBranchId 
  } = useStore();

  if (!user) return null;

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const sidebarClasses = {
    light: "bg-white border-slate-200",
    dark: "bg-slate-900 border-slate-800",
    clinic: "bg-white border-pink-100",
    neopos: "bg-gray-900 border-gray-800"
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-all duration-300 lg:relative lg:translate-x-0 transform",
        sidebarClasses[theme],
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors",
                theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
              )}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">FitWhite</h1>
                <p className={cn("text-[10px] font-bold uppercase tracking-wider", theme === 'dark' || theme === 'neopos' ? "text-pink-400" : "text-slate-500")}>POS System</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Theme Style</label>
            <div className="flex gap-2 px-2">
              <button 
                onClick={() => setTheme('dark')}
                className={cn("p-2 rounded-lg border transition-all", theme === 'dark' ? "bg-slate-800 border-pink-500 shadow-sm" : "bg-slate-50 border-transparent")}
              >
                <Moon size={16} className="text-pink-400" />
              </button>
              <button 
                onClick={() => setTheme('clinic')}
                className={cn("p-2 rounded-lg border transition-all", theme === 'clinic' ? "bg-pink-50 border-pink-500 shadow-sm" : "bg-slate-50 border-transparent")}
              >
                <Palette size={16} className="text-pink-500" />
              </button>
            </div>
          </div>

          {user.role === 'SUPER_ADMIN' && (
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Monitoring Branch</label>
              <div className="px-2">
                <select 
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className={cn(
                    "w-full p-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2",
                    theme === 'dark' || theme === 'neopos' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-pink-500/20" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20"
                  )}
                >
                  <option value="Admin">All Branches (HQ)</option>
                  <optgroup label="Company Owned">
                    {branches.filter(b => b.type === 'COMPANY-OWNED' && b.id !== 'Admin').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Managed">
                    {branches.filter(b => b.type === 'MANAGED').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            <NavItem active={currentView === 'pos'} onClick={() => { setCurrentView('pos'); setIsSidebarOpen(false); }} icon={<ShoppingCart size={20} />} label="Terminal" theme={theme} />
            <NavItem active={currentView === 'customers'} onClick={() => { setCurrentView('customers'); setIsSidebarOpen(false); }} icon={<Users size={20} />} label="Customers" theme={theme} />
            {(user.role === 'SUPER_ADMIN' || user.role === 'BRANCH_MANAGER') && (
              <>
                <NavItem active={currentView === 'bundles'} onClick={() => { setCurrentView('bundles'); setIsSidebarOpen(false); }} icon={<Tag size={20} />} label="Bundles" theme={theme} />
                <NavItem active={currentView === 'inventory'} onClick={() => { setCurrentView('inventory'); setIsSidebarOpen(false); }} icon={<Package size={20} />} label="Inventory" theme={theme} />
                <NavItem active={currentView === 'reports'} onClick={() => { setCurrentView('reports'); setIsSidebarOpen(false); }} icon={<BarChart3 size={20} />} label="Reports" theme={theme} />
              </>
            )}
            {user.role === 'SUPER_ADMIN' && (
              <>
                <NavItem active={currentView === 'branches'} onClick={() => { setCurrentView('branches'); setIsSidebarOpen(false); }} icon={<Building2 size={20} />} label="Branch Monitor" theme={theme} />
                <NavItem active={currentView === 'users'} onClick={() => { setCurrentView('users'); setIsSidebarOpen(false); }} icon={<User size={20} />} label="Users" theme={theme} />
              </>
            )}
            <NavItem active={currentView === 'history'} onClick={() => { setCurrentView('history'); setIsSidebarOpen(false); }} icon={<History size={20} />} label="History" theme={theme} />
            {user.role === 'SUPER_ADMIN' && (
              <NavItem active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }} icon={<Settings size={20} />} label="Settings" theme={theme} />
            )}
          </nav>
        </div>

        <div className={cn("mt-auto p-6 border-t", theme === 'dark' || theme === 'neopos' ? "border-slate-800" : "border-slate-100")}>
          <div className={cn(
            "mb-4 px-2 py-1 rounded-lg inline-flex items-center gap-2",
            theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "bg-pink-50" : "bg-emerald-50"
          )}>
            <Globe size={12} className={theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "text-pink-600" : "text-emerald-600"} />
            <span className={cn(
              "text-[10px] font-black uppercase",
              theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "text-pink-700" : "text-emerald-700"
            )}>{selectedBranchId === 'Admin' ? 'HQ Central' : currentBranch.name}</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className={cn("flex items-center gap-3 p-3 rounded-xl", theme === 'dark' || theme === 'neopos' ? "bg-slate-800" : "bg-slate-50", theme === 'neopos' && "bg-gray-800")}>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-slate-600" />
              </div>
              <div className="overflow-hidden text-left">
                <p className={cn("text-sm font-semibold truncate", (theme === 'dark' || theme === 'neopos') && "text-slate-200")}>{user.username}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
