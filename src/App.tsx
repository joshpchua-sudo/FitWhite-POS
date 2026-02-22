import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  ChevronRight,
  User,
  CreditCard,
  Banknote,
  QrCode,
  History,
  RotateCcw,
  AlertTriangle,
  Users,
  Gift,
  Tag,
  Mail,
  Smartphone,
  Percent,
  Wallet,
  Building2,
  Globe,
  LogOut,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
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
import { cn } from './lib/utils';
import { Product, CartItem, Sale, DailySummary, User as UserType, Customer, Bundle, ProductVariant, Branch } from './types';

type View = 'pos' | 'inventory' | 'reports' | 'history' | 'customers' | 'bundles' | 'branches';
type PaymentMethod = 'Cash' | 'GCash' | 'Card' | 'QRPH' | 'Store Credit';
type Theme = 'light' | 'dark' | 'clinic' | 'neopos';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [theme, setTheme] = useState<Theme>('clinic');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('Admin');
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [inventoryTab, setInventoryTab] = useState<'services' | 'products' | 'low-stock'>('products');
  const [dailySales, setDailySales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<DailySummary>({ total_revenue: 0, total_transactions: 0 });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });
  const [receiptTo, setReceiptTo] = useState('');
  const [sendReceipt, setSendReceipt] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', store_credit: 0 });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Product',
    price: 0,
    stockToAdd: 0,
    unit: 'pcs'
  });
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleForm, setBundleForm] = useState({
    name: '',
    price: 0,
    items: [] as { productId: number, quantity: number, name: string }[]
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchBranches();
      fetchProducts();
      fetchBundles();
      fetchCustomers();
      fetchDailyReports();
    }
  }, [currentView, user, selectedBranchId]);

  // Real-time polling for HQ
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      const pollInterval = setInterval(() => {
        fetchDailyReports();
      }, 10000); // Poll every 10 seconds
      return () => clearInterval(pollInterval);
    }
  }, [user, selectedBranchId]);

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      setBranches(data);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/bundles');
      const data = await res.json();
      setBundles(data);
    } catch (err) {
      console.error('Failed to fetch bundles', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?branchId=${selectedBranchId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchDailyReports = async () => {
    try {
      const res = await fetch(`/api/reports/daily?branchId=${selectedBranchId}`);
      const data = await res.json();
      setDailySales(data.sales);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });
      
      if (res.ok) {
        setShowCustomerModal(false);
        setEditingCustomer(null);
        setCustomerForm({ name: '', email: '', phone: '', store_credit: 0 });
        fetchCustomers();
      }
    } catch (err) {
      console.error('Failed to save customer', err);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    setConfirmModal({
      show: true,
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer profile? This will not delete their transaction history.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
          if (res.ok) {
            alert('Customer profile deleted successfully');
            await fetchCustomers();
          } else {
            const data = await res.json();
            alert(data.error || 'Failed to delete customer');
          }
        } catch (err) {
          console.error('Failed to delete customer', err);
          alert('An error occurred while deleting the customer.');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleDeleteBundle = async (id: number) => {
    setConfirmModal({
      show: true,
      title: 'Delete Bundle',
      message: 'Are you sure you want to delete this bundle?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/bundles/${id}`, { method: 'DELETE' });
          if (res.ok) {
            alert('Bundle deleted successfully');
            await fetchBundles();
          } else {
            const data = await res.json();
            alert(data.error || 'Failed to delete bundle');
          }
        } catch (err) {
          console.error('Failed to delete bundle', err);
          alert('An error occurred while deleting the bundle.');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const openCustomerModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({ 
        name: customer.name, 
        email: customer.email || '', 
        phone: customer.phone || '', 
        store_credit: customer.store_credit 
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({ name: '', email: '', phone: '', store_credit: 0 });
    }
    setShowCustomerModal(true);
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        stockToAdd: 0,
        unit: product.unit
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'Product',
        price: 0,
        stockToAdd: 0,
        unit: 'pcs'
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          id: editingProduct?.id,
          branchId: selectedBranchId
        })
      });
      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', category: 'Product', price: 0, stockToAdd: 0, unit: 'pcs' });
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bundleForm.items.length === 0) {
      alert('Please add at least one item to the bundle');
      return;
    }
    try {
      const res = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundleForm)
      });
      if (res.ok) {
        setShowBundleModal(false);
        setBundleForm({ name: '', price: 0, items: [] });
        fetchBundles();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save bundle');
      }
    } catch (err) {
      console.error('Failed to save bundle', err);
    }
  };

  const addToCart = (product: Product, variant?: ProductVariant) => {
    if (product.category !== 'Service' && product.stock <= 0) {
      alert(`Sorry, ${product.name} is out of stock.`);
      return;
    }

    if (!variant && product.variants && product.variants.length > 0) {
      // If product has variants but none selected, don't add yet (UI will handle selection)
      return;
    }

    const stock = variant ? variant.stock : product.stock;
    const cartItem = cart.find(item => (variant ? item.variantId === variant.id : item.id === product.id && !item.variantId));
    const currentQty = cartItem ? cartItem.quantity : 0;

    if (product.category !== 'Service' && currentQty >= stock) {
      alert(`Cannot add more. Only ${stock} items available in stock.`);
      return;
    }
    
    setCart(prev => {
      const cartId = variant ? `${product.id}-${variant.id}` : `${product.id}`;
      const existing = prev.find(item => (variant ? item.variantId === variant.id : item.id === product.id && !item.variantId));
      
      if (existing) {
        return prev.map(item => 
          (variant ? item.variantId === variant.id : item.id === product.id && !item.variantId) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }

      const price = variant ? product.price + variant.price_adjustment : product.price;
      return [...prev, { 
        ...product, 
        price, 
        quantity: 1, 
        variantId: variant?.id, 
        variantName: variant?.name 
      }];
    });
  };

  const addBundleToCart = (bundle: Bundle) => {
    // Check if any product in bundle is out of stock
    const outOfStockItem = bundle.items.find(item => {
      const product = products.find(p => p.name === item.name);
      return product && product.category !== 'Service' && product.stock < item.quantity;
    });

    if (outOfStockItem) {
      alert(`Cannot add bundle: ${outOfStockItem.name} is out of stock or has insufficient quantity.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === bundle.id && item.isBundle);
      if (existing) {
        return prev.map(item => 
          (item.id === bundle.id && item.isBundle) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        id: bundle.id, 
        name: bundle.name, 
        price: bundle.price, 
        category: 'Bundle', 
        stock: 999, 
        unit: 'pkg', 
        quantity: 1, 
        isBundle: true 
      } as CartItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => {
      const id = item.isBundle ? `b-${item.id}` : (item.variantId ? `${item.id}-${item.variantId}` : `${item.id}`);
      return id !== cartItemId;
    }));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      const id = item.isBundle ? `b-${item.id}` : (item.variantId ? `${item.id}-${item.variantId}` : `${item.id}`);
      if (id === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        
        // Stock check for products
        if (!item.isBundle && item.category !== 'Service' && delta > 0) {
          if (newQty > item.stock) {
            alert(`Only ${item.stock} items available in stock.`);
            return item;
          }
        }
        
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedDiscount = discountType === 'percent' 
    ? (cartSubtotal * (discount / 100)) 
    : discount;
  const cartTotal = Math.max(0, cartSubtotal - calculatedDiscount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Frontend stock check
    for (const item of cart) {
      if (item.isBundle) {
        const bundle = bundles.find(b => b.id === item.id);
        if (bundle) {
          for (const bi of bundle.items) {
            const product = products.find(p => p.name === bi.name);
            if (product && product.category !== 'Service' && (bi.quantity * item.quantity) > product.stock) {
              alert(`Insufficient stock for ${product.name} in bundle ${bundle.name}. Available: ${product.stock}`);
              return;
            }
          }
        }
      } else if (item.category !== 'Service' && item.quantity > item.stock) {
        alert(`Insufficient stock for ${item.name}. Available: ${item.stock}`);
        return;
      }
    }

    setLoading(true);
    try {
      const regularItems = cart.filter(i => !i.isBundle);
      const bundleItems = cart.filter(i => i.isBundle);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: regularItems, 
          bundles: bundleItems,
          total: cartTotal, 
          discount: calculatedDiscount,
          paymentMethod,
          customerId: selectedCustomer?.id,
          receiptTo: sendReceipt ? receiptTo : null,
          branchId: selectedBranchId
        })
      });
      if (res.ok) {
        setCart([]);
        setDiscount(0);
        setSelectedCustomer(null);
        setReceiptTo('');
        setSendReceipt(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchProducts();
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.error || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (saleId: number, refundToStoreCredit: boolean = false) => {
    setConfirmModal({
      show: true,
      title: 'Process Refund',
      message: `Are you sure you want to refund this transaction?${refundToStoreCredit ? ' Refund will be added to store credit.' : ''}`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/sales/${saleId}/refund`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refundToStoreCredit })
          });
          if (res.ok) {
            alert('Refund processed successfully');
            fetchDailyReports();
            fetchProducts();
            fetchCustomers();
          } else {
            const data = await res.json();
            alert(data.error || 'Refund failed');
          }
        } catch (err) {
          console.error('Refund failed', err);
          alert('An error occurred while processing the refund.');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = products.filter(p => p.category !== 'Service' && p.stock <= 100);

  const onLoginSuccess = (userData: UserType) => {
    setUser(userData);
    if (userData.role === 'SUPER_ADMIN') {
      setSelectedBranchId('Admin');
    } else {
      setSelectedBranchId(userData.branch_id);
    }
  };

  if (!user) {
    return <Login onLogin={onLoginSuccess} />;
  }

  const currentBranch = branches.find(b => b.id === selectedBranchId) || { name: 'Centralized', type: 'HQ' };

  const themeClasses = {
    light: "bg-[#F8FAFC] text-slate-900",
    dark: "bg-slate-950 text-slate-100",
    clinic: "bg-[#FFF0F5] text-[#880E4F]",
    neopos: "bg-gray-950 text-gray-100"
  };

  const sidebarClasses = {
    light: "bg-white border-slate-200",
    dark: "bg-slate-900 border-slate-800",
    clinic: "bg-white border-pink-100",
    neopos: "bg-gray-900 border-gray-800"
  };

  return (
    <div className={cn("flex h-screen font-sans overflow-hidden transition-colors duration-300", themeClasses[theme])}>
      {/* Sidebar */}
      <aside className={cn("w-64 border-r flex flex-col transition-colors duration-300", sidebarClasses[theme])}>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors",
              theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "bg-pink-600 shadow-pink-200" : "bg-emerald-600 shadow-emerald-200"
            )}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">FitWhite</h1>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider", theme === 'dark' || theme === 'neopos' ? "text-pink-400" : "text-slate-500")}>NeoPOS System</p>
            </div>
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
            <NavItem active={currentView === 'pos'} onClick={() => setCurrentView('pos')} icon={<ShoppingCart size={20} />} label="Terminal" theme={theme} />
            <NavItem active={currentView === 'customers'} onClick={() => setCurrentView('customers')} icon={<Users size={20} />} label="Customers" theme={theme} />
            <NavItem active={currentView === 'bundles'} onClick={() => setCurrentView('bundles')} icon={<Tag size={20} />} label="Bundles" theme={theme} />
            <NavItem active={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} icon={<Package size={20} />} label="Inventory" theme={theme} />
            <NavItem active={currentView === 'reports'} onClick={() => setCurrentView('reports')} icon={<BarChart3 size={20} />} label="Reports" theme={theme} />
            {user.role === 'SUPER_ADMIN' && (
              <NavItem active={currentView === 'branches'} onClick={() => setCurrentView('branches')} icon={<Building2 size={20} />} label="Branch Monitor" theme={theme} />
            )}
            <NavItem active={currentView === 'history'} onClick={() => setCurrentView('history')} icon={<History size={20} />} label="History" theme={theme} />
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-8 transition-colors duration-300",
          theme === 'dark' || theme === 'neopos' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
          theme === 'neopos' && "bg-gray-900 border-gray-800"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-lg font-bold", theme === 'dark' || theme === 'neopos' ? "text-slate-200" : "text-slate-800")}>
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h2>
            <div className={cn("h-4 w-[1px]", theme === 'dark' || theme === 'neopos' ? "bg-slate-800" : "bg-slate-200")} />
            <p className="text-xs text-slate-500 font-medium">
              {currentBranch.name} ({currentBranch.type})
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className={cn("text-sm font-bold tracking-wider", theme === 'dark' || theme === 'neopos' ? "text-pink-400" : "text-slate-700")}>
                {format(currentTime, 'HH:mm:ss')}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {format(currentTime, 'EEE, MMM do, yyyy')}
              </p>
            </div>
            <button 
              onClick={() => setUser(null)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95",
                theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              )}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'pos' && (
            <motion.div 
              key="pos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Product Grid */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">New Transaction</h2>
                  <div className="flex gap-4">
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder="Search services or products..."
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm",
                          theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-500" : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500"
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bundles Section */}
                {bundles.length > 0 && searchQuery === '' && (
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Gift size={16} />
                      Special Bundles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bundles.map(bundle => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={bundle.id}
                          onClick={() => addBundleToCart(bundle)}
                          className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-400 rounded-2xl text-left transition-all shadow-lg hover:shadow-emerald-200 group relative overflow-hidden text-white"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="px-2.5 py-1 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              Bundle
                            </span>
                            <span className="text-lg font-bold">₱{bundle.price.toLocaleString()}</span>
                          </div>
                          <h3 className="font-bold mb-1">{bundle.name}</h3>
                          <p className="text-[10px] opacity-80 line-clamp-2">
                            {bundle.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <Plus size={18} />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Products & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="group">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "p-5 border rounded-2xl text-left transition-all shadow-sm hover:shadow-md relative overflow-hidden",
                              theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                              product.stock <= 0 && product.category !== 'Service' && "opacity-50 grayscale cursor-not-allowed"
                            )}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                product.category === 'Service' 
                                  ? (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600")
                                  : (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600")
                              )}>
                                {product.category}
                              </span>
                              <span className={cn("text-lg font-bold", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>₱{product.price.toLocaleString()}</span>
                            </div>
                            <h3 className={cn(
                              "font-bold mb-1 transition-colors",
                              theme === 'dark' ? "text-slate-200 group-hover:text-emerald-400" : "text-slate-800 group-hover:text-emerald-600",
                              theme === 'clinic' && "group-hover:text-pink-600"
                            )}>{product.name}</h3>
                            <p className={cn(
                              "text-xs",
                              product.category !== 'Service' && product.stock <= 100 ? "text-rose-500 font-bold" : "text-slate-500"
                            )}>
                              {product.category === 'Service' ? 'Available' : (
                                <>
                                  {product.stock} {product.unit} left
                                  {product.stock <= 100 && <span className="ml-2 text-[10px] uppercase tracking-tighter bg-rose-100 text-rose-600 px-1 rounded">Low Stock</span>}
                                </>
                              )}
                            </p>

                            {product.variants && product.variants.length > 0 ? (
                              <div className="mt-4 space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Variant:</p>
                                <div className="flex flex-wrap gap-2">
                                  {product.variants.map(v => (
                                    <button
                                      key={v.id}
                                      onClick={() => addToCart(product, v)}
                                      disabled={v.stock <= 0}
                                      className={cn(
                                        "px-2 py-1 border rounded-lg text-[10px] font-bold transition-all disabled:opacity-50",
                                        theme === 'dark' 
                                          ? "bg-slate-800 border-slate-700 hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-800" 
                                          : "bg-slate-50 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200",
                                        theme === 'clinic' && "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                                      )}
                                    >
                                      {v.name} (+₱{v.price_adjustment})
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0 && product.category !== 'Service'}
                                className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                                  theme === 'clinic' ? "bg-pink-600" : "bg-emerald-600"
                                )}>
                                  <Plus size={18} />
                                </div>
                              </button>
                            )}
                          </motion.div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Cart Sidebar */}
              <div className={cn(
                "w-96 border-l flex flex-col shadow-xl transition-colors duration-300",
                theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}>
                <div className={cn("p-6 border-b", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShoppingCart size={20} className={theme === 'clinic' ? "text-pink-600" : "text-emerald-600"} />
                    Current Order
                  </h3>
                </div>

                {/* Customer Selection */}
                <div className={cn(
                  "p-4 border-b transition-colors",
                  theme === 'dark' ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</label>
                    {selectedCustomer && (
                      <button onClick={() => setSelectedCustomer(null)} className="text-[10px] text-rose-500 font-bold hover:underline">Remove</button>
                    )}
                  </div>
                  {selectedCustomer ? (
                    <div className={cn(
                      "flex items-center gap-3 p-2 border rounded-xl",
                      theme === 'dark' ? "bg-slate-800 border-emerald-900" : "bg-white border-emerald-200"
                    )}>
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <User size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{selectedCustomer.name}</p>
                        <p className="text-[10px] text-slate-500">Credit: ₱{selectedCustomer.store_credit.toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <select 
                      onChange={(e) => setSelectedCustomer(customers.find(c => c.id === Number(e.target.value)) || null)}
                      className={cn(
                        "w-full p-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200"
                      )}
                    >
                      <option value="">Select Customer (Optional)</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <ShoppingCart size={32} />
                      </div>
                      <p className="text-sm font-medium">Cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => {
                      const cartId = item.isBundle ? `b-${item.id}` : (item.variantId ? `${item.id}-${item.variantId}` : `${item.id}`);
                      return (
                        <div key={cartId} className={cn(
                          "flex items-center gap-4 p-3 rounded-xl border transition-colors",
                          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex-1">
                            <p className={cn("text-sm font-bold leading-tight", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>
                              {item.name}
                              {item.variantName && <span className={cn("text-[10px] ml-1", theme === 'clinic' ? "text-pink-600" : "text-emerald-600")}>({item.variantName})</span>}
                              {item.isBundle && <span className="text-[10px] text-blue-600 ml-1">(Bundle)</span>}
                            </p>
                            <p className="text-xs text-slate-500">₱{item.price.toLocaleString()}</p>
                          </div>
                          <div className={cn("flex items-center gap-2 border rounded-lg p-1", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200")}>
                            <button 
                              onClick={() => updateQuantity(cartId, -1)}
                              className={cn("p-1 rounded transition-colors", theme === 'dark' ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-50 text-slate-600")}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(cartId, 1)}
                              className={cn("p-1 rounded transition-colors", theme === 'dark' ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-50 text-slate-600")}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(cartId)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={cn(
                  "p-6 border-t space-y-4 transition-colors",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                )}>
                  {/* Discount Section */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="number"
                        placeholder={discountType === 'percent' ? "Discount %" : "Discount ₱"}
                        className={cn(
                          "w-full pl-8 pr-4 py-2 border rounded-xl text-xs focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200"
                        )}
                        value={discount || ''}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                      />
                    </div>
                    <button 
                      onClick={() => setDiscountType(prev => prev === 'fixed' ? 'percent' : 'fixed')}
                      className={cn(
                        "p-2 border rounded-xl transition-all flex items-center justify-center w-10 h-10",
                        discountType === 'percent' 
                          ? (theme === 'clinic' ? "bg-pink-600 border-pink-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                          : (theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-400")
                      )}
                    >
                      {discountType === 'percent' ? <Percent size={14} /> : <Banknote size={14} />}
                    </button>
                  </div>

                  {/* Digital Receipt */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className={cn(
                          "w-4 h-4 rounded border-slate-300 focus:ring-emerald-500",
                          theme === 'clinic' ? "text-pink-600" : "text-emerald-600"
                        )}
                        checked={sendReceipt}
                        onChange={(e) => setSendReceipt(e.target.checked)}
                      />
                      <span className={cn(
                        "text-xs font-bold transition-colors",
                        theme === 'dark' ? "text-slate-400 group-hover:text-emerald-400" : "text-slate-600 group-hover:text-emerald-600",
                        theme === 'clinic' && "group-hover:text-pink-600"
                      )}>Send Digital Receipt</span>
                    </label>
                    {sendReceipt && (
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="text"
                          placeholder="Email or Phone Number"
                          className={cn(
                            "w-full pl-8 pr-4 py-2 border rounded-xl text-xs focus:outline-none",
                            theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200"
                          )}
                          value={receiptTo}
                          onChange={(e) => setReceiptTo(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="grid grid-cols-2 gap-2">
                    <PaymentOption 
                      active={paymentMethod === 'Cash'} 
                      onClick={() => setPaymentMethod('Cash')}
                      icon={<Banknote size={16} />}
                      label="Cash"
                      theme={theme}
                    />
                    <PaymentOption 
                      active={paymentMethod === 'GCash'} 
                      onClick={() => setPaymentMethod('GCash')}
                      icon={<QrCode size={16} />}
                      label="GCash"
                      theme={theme}
                    />
                    <PaymentOption 
                      active={paymentMethod === 'Card'} 
                      onClick={() => setPaymentMethod('Card')}
                      icon={<CreditCard size={16} />}
                      label="Card"
                      theme={theme}
                    />
                    <PaymentOption 
                      active={paymentMethod === 'Store Credit'} 
                      onClick={() => setPaymentMethod('Store Credit')}
                      icon={<Wallet size={16} />}
                      label="Credit"
                      disabled={!selectedCustomer || selectedCustomer.store_credit < cartTotal}
                      theme={theme}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span className={theme === 'dark' ? "text-slate-300" : "text-slate-700"}>₱{cartSubtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs text-rose-500 font-bold">
                        <span>Discount</span>
                        <span>-₱{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className={cn("flex justify-between text-xl font-black pt-2 border-t", theme === 'dark' ? "text-slate-100 border-slate-800" : "text-slate-900 border-slate-200")}>
                      <span>Total</span>
                      <span className={theme === 'clinic' ? "text-pink-600" : "text-emerald-600"}>₱{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || loading || (paymentMethod === 'Store Credit' && (!selectedCustomer || selectedCustomer.store_credit < cartTotal))}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98]",
                      cart.length === 0 || loading || (paymentMethod === 'Store Credit' && (!selectedCustomer || selectedCustomer.store_credit < cartTotal))
                        ? "bg-slate-300 cursor-not-allowed" 
                        : (theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200")
                    )}
                  >
                    {loading ? 'Processing...' : `Pay with ${paymentMethod}`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
                    <p className="text-slate-500 text-sm">Track and manage your clinic's products and services.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {user?.role === 'SUPER_ADMIN' && (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                        <Building2 size={16} className="ml-2 text-slate-400" />
                        <select 
                          className="bg-transparent border-none text-xs font-bold focus:ring-0 pr-8"
                          value={selectedBranchId}
                          onChange={(e) => setSelectedBranchId(e.target.value)}
                        >
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        if (selectedBranchId === 'Admin') {
                          alert('Please select a specific branch to add new items.');
                          return;
                        }
                        openProductModal();
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold transition-colors shadow-lg",
                        theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                      )}
                    >
                      <Plus size={18} />
                      Add New Item
                    </button>
                  </div>
                </div>

                {lowStockItems.length > 0 && (
                  <div className={cn(
                    "mb-8 p-4 border rounded-2xl flex items-center gap-4",
                    theme === 'dark' ? "bg-rose-900/20 border-rose-900/30" : "bg-rose-50 border-rose-100"
                  )}>
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 className={cn("font-bold", theme === 'dark' ? "text-rose-200" : "text-rose-900")}>Low Stock Alert</h4>
                      <p className={cn("text-xs", theme === 'dark' ? "text-rose-400" : "text-rose-700")}>{lowStockItems.length} items are running low on stock. Please restock soon.</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Search inventory..."
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all shadow-sm",
                        theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      )}
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                    />
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                      onClick={() => setInventoryTab('products')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        inventoryTab === 'products' ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600" : "text-slate-500"
                      )}
                    >
                      Products
                    </button>
                    <button 
                      onClick={() => setInventoryTab('services')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        inventoryTab === 'services' ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600" : "text-slate-500"
                      )}
                    >
                      Services
                    </button>
                    <button 
                      onClick={() => setInventoryTab('low-stock')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                        inventoryTab === 'low-stock' ? "bg-white dark:bg-slate-700 shadow-sm text-rose-600" : "text-slate-500"
                      )}
                    >
                      Low Stock
                      {lowStockItems.length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {lowStockItems.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "border rounded-2xl shadow-sm overflow-hidden transition-colors",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={cn("border-b", theme === 'dark' ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200")}>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Price</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {selectedBranchId === 'Admin' ? 'Total Stock (All Branches)' : 'Branch Stock'}
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", theme === 'dark' ? "divide-slate-800" : "divide-slate-100")}>
                      {products
                        .filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase());
                          if (inventoryTab === 'low-stock') {
                            return matchesSearch && p.category !== 'Service' && p.stock <= 100;
                          }
                          const matchesTab = inventoryTab === 'services' ? p.category === 'Service' : p.category !== 'Service';
                          return matchesSearch && matchesTab;
                        })
                        .map(product => (
                          <tr 
                            key={product.id} 
                            className={cn(
                              "transition-colors", 
                              theme === 'dark' ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50",
                              product.category !== 'Service' && product.stock <= 100 && (theme === 'dark' ? "bg-rose-900/10" : "bg-rose-50/30")
                            )}
                          >
                            <td className={cn("px-6 py-4 font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{product.name}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                product.category === 'Service' 
                                  ? (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600")
                                  : (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600")
                              )}>
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">₱{product.price.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              {product.category === 'Service' ? (
                                <span className="text-slate-400 text-xs italic">N/A (Service)</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    product.stock > 200 ? "bg-emerald-500" : product.stock > 100 ? "bg-amber-500" : "bg-rose-500"
                                  )} />
                                  <span className={cn(
                                    "text-sm font-medium",
                                    product.stock <= 100 && "text-rose-600 font-bold"
                                  )}>
                                    {product.stock} {product.unit}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    if (selectedBranchId === 'Admin') {
                                      alert('Please select a specific branch to restock items.');
                                      return;
                                    }
                                    openProductModal(product);
                                  }}
                                  className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors", theme === 'dark' ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50")}
                                >
                                  Restock
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'customers' && (
            <motion.div 
              key="customers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Customer Profiles</h2>
                    <p className="text-slate-500 text-sm">Manage customer information and store credit.</p>
                  </div>
                  <button 
                    onClick={() => openCustomerModal()}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold transition-colors shadow-lg",
                      theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                    )}
                  >
                    <Plus size={18} />
                    New Customer
                  </button>
                </div>

                <div className="mb-8 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search customers by name, email or phone..."
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all shadow-sm",
                      theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                    )}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>

                <div className={cn(
                  "border rounded-2xl shadow-sm overflow-hidden transition-colors",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={cn("border-b", theme === 'dark' ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200")}>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Store Credit</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Joined</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", theme === 'dark' ? "divide-slate-800" : "divide-slate-100")}>
                      {customers
                        .filter(c => 
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
                          (c.phone && c.phone.includes(customerSearch))
                        )
                        .map(customer => (
                          <tr key={customer.id} className={cn("transition-colors", theme === 'dark' ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50")}>
                            <td className={cn("px-6 py-4 font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{customer.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12}/> {customer.email || 'N/A'}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1"><Smartphone size={12}/> {customer.phone || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-xs font-bold",
                                theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                ₱{customer.store_credit.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(customer.created_at), 'MMM d, yyyy')}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => openCustomerModal(customer)}
                                  className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors", theme === 'dark' ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50")}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomer(customer.id);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'bundles' && (
            <motion.div 
              key="bundles"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Product Bundles</h2>
                    <p className="text-slate-500 text-sm">Create and manage special package deals.</p>
                  </div>
                  <button 
                    onClick={() => setShowBundleModal(true)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold transition-colors shadow-lg",
                      theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                    )}
                  >
                    <Plus size={18} />
                    Create Bundle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bundles.map(bundle => (
                    <div key={bundle.id} className={cn(
                      "border rounded-2xl shadow-sm p-6 transition-colors",
                      theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{bundle.name}</h3>
                        <span className={cn("text-xl font-black", theme === 'clinic' ? "text-pink-600" : "text-emerald-600")}>₱{bundle.price.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Included Items:</p>
                        <ul className="space-y-1">
                          {bundle.items.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-500 flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-slate-400">₱{item.price.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => alert('Edit Bundle functionality coming soon!')}
                          className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors", theme === 'dark' ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50")}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBundle(bundle.id);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'branches' && (
            <motion.div 
              key="branches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-8 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Branch Real-time Monitor</h2>
                    <p className="text-slate-500 text-sm">Live status of all company-owned and managed branches.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {branches.filter(b => b.id !== 'Admin').map(branch => (
                    <BranchStatusCard 
                      key={branch.id} 
                      branch={branch} 
                      theme={theme}
                      onClick={() => {
                        setSelectedBranchId(branch.id);
                        setCurrentView('reports');
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
                    <p className="text-slate-500 text-sm">Review and manage past transactions.</p>
                  </div>
                </div>

                <div className={cn(
                  "border rounded-2xl shadow-sm overflow-hidden transition-colors",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={cn("border-b", theme === 'dark' ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200")}>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Branch</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date & Time</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Items</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", theme === 'dark' ? "divide-slate-800" : "divide-slate-100")}>
                      {dailySales.map(sale => (
                        <tr key={sale.id} className={cn("transition-colors", theme === 'dark' ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50", sale.status === 'Refunded' && "opacity-60")}>
                          <td className="px-6 py-4 font-bold text-slate-500">#{sale.id}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{sale.branch_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className={cn("text-xs font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{sale.customer_name || 'Walk-in'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(sale.timestamp), 'MMM d, HH:mm')}</td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-500 max-w-[200px] truncate">{sale.items}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("text-xs font-medium px-2 py-1 rounded-lg", theme === 'dark' ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700")}>{sale.payment_method}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={cn("font-bold", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>₱{sale.total_amount.toLocaleString()}</span>
                              {sale.discount_amount > 0 && <span className="text-[10px] text-rose-500 font-bold">Disc: -₱{sale.discount_amount.toLocaleString()}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                              sale.status === 'Completed' 
                                ? (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600")
                                : "bg-rose-50 text-rose-600"
                            )}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {sale.status === 'Completed' && (
                              <div className="flex flex-col gap-1">
                                <button 
                                  onClick={() => handleRefund(sale.id, false)}
                                  className="flex items-center gap-1 text-rose-500 hover:text-rose-700 text-[10px] font-bold transition-colors"
                                >
                                  <RotateCcw size={12} />
                                  Refund Cash
                                </button>
                                {sale.customer_name && (
                                  <button 
                                    onClick={() => handleRefund(sale.id, true)}
                                    className={cn("flex items-center gap-1 text-[10px] font-bold transition-colors", theme === 'clinic' ? "text-pink-600 hover:text-pink-800" : "text-emerald-600 hover:text-emerald-800")}
                                  >
                                    <Wallet size={12} />
                                    Refund to Credit
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 p-8 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Daily Sales Report</h2>
                    <p className="text-slate-500 text-sm">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
                  </div>
                  <div className="flex gap-3">
                    <button className={cn(
                      "px-4 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm",
                      theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50"
                    )}>
                      Export PDF
                    </button>
                    <button className={cn(
                      "px-4 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm",
                      theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50"
                    )}>
                      Print Report
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard 
                    label="Total Revenue" 
                    value={`₱${(summary?.total_revenue ?? 0).toLocaleString()}`}
                    icon={<TrendingUp className={theme === 'clinic' ? "text-pink-600" : "text-emerald-600"} size={24} />}
                    trend="+12% from yesterday"
                    theme={theme}
                  />
                  <StatCard 
                    label="Transactions" 
                    value={(summary?.total_transactions ?? 0).toString()}
                    icon={<ShoppingCart className={theme === 'clinic' ? "text-pink-600" : "text-blue-600"} size={24} />}
                    trend="+5% from yesterday"
                    theme={theme}
                  />
                  <StatCard 
                    label="Avg. Ticket" 
                    value={`₱${((summary?.total_revenue ?? 0) / (summary?.total_transactions || 1)).toLocaleString()}`}
                    icon={<LayoutDashboard className={theme === 'clinic' ? "text-pink-600" : "text-violet-600"} size={24} />}
                    trend="Stable"
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart */}
                  <div className={cn(
                    "p-6 border rounded-2xl shadow-sm transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Revenue Overview</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailySales.filter(s => s.status === 'Completed').slice(0, 7).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#F1F5F9"} />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(val) => format(new Date(val), 'HH:mm')}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                              color: theme === 'dark' ? '#f8fafc' : '#000'
                            }}
                            labelFormatter={(val) => format(new Date(val), 'HH:mm')}
                          />
                          <Bar dataKey="total_amount" radius={[4, 4, 0, 0]}>
                            {dailySales.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={theme === 'clinic' ? '#DB2777' : (index % 2 === 0 ? '#10B981' : '#3B82F6')} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className={cn(
                    "border rounded-2xl shadow-sm flex flex-col transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className={cn("p-6 border-b", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Transactions</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-64">
                      {dailySales.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No sales recorded yet.</div>
                      ) : (
                        dailySales.map(sale => (
                          <div key={sale.id} className={cn("p-4 border-b flex items-center justify-between transition-colors", theme === 'dark' ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-50 hover:bg-slate-50")}>
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500")}>
                                <Clock size={18} />
                              </div>
                              <div>
                                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>₱{sale.total_amount.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{format(new Date(sale.timestamp), 'HH:mm:ss')}</p>
                              </div>
                            </div>
                            <div className="text-right max-w-[150px]">
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mb-1 inline-block",
                                sale.status === 'Completed' 
                                  ? (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600")
                                  : "bg-rose-50 text-rose-600"
                              )}>
                                {sale.status}
                              </span>
                              <p className="text-[10px] text-slate-400 truncate">{sale.items}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
            >
              <CheckCircle2 size={20} />
              <span className="font-bold">Transaction Successful!</span>
            </motion.div>
          )}

          {/* Confirmation Modal */}
          <AnimatePresence>
            {confirmModal.show && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={cn("w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden", theme === 'dark' ? "bg-slate-900 border border-slate-800" : "bg-white")}
                >
                  <div className="p-6 text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                      confirmModal.type === 'danger' ? "bg-rose-100 text-rose-600" : 
                      confirmModal.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {confirmModal.type === 'danger' ? <AlertTriangle size={32} /> : 
                       confirmModal.type === 'warning' ? <RotateCcw size={32} /> : <CheckCircle2 size={32} />}
                    </div>
                    <h3 className={cn("text-xl font-black mb-2", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>{confirmModal.title}</h3>
                    <p className="text-sm text-slate-500">{confirmModal.message}</p>
                  </div>
                  <div className={cn("p-4 flex gap-3 border-t", theme === 'dark' ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50")}>
                    <button 
                      onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                      className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-colors", theme === 'dark' ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600")}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmModal.onConfirm}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg",
                        confirmModal.type === 'danger' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100" : 
                        confirmModal.type === 'warning' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                      )}
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Customer Modal */}
          {showBundleModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn("w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden", theme === 'dark' ? "bg-slate-900" : "bg-white")}
              >
                <div className={cn("p-6 border-b", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                  <h3 className="text-xl font-black">Create New Bundle</h3>
                  <p className="text-xs text-slate-500">Combine multiple products into a package.</p>
                </div>
                <form onSubmit={handleSaveBundle} className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bundle Name</label>
                      <input 
                        type="text"
                        required
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        value={bundleForm.name}
                        onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bundle Price (₱)</label>
                      <input 
                        type="number"
                        required
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        value={bundleForm.price}
                        onChange={(e) => setBundleForm({ ...bundleForm, price: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Add Items to Bundle</label>
                    <div className="flex gap-2 mb-4">
                      <select 
                        className={cn(
                          "flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        onChange={(e) => {
                          const prod = products.find(p => p.id === parseInt(e.target.value));
                          if (prod) {
                            const existing = bundleForm.items.find(i => i.productId === prod.id);
                            if (existing) {
                              setBundleForm({
                                ...bundleForm,
                                items: bundleForm.items.map(i => i.productId === prod.id ? { ...i, quantity: i.quantity + 1 } : i)
                              });
                            } else {
                              setBundleForm({
                                ...bundleForm,
                                items: [...bundleForm.items, { productId: prod.id, quantity: 1, name: prod.name }]
                              });
                            }
                          }
                        }}
                        value=""
                      >
                        <option value="" disabled>Select a product...</option>
                        {products.filter(p => p.category !== 'Service').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {bundleForm.items.map((item, idx) => (
                        <div key={idx} className={cn("flex items-center justify-between p-3 rounded-xl border", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                          <span className="text-xs font-bold">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button 
                                type="button"
                                onClick={() => {
                                  setBundleForm({
                                    ...bundleForm,
                                    items: bundleForm.items.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i)
                                  });
                                }}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  setBundleForm({
                                    ...bundleForm,
                                    items: bundleForm.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)
                                  });
                                }}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setBundleForm({
                                  ...bundleForm,
                                  items: bundleForm.items.filter(i => i.productId !== item.productId)
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {bundleForm.items.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-400 italic">No items added to bundle yet.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowBundleModal(false)}
                      className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-colors", theme === 'dark' ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className={cn("flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg", theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100")}
                    >
                      Save Bundle
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {showProductModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn("w-full max-w-md rounded-3xl shadow-2xl overflow-hidden", theme === 'dark' ? "bg-slate-900" : "bg-white")}
              >
                <div className={cn("p-6 border-b", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                  <h3 className="text-xl font-black">{editingProduct ? 'Restock / Edit Product' : 'Add New Product'}</h3>
                  <p className="text-xs text-slate-500">Manage your inventory items.</p>
                </div>
                <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Item Name</label>
                    <input 
                      type="text"
                      required
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                      )}
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                      <select 
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                        <option value="Add-on">Add-on</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unit</label>
                      <input 
                        type="text"
                        placeholder="pcs, box, etc"
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Price (₱)</label>
                      <input 
                        type="number"
                        required
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {editingProduct ? 'Add Stock' : 'Initial Stock'}
                      </label>
                      <input 
                        type="number"
                        required
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200"
                        )}
                        value={productForm.stockToAdd}
                        onChange={(e) => setProductForm({ ...productForm, stockToAdd: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-colors", theme === 'dark' ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className={cn("flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg", theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100")}
                    >
                      {editingProduct ? 'Update Stock' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {showCustomerModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "rounded-3xl shadow-xl w-full max-w-md overflow-hidden transition-colors",
                  theme === 'dark' ? "bg-slate-900 border border-slate-800" : "bg-white"
                )}
              >
                <div className={cn("p-6 border-b flex justify-between items-center", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                  <h3 className={cn("text-xl font-bold", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>
                    {editingCustomer ? 'Edit Customer' : 'New Customer'}
                  </h3>
                  <button 
                    onClick={() => setShowCustomerModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
                <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                        theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                      )}
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                      <input 
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                          theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                        )}
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                      <input 
                        type="tel"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                          theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                        )}
                        placeholder="09123456789"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Store Credit (₱)</label>
                    <input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={customerForm.store_credit}
                      onChange={(e) => setCustomerForm({...customerForm, store_credit: Number(e.target.value)})}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                        theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                      )}
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(false)}
                      className={cn("flex-1 py-3 px-4 rounded-xl font-bold transition-colors", theme === 'dark' ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={cn(
                        "flex-1 py-3 px-4 text-white rounded-xl font-bold shadow-lg transition-all",
                        theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                      )}
                    >
                      {editingCustomer ? 'Update' : 'Save'} Customer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const BranchStatusCard: React.FC<{ branch: Branch, onClick: () => void, theme?: Theme }> = ({ branch, onClick, theme }) => {
  const [stats, setStats] = useState({ revenue: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);
  const currentTheme = theme || 'light';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/reports/daily?branchId=${branch.id}`);
        const data = await res.json();
        setStats({ revenue: data.summary.total_revenue, transactions: data.summary.total_transactions });
      } catch (err) {
        console.error('Failed to fetch branch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [branch.id]);

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "p-6 border rounded-2xl text-left transition-all shadow-sm hover:shadow-md group",
        currentTheme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "p-3 rounded-xl transition-colors",
          currentTheme === 'dark' ? "bg-slate-800 group-hover:bg-emerald-900/30" : "bg-slate-50 group-hover:bg-emerald-50"
        )}>
          <Building2 size={24} className={cn(
            "transition-colors",
            currentTheme === 'dark' ? "text-slate-500 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600",
            currentTheme === 'clinic' && "group-hover:text-pink-600"
          )} />
        </div>
        <span className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
          branch.type === 'COMPANY-OWNED' 
            ? (currentTheme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600")
            : "bg-amber-50 text-amber-600"
        )}>
          {branch.type}
        </span>
      </div>
      
      <h3 className={cn("text-lg font-bold mb-1", currentTheme === 'dark' ? "text-slate-200" : "text-slate-800")}>{branch.name}</h3>
      <p className="text-xs text-slate-500 mb-6">ID: {branch.id}</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue Today</p>
          <p className={cn("text-sm font-black", currentTheme === 'dark' ? "text-slate-100" : "text-slate-900")}>
            {loading ? '...' : `₱${stats.revenue.toLocaleString()}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Orders</p>
          <p className={cn("text-sm font-black", currentTheme === 'dark' ? "text-slate-100" : "text-slate-900")}>
            {loading ? '...' : stats.transactions}
          </p>
        </div>
      </div>

      <div className={cn(
        "mt-6 pt-6 border-t flex items-center justify-between transition-colors",
        currentTheme === 'dark' ? "border-slate-800 text-emerald-400" : "border-slate-50 text-emerald-600",
        currentTheme === 'clinic' && "text-pink-600"
      )}>
        <span className="text-xs font-bold">View Detailed Report</span>
        <ChevronRight size={16} />
      </div>
    </motion.button>
  );
};

function NavItem({ active, onClick, icon, label, theme }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, theme?: Theme }) {
  const activeClasses = {
    light: "bg-emerald-50 text-emerald-600",
    dark: "bg-pink-900/30 text-pink-400",
    clinic: "bg-pink-50 text-pink-600",
    neopos: "bg-gray-800 text-pink-500"
  };

  const inactiveClasses = {
    light: "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
    dark: "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
    clinic: "text-slate-500 hover:bg-pink-50/50 hover:text-pink-700",
    neopos: "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
  };

  const currentTheme = theme || 'light';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group",
        active ? activeClasses[currentTheme] : inactiveClasses[currentTheme]
      )}
    >
      <span className={cn("transition-colors", active ? "" : "opacity-70 group-hover:opacity-100")}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {active && (
        <motion.div 
          layoutId="active-pill" 
          className={cn("ml-auto w-1.5 h-1.5 rounded-full", currentTheme === 'clinic' ? "bg-pink-600" : "bg-emerald-600")} 
        />
      )}
    </button>
  );
}

function PaymentOption({ active, onClick, icon, label, disabled, theme }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean, theme?: Theme }) {
  const currentTheme = theme || 'light';
  
  const activeClasses = {
    light: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    dark: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    clinic: "bg-pink-600 text-white border-pink-600 shadow-sm"
  };

  const inactiveClasses = {
    light: "bg-white text-slate-500 border-slate-200 hover:border-emerald-300",
    dark: "bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500",
    clinic: "bg-white text-slate-500 border-pink-100 hover:border-pink-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all",
        active ? activeClasses[currentTheme] : inactiveClasses[currentTheme],
        disabled && "opacity-40 cursor-not-allowed grayscale"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, trend, theme }: { label: string, value: string, icon: React.ReactNode, trend: string, theme?: Theme }) {
  return (
    <div className={cn(
      "p-6 border rounded-2xl shadow-sm transition-colors",
      theme === 'dark' || theme === 'neopos' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
      theme === 'neopos' && "bg-gray-900 border-gray-800"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", theme === 'dark' || theme === 'neopos' ? "bg-slate-800" : "bg-slate-50", theme === 'neopos' && "bg-gray-800")}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-lg",
          theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "text-pink-600 bg-pink-50" : "text-emerald-600 bg-emerald-50"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <h4 className={cn("text-2xl font-black", theme === 'dark' || theme === 'neopos' ? "text-slate-100" : "text-slate-900")}>{value}</h4>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (user: UserType) => void }) {
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
        onLogin(user);
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

