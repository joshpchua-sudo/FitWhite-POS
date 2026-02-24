import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { User as UserType, Theme } from '../types';

interface UserManagementProps {
  theme: Theme;
}

export function UserManagement({ theme }: UserManagementProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      if (res.ok) {
        alert('User updated successfully');
        setEditingUser(null);
        setNewPassword('');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm">Manage login credentials for managers and cashiers.</p>
        </div>
      </div>

      <div className={cn(
        "border rounded-2xl shadow-sm overflow-hidden",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn("border-b", theme === 'dark' ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200")}>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Username</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Branch</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y", theme === 'dark' ? "divide-slate-800" : "divide-slate-100")}>
            {users.map(u => (
              <tr key={u.id} className={theme === 'dark' ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50"}>
                <td className={cn("px-6 py-4 font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{u.username}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    u.role === 'SUPER_ADMIN' ? "bg-violet-50 text-violet-600" : 
                    u.role === 'BRANCH_MANAGER' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{u.branch_name || 'HQ'}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => {
                      setEditingUser(u);
                      setNewUsername(u.username);
                      setNewPassword('');
                    }}
                    className={cn(
                      "text-xs font-bold hover:underline",
                      theme === 'clinic' ? "text-pink-600" : "text-emerald-600"
                    )}
                  >
                    Edit Credentials
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full max-w-md p-8 rounded-3xl shadow-2xl",
              theme === 'dark' ? "bg-slate-900 border border-slate-800" : "bg-white"
            )}
          >
            <h3 className={cn("text-xl font-bold mb-2", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>Edit Credentials</h3>
            <p className="text-slate-500 text-sm mb-6">Updating credentials for <span className="font-bold text-slate-700">{editingUser.username}</span></p>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Username</label>
                <input 
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                    theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-pink-500/20 focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                    theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-pink-500/20 focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                  )}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-all",
                    theme === 'dark' ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50",
                    theme === 'clinic' || theme === 'dark' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  )}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
