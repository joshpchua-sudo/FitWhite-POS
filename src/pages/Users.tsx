import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { User, Plus, Shield, Key, Trash2, Building2, X, Edit2, Lock } from 'lucide-react';
import { User as UserType } from '../types/index';
import { motion, AnimatePresence } from 'motion/react';

export function Users() {
  const { theme, branches, user: currentUser } = useUserStore();
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newUser, setNewUser] = useState<Partial<UserType>>({
    username: '',
    role: 'CASHIER',
    branch_id: branches[0]?.id || ''
  });

  useEffect(() => {
    apiClient.fetchUsers().then(setUsers);
  }, []);

  const handleSaveUser = async () => {
    if (!newUser.username) return;
    try {
      const data = await apiClient.saveUser(newUser, editingUser?.id);
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? data : u));
      } else {
        setUsers([...users, data]);
      }
      setShowAddModal(false);
      setEditingUser(null);
      setNewUser({ username: '', role: 'CASHIER', branch_id: branches[0]?.id || '' });
    } catch (error) {
      console.error("Failed to save user", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      const res = await apiClient.deleteUser(id);
      if (res.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm font-medium">Control access levels and manage staff accounts.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setNewUser({ username: '', role: 'CASHIER', branch_id: branches[0]?.id || '' }); setShowAddModal(true); }}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
            theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
          )}
        >
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
                <button 
                  onClick={() => { setEditingUser(u); setNewUser(u); setShowAddModal(true); }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteUser(u.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                >
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

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-black text-lg">{editingUser ? 'Edit Account' : 'Create New Account'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
                  <input 
                    type="text" 
                    className={cn(
                      "w-full p-3 rounded-xl border text-sm",
                      theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="password" 
                        className={cn(
                          "w-full pl-12 pr-4 py-3 rounded-xl border text-sm",
                          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                        )}
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</label>
                    <select 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                    >
                      <option value="CASHIER">Cashier</option>
                      <option value="BRANCH_MANAGER">Branch Manager</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign Branch</label>
                    <select 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newUser.branch_id}
                      onChange={e => setNewUser({...newUser, branch_id: e.target.value})}
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleSaveUser}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95",
                    theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
                  )}
                >
                  {editingUser ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
