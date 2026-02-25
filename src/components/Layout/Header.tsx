import React from 'react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Menu, Globe, AlertTriangle, LogOut, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ onMenuClick, onLogout }: HeaderProps) {
  const { theme, isOnline, notifications, offlineSales, user, branches, selectedBranchId } = useStore();
  
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <header className={cn(
      "h-20 border-b flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md",
      theme === 'dark' || theme === 'neopos' ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-100"
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="font-black text-lg tracking-tight">
            {format(new Date(), 'EEEE, MMMM dd')}
          </h2>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isOnline ? "bg-emerald-500" : "bg-rose-500")} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isOnline ? 'System Online' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        {!isOnline && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg animate-pulse">
              <Globe size={12} />
              OFFLINE
            </div>
            {offlineSales.length > 0 && (
              <div className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                <Bell size={10} className="animate-bounce" />
                {offlineSales.length} PENDING
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button className={cn(
            "p-2 rounded-xl transition-colors relative",
            theme === 'dark' || theme === 'neopos' ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
          )}>
            <Bell size={20} />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>
          
          <div className={cn("hidden lg:block h-8 w-[1px]", theme === 'dark' || theme === 'neopos' ? "bg-slate-800" : "bg-slate-100")} />
          
          <button 
            onClick={onLogout}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all",
              theme === 'dark' || theme === 'neopos' ? "text-slate-400 hover:bg-rose-500/10 hover:text-rose-500" : "text-slate-500 hover:bg-rose-50 hover:text-rose-500"
            )}
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
