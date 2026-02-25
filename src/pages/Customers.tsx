import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/useCartStore';
import { apiClient } from '../api/apiClient';
import { cn } from '../lib/utils';
import { Users, Plus, Search, Mail, Smartphone, History, Trash2, Wallet, X, Calendar, MapPin } from 'lucide-react';
import { Customer, Treatment } from '../types/index';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export function Customers() {
  const { theme, selectedBranchId } = useUserStore();
  const { customers, setCustomers } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<Treatment[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    allergies: '',
    notes: ''
  });

  useEffect(() => {
    apiClient.fetchCustomers(selectedBranchId).then(setCustomers);
  }, [selectedBranchId]);

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCustomer, branch_id: selectedBranchId })
      });
      const data = await res.json();
      setCustomers([...customers, data]);
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', phone: '', allergies: '', notes: '' });
    } catch (error) {
      console.error("Failed to add customer", error);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete customer", error);
    }
  };

  const viewHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowHistoryModal(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/history`);
      const data = await res.json();
      setCustomerHistory(data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Customer Relations</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your client database and treatment history.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
            theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
          )}
        >
          <Plus size={20} />
          Add New Customer
        </button>
      </div>

      <div className={cn(
        "rounded-3xl border overflow-hidden",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all",
                theme === 'dark' ? "bg-slate-800 border-slate-700 focus:ring-2 focus:ring-pink-500/20" : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500/20"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "text-[10px] font-black uppercase tracking-widest border-b",
                theme === 'dark' ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-50"
              )}>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Store Credit</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                        theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400"
                      )}>
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-bold block">{customer.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{customer.id.toString().padStart(4, '0')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={12} />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Smartphone size={12} />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-emerald-500" />
                      <span className="text-sm font-black text-emerald-600">₱{customer.store_credit.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500">{new Date(customer.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => viewHistory(customer)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
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
                <h3 className="font-black text-lg">Add New Customer</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newCustomer.name}
                      onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text" 
                      className={cn(
                        "w-full p-3 rounded-xl border text-sm",
                        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    className={cn(
                      "w-full p-3 rounded-xl border text-sm",
                      theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                    value={newCustomer.email}
                    onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allergies / Medical Notes</label>
                  <textarea 
                    className={cn(
                      "w-full p-3 rounded-xl border text-sm h-24",
                      theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                    value={newCustomer.allergies}
                    onChange={e => setNewCustomer({...newCustomer, allergies: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleAddCustomer}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95",
                    theme === 'clinic' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
                  )}
                >
                  SAVE CUSTOMER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl",
                    theme === 'clinic' ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{selectedCustomer.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Treatment & Purchase History</p>
                  </div>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                {customerHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No history found for this customer.</p>
                  </div>
                ) : (
                  customerHistory.map(item => (
                    <div key={item.id} className={cn(
                      "p-4 rounded-2xl border",
                      theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm">{item.treatment_name}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                          <MapPin size={10} />
                          {item.branch_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          {format(new Date(item.timestamp), 'hh:mm a')}
                        </div>
                      </div>
                      {item.notes && <p className="mt-2 text-xs text-slate-600 italic">"{item.notes}"</p>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
