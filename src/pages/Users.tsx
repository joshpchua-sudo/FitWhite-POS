import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { User, Plus, Shield, Key, Trash2, Building2 } from 'lucide-react';
import { User as UserType } from '../types';

export function Users() {
  const { theme, branches } = useStore();
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm font-medium">Control access levels and manage staff accounts.</p>
        </div>
        <button className={cn(
          "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
          theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
        )}>
          <Plus size={20} />
          Create Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div 
            key={u.id}
            className={cn(
              "p-6 rounded-3xl border transition-all hover:shadow-xl group",
              theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600"
              )}>
                <User size={24} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <Key size={18} />
                </button>
                <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-black mb-1">{u.username}</h3>
            <div className="flex items-center gap-2 mb-6">
              <Shield size={14} className="text-slate-400" />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                u.role === 'SUPER_ADMIN' ? "bg-purple-50 text-purple-600" : u.role === 'BRANCH_MANAGER' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
              )}>{u.role.replace('_', ' ')}</span>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
              <Building2 size={16} className="text-slate-300" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Branch</span>
                <span className="text-sm font-bold">{branches.find(b => b.id === u.branch_id)?.name || u.branch_id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
