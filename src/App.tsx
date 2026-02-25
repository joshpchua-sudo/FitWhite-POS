import React, { useEffect } from 'react';
import { useUserStore } from './store/userStore';
import { useCartStore } from './store/useCartStore';
import { apiClient } from './api/apiClient';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/auth/Login';
import { POSScreen as POS } from './components/pos/POSScreen';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { History } from './pages/History';
import { Customers } from './pages/Customers';
import { Bundles } from './pages/Bundles';
import { Branches } from './pages/Branches';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { 
    user, 
    setUser,
    currentView, 
    theme, 
    setBranches, 
    setIsOnline, 
    isSidebarOpen, 
    setIsSidebarOpen
  } = useUserStore();

  const {
    offlineSales,
    setOfflineSales
  } = useCartStore();

  useEffect(() => {
    // Initial data fetch
    apiClient.fetchBranches().then(setBranches);

    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline sales when online
  useEffect(() => {
    if (navigator.onLine && offlineSales.length > 0) {
      apiClient.syncOfflineSales(offlineSales).then(result => {
        if (result && Array.isArray(result)) {
          setOfflineSales([]);
        }
      });
    }
  }, [offlineSales]);

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'reports': return <Reports />;
      case 'history': return <History />;
      case 'customers': return <Customers />;
      case 'bundles': return <Bundles />;
      case 'branches': return <Branches />;
      case 'users': return <Users />;
      case 'settings': return <Settings />;
      default: return <POS />;
    }
  };

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-300",
      theme === 'dark' || theme === 'neopos' ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
      theme === 'clinic' && "bg-[#FFF0F5]"
    )}>
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 lg:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onLogout={() => setUser(null)}
        />
        
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
