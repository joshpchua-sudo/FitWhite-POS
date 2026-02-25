import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

export function Login() {
  const { setUser, setSelectedBranchId } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
        setSelectedBranchId(user.branch_id);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-pink-100 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#880E4F]">FitWhite Clinic</h1>
          <p className="text-pink-600 font-medium">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 text-[#880E4F] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-pink-200"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 text-[#880E4F] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-pink-200"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm font-medium">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-pink-50 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Contact administrator if you forgot your credentials.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
