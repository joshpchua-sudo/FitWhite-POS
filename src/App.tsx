import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
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
  Settings,
  Building2,
  Globe,
  LogOut,
  Moon,
  Sun,
  Palette,
  Menu,
  X,
  Download,
  Printer,
  Trophy
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
import { NavItem, PaymentOption, StatCard } from './components/ui/Common';
import { BranchStatusCard } from './components/BranchStatusCard';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { 
  Product, 
  CartItem, 
  Sale, 
  DailySummary, 
  User as UserType, 
  Customer, 
  Bundle, 
  ProductVariant,
  Branch, 
  Treatment,
  Theme,
  View,
  BranchPerformance
} from './types';

type PaymentMethod = 'Cash' | 'GCash' | 'Card' | 'QRPH' | 'Store Credit';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<'services' | 'products' | 'low-stock'>('products');
  const [dailySales, setDailySales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<DailySummary>({ total_revenue: 0, total_transactions: 0 });
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [isExporting, setIsExporting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [offlineSales, setOfflineSales] = useState<any[]>(() => {
    const saved = localStorage.getItem('offlineSales');
    return saved ? JSON.parse(saved) : [];
  });
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
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', store_credit: 0, allergies: '', notes: '' });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentForm, setTreatmentForm] = useState({ treatment_name: '', dosage: '', notes: '', administered_by: '' });
  const [showAddTreatment, setShowAddTreatment] = useState(false);
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
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('offlineSales', JSON.stringify(offlineSales));
  }, [offlineSales]);

  useEffect(() => {
    if (isOnline && offlineSales.length > 0) {
      syncOfflineSales();
    }
  }, [isOnline]);

  const syncOfflineSales = async () => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales: offlineSales })
      });
      if (res.ok) {
        setOfflineSales([]);
        fetchDailyReports();
        alert('Offline sales synced successfully!');
      }
    } catch (err) {
      console.error('Sync failed', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?branchId=${selectedBranchId}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const generateAiSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/reports/export?period=monthly&branchId=${selectedBranchId}`);
      const salesData = await res.json();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these sales data and suggest restock quantities and schedules for the next month. Focus on high-demand items and predict potential stockouts. Data: ${JSON.stringify(salesData.slice(0, 50))}`,
        config: {
          systemInstruction: "You are an expert inventory analyst for a retail business. Provide concise, actionable restock suggestions in Markdown format."
        }
      });
      
      setAiSuggestions(response.text || 'No suggestions available.');
    } catch (err) {
      console.error('AI analysis failed', err);
      setAiSuggestions('Failed to generate suggestions. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBranches();
      fetchProducts();
      fetchBundles();
      fetchCustomers();
      fetchDailyReports();
      fetchBranchPerformance();
      fetchNotifications();
    }
  }, [currentView, user, selectedBranchId, reportPeriod]);

  const fetchBranchPerformance = async () => {
    try {
      const res = await fetch(`/api/reports/branch-performance?period=${reportPeriod}`);
      const data = await res.json();
      setBranchPerformance(data);
    } catch (err) {
      console.error('Failed to fetch branch performance', err);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/reports/export?period=${reportPeriod}&branchId=${selectedBranchId}`);
      const data = await res.json();
      
      if (data.length === 0) {
        alert('No data to export for the selected period.');
        return;
      }

      const headers = ['ID', 'Date', 'Branch', 'Customer', 'Items', 'Payment', 'Discount', 'Total', 'Status'];
      const rows = data.map((s: Sale) => [
        s.id,
        format(new Date(s.timestamp), 'yyyy-MM-dd HH:mm'),
        s.branch_name,
        s.customer_name || 'Walk-in',
        s.items.replace(/,/g, ';'),
        s.payment_method,
        s.discount_amount,
        s.total_amount,
        s.status
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `FitWhite_Sales_${reportPeriod}_${selectedBranchId}_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getChartData = () => {
    const completedSales = dailySales.filter(s => s.status === 'Completed');
    if (reportPeriod === 'daily') {
      const hourly = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        total_amount: 0
      }));
      completedSales.forEach(s => {
        const hour = new Date(s.timestamp).getHours();
        hourly[hour].total_amount += s.total_amount;
      });
      return hourly.filter(h => h.total_amount > 0);
    } else if (reportPeriod === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekly = days.map(d => ({ label: d, total_amount: 0 }));
      completedSales.forEach(s => {
        const day = new Date(s.timestamp).getDay();
        weekly[day].total_amount += s.total_amount;
      });
      return weekly;
    } else if (reportPeriod === 'monthly') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const monthly = Array.from({ length: daysInMonth }, (_, i) => ({
        label: (i + 1).toString(),
        total_amount: 0
      }));
      completedSales.forEach(s => {
        const day = new Date(s.timestamp).getDate();
        monthly[day - 1].total_amount += s.total_amount;
      });
      return monthly.filter(m => m.total_amount > 0);
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearly = months.map(m => ({ label: m, total_amount: 0 }));
      completedSales.forEach(s => {
        const month = new Date(s.timestamp).getMonth();
        yearly[month].total_amount += s.total_amount;
      });
      return yearly;
    }
  };

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
      const res = await fetch(`/api/reports/export?period=${reportPeriod}&branchId=${selectedBranchId}`);
      const data = await res.json();
      
      const totalRevenue = data.reduce((acc: number, s: any) => acc + (s.status === 'Completed' ? s.total_amount : 0), 0);
      const totalTransactions = data.filter((s: any) => s.status === 'Completed').length;
      
      setDailySales(data);
      setSummary({ total_revenue: totalRevenue, total_transactions: totalTransactions });
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
        setCustomerForm({ name: '', email: '', phone: '', store_credit: 0, allergies: '', notes: '' });
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
        store_credit: customer.store_credit,
        allergies: customer.allergies || '',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({ name: '', email: '', phone: '', store_credit: 0, allergies: '', notes: '' });
    }
    setShowCustomerModal(true);
  };

  const openHistoryModal = async (customer: Customer) => {
    setSelectedCustomerForHistory(customer);
    setShowHistoryModal(true);
    fetchTreatments(customer.id);
  };

  const fetchTreatments = async (customerId: number) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/treatments`);
      const data = await res.json();
      setTreatments(data);
    } catch (err) {
      console.error('Failed to fetch treatments', err);
    }
  };

  const handleTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForHistory) return;

    try {
      const res = await fetch(`/api/customers/${selectedCustomerForHistory.id}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...treatmentForm,
          branch_id: selectedBranchId,
          administered_by: treatmentForm.administered_by || user?.username
        })
      });

      if (res.ok) {
        setTreatmentForm({ treatment_name: '', dosage: '', notes: '', administered_by: '' });
        setShowAddTreatment(false);
        fetchTreatments(selectedCustomerForHistory.id);
      }
    } catch (err) {
      console.error('Failed to add treatment', err);
    }
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
  const safeDiscount = isNaN(discount) ? 0 : discount;
  const calculatedDiscount = discountType === 'percent' 
    ? (cartSubtotal * (safeDiscount / 100)) 
    : safeDiscount;
  const cartTotal = Math.max(0, cartSubtotal - (calculatedDiscount || 0));

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

    // Security: Cashier discount limit
    if (user?.role === 'CASHIER') {
      if (discountType === 'percent' && discount > 20) {
        alert('Security Alert: Cashiers are limited to 20% discount. Manager approval required for higher discounts.');
        return;
      }
      if (discountType === 'fixed' && discount > (cartSubtotal * 0.2)) {
        alert('Security Alert: Discount exceeds 20% of total. Manager approval required.');
        return;
      }
    }

    setLoading(true);
    const saleData = { 
      items: cart.filter(i => !i.isBundle), 
      bundles: cart.filter(i => i.isBundle),
      total: cartTotal, 
      discount: calculatedDiscount,
      paymentMethod,
      customerId: selectedCustomer?.id,
      receiptTo: sendReceipt ? receiptTo : null,
      branchId: selectedBranchId,
      timestamp: new Date().toISOString()
    };

    if (!isOnline) {
      setOfflineSales(prev => [...prev, saleData]);
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setLoading(false);
      alert('Network failure. Sale saved locally and will sync when online.');
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
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

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aLow = a.category !== 'Service' && a.stock <= 100;
      const bLow = b.category !== 'Service' && b.stock <= 100;
      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;
      return 0;
    });

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

  const currentBranch = branches.find(b => b.id === selectedBranchId) || { id: 'Admin', name: 'HQ Central', type: 'COMPANY-OWNED' as const };

  const themeClasses = {
    light: "bg-[#F8FAFC] text-slate-900",
    dark: "bg-slate-950 text-slate-100",
    clinic: "bg-[#FFF0F5] text-[#880E4F]",
    neopos: "bg-gray-950 text-gray-100"
  };

  return (
    <div className={cn("flex h-screen font-sans overflow-hidden transition-colors duration-300", themeClasses[theme])}>
      {/* Sidebar */}
      <Sidebar 
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        branches={branches}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
        currentBranch={currentBranch}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-4 lg:px-8 transition-colors duration-300",
          theme === 'dark' || theme === 'neopos' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
          theme === 'neopos' && "bg-gray-900 border-gray-800"
        )}>
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className={cn("text-sm lg:text-lg font-bold", theme === 'dark' || theme === 'neopos' ? "text-slate-200" : "text-slate-800")}>
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h2>
            <div className={cn("hidden lg:block h-4 w-[1px]", theme === 'dark' || theme === 'neopos' ? "bg-slate-800" : "bg-slate-200")} />
            <p className="hidden lg:block text-xs text-slate-500 font-medium">
              {currentBranch.name} ({currentBranch.type})
            </p>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2">
              {!isOnline && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg animate-pulse">
                    <Globe size={12} />
                    OFFLINE
                  </div>
                  {offlineSales.length > 0 && (
                    <div className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <RotateCcw size={10} className="animate-spin-slow" />
                      {offlineSales.length} PENDING
                    </div>
                  )}
                </div>
              )}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markNotificationsRead();
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-colors relative",
                    theme === 'dark' || theme === 'neopos' ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                  )}
                >
                  <AlertTriangle size={20} />
                  {notifications.some(n => !n.is_read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={cn(
                        "absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-2xl shadow-2xl z-50 border",
                        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                      )}
                    >
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Notifications</h3>
                        <span className="text-[10px] font-bold text-slate-400">{notifications.length} total</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={cn("p-4 transition-colors", !n.is_read && (theme === 'dark' ? "bg-slate-800/50" : "bg-slate-50"))}>
                              <div className="flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  n.type === 'LOW_STOCK' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                )}>
                                  {n.type === 'LOW_STOCK' ? <Package size={16} /> : <AlertTriangle size={16} />}
                                </div>
                                <div>
                                  <p className={cn("text-xs font-medium", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{n.message}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{format(new Date(n.timestamp), 'MMM d, HH:mm')}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <p className={cn("text-xs lg:text-sm font-bold tracking-wider", theme === 'dark' || theme === 'neopos' ? "text-pink-400" : "text-slate-700")}>
                {format(currentTime, 'HH:mm:ss')}
              </p>
              <p className="text-[8px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {format(currentTime, 'EEE, MMM do, yyyy')}
              </p>
            </div>
            <button 
              onClick={() => setUser(null)}
              className={cn(
                "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold text-white transition-all shadow-lg active:scale-95",
                theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              )}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
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
              className="flex-1 flex flex-col lg:flex-row overflow-hidden relative"
            >
              {/* Product Grid */}
              <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight">New Transaction</h2>
                  <div className="flex gap-4">
                    <div className="relative w-full sm:w-72">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
                              "text-xs flex items-center gap-1",
                              product.category !== 'Service' && product.stock <= 100 ? "text-rose-500 font-bold" : "text-slate-500"
                            )}>
                              {product.category === 'Service' ? 'Available' : (
                                <>
                                  {product.stock <= 100 && <AlertTriangle size={12} className="animate-pulse" />}
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

              {/* Mobile Cart Toggle Button */}
              <div className="lg:hidden fixed bottom-6 right-6 z-30">
                <button 
                  onClick={() => setShowCart(true)}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl relative",
                    theme === 'clinic' || theme === 'dark' || theme === 'neopos' ? "bg-pink-600" : "bg-emerald-600"
                  )}
                >
                  <ShoppingCart size={24} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Cart Sidebar / Drawer */}
              <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-full sm:w-96 border-l flex flex-col shadow-2xl transition-all duration-300 lg:relative lg:translate-x-0 transform bg-white",
                theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                showCart ? "translate-x-0" : "translate-x-full"
              )}>
                <div className={cn("p-6 border-b flex items-center justify-between", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShoppingCart size={20} className={theme === 'clinic' ? "text-pink-600" : "text-emerald-600"} />
                    Current Order
                  </h3>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
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
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center w-4">
                        {discountType === 'percent' ? <Percent size={14} /> : <span className="text-xs font-bold">₱</span>}
                      </div>
                      <input 
                        type="number"
                        placeholder={discountType === 'percent' ? "Discount %" : "Discount ₱"}
                        className={cn(
                          "w-full pl-8 pr-4 py-2 border rounded-xl text-xs focus:outline-none",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200"
                        )}
                        value={discount || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setDiscount(isNaN(val) ? 0 : val);
                        }}
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
                      {discountType === 'percent' ? <Percent size={14} /> : <span className="text-sm font-bold">₱</span>}
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
                        <span>Discount {discountType === 'percent' ? `(${discount}%)` : ''}</span>
                        <span>-₱{calculatedDiscount.toLocaleString()}</span>
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
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Inventory Management</h2>
                    <p className="text-slate-500 text-xs lg:text-sm">Track and manage your clinic's products and services.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Customer Profiles</h2>
                    <p className="text-slate-500 text-xs lg:text-sm">Manage customer information and store credit.</p>
                  </div>
                  <button 
                    onClick={() => openCustomerModal()}
                    className={cn(
                      "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold transition-colors shadow-lg",
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
                            <td className={cn("px-6 py-4 font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>
                              <div className="flex items-center gap-2">
                                {customer.name}
                                {customer.allergies && (
                                  <div className="group relative">
                                    <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-rose-600 text-white text-[10px] rounded-lg shadow-xl z-10">
                                      <p className="font-bold uppercase mb-1">Allergy Warning:</p>
                                      {customer.allergies}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
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
                                  onClick={() => openHistoryModal(customer)}
                                  className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors", theme === 'clinic' ? "text-pink-600 hover:bg-pink-50" : "text-emerald-600 hover:bg-emerald-50")}
                                >
                                  History
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
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Product Bundles</h2>
                    <p className="text-slate-500 text-xs lg:text-sm">Create and manage special package deals.</p>
                  </div>
                  <button 
                    onClick={() => setShowBundleModal(true)}
                    className={cn(
                      "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold transition-colors shadow-lg",
                      theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                    )}
                  >
                    <Plus size={18} />
                    Create Bundle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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
                            <li key={item.id || idx} className="text-xs text-slate-500 flex justify-between">
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
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Branch Real-time Monitor</h2>
                    <p className="text-slate-500 text-xs lg:text-sm">Live status of all company-owned and managed branches.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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

          {currentView === 'users' && user.role === 'SUPER_ADMIN' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <UserManagement theme={theme} />
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Order History</h2>
                    <p className="text-slate-500 text-xs lg:text-sm">Review and manage past transactions.</p>
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
                      {dailySales.map((sale, idx) => (
                        <tr key={`${sale.id}-${idx}`} className={cn("transition-colors", theme === 'dark' ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50", sale.status === 'Refunded' && "opacity-60")}>
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
                            {sale.status === 'Completed' && (user.role === 'SUPER_ADMIN' || user.role === 'BRANCH_MANAGER') && (
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
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight capitalize">{reportPeriod} Sales Report</h2>
                    <p className="text-slate-500 text-xs lg:text-sm">
                      {reportPeriod === 'daily' && format(new Date(), 'EEEE, MMMM do, yyyy')}
                      {reportPeriod === 'weekly' && 'Last 7 Days'}
                      {reportPeriod === 'monthly' && format(new Date(), 'MMMM yyyy')}
                      {reportPeriod === 'yearly' && format(new Date(), 'yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select 
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value as any)}
                      className={cn(
                        "px-4 py-2 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-pink-500/20" : "bg-white border-slate-200 focus:ring-emerald-500/20"
                      )}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <button 
                      onClick={handleExportCSV}
                      disabled={isExporting}
                      className={cn(
                        "px-4 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50",
                        isExporting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Download size={16} />
                      {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button 
                      onClick={handlePrint}
                      className={cn(
                        "px-4 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <Printer size={16} />
                      Print PDF
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart */}
                  <div className={cn(
                    "lg:col-span-2 p-6 border rounded-2xl shadow-sm transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Revenue Overview</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#F1F5F9"} />
                          <XAxis 
                            dataKey="label" 
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
                          />
                          <Bar dataKey="total_amount" radius={[4, 4, 0, 0]}>
                            {getChartData().map((_, idx) => (
                              <Cell key={`cell-${idx}`} fill={theme === 'clinic' ? '#DB2777' : (idx % 2 === 0 ? '#10B981' : '#3B82F6')} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Branch Performance Ranking */}
                  <div className={cn(
                    "p-6 border rounded-2xl shadow-sm transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Branch Performance</h3>
                      <Trophy size={18} className="text-amber-500" />
                    </div>
                    <div className="space-y-4">
                      {branchPerformance.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">No data available</div>
                      ) : (
                        branchPerformance.map((branch, idx) => (
                          <div key={branch.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                idx === 0 ? "bg-amber-100 text-amber-700" : 
                                idx === 1 ? "bg-slate-100 text-slate-700" :
                                idx === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                              )}>
                                {idx + 1}
                              </div>
                              <div>
                                <p className={cn("text-xs font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{branch.name}</p>
                                <p className="text-[10px] text-slate-500">{branch.transactions} transactions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-xs font-black", theme === 'clinic' ? "text-pink-600" : "text-emerald-600")}>₱{branch.revenue.toLocaleString()}</p>
                              {idx === 0 && <span className="text-[8px] font-bold text-amber-600 uppercase">Top Performer</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {branchPerformance.length > 0 && (
                      <div className={cn(
                        "mt-6 p-3 rounded-xl border border-dashed",
                        theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-amber-50 border-amber-200"
                      )}>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          <span className="font-bold text-amber-600">Insight:</span> {branchPerformance[0].name} is currently leading with ₱{branchPerformance[0].revenue.toLocaleString()} in revenue for this period.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recent Transactions */}
                  <div className={cn(
                    "lg:col-span-3 border rounded-2xl shadow-sm flex flex-col transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className={cn("p-6 border-b flex items-center justify-between", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Detailed Sales Log</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{dailySales.length} entries</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-96">
                      {dailySales.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No sales recorded yet.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className={cn("border-b", theme === 'dark' ? "border-slate-800" : "border-slate-50")}>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Time</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Branch</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Customer</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Amount</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className={cn("divide-y", theme === 'dark' ? "divide-slate-800" : "divide-slate-100")}>
                              {dailySales.map((sale, idx) => (
                                <tr key={`${sale.id}-${idx}`} className={cn("hover:bg-slate-50/50 transition-colors", theme === 'dark' && "hover:bg-slate-800/50")}>
                                  <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(sale.timestamp), 'HH:mm')}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{sale.branch_name}</td>
                                  <td className="px-6 py-4 text-xs font-bold">{sale.customer_name || 'Walk-in'}</td>
                                  <td className="px-6 py-4 text-xs font-black text-right">₱{sale.total_amount.toLocaleString()}</td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                                      sale.status === 'Completed' 
                                        ? (theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600")
                                        : "bg-rose-50 text-rose-600"
                                    )}>
                                      {sale.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Restock Suggestions Section */}
                <div className={cn(
                  "mt-8 p-8 border rounded-3xl shadow-xl transition-all relative overflow-hidden",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Globe size={120} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                          theme === 'clinic' ? "bg-pink-600 text-white" : "bg-emerald-600 text-white"
                        )}>
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight">AI Restock Suggestions</h3>
                          <p className="text-slate-500 text-sm">Smart inventory predictions based on your sales patterns.</p>
                        </div>
                      </div>
                      <button 
                        onClick={generateAiSuggestions}
                        disabled={isAnalyzing}
                        className={cn(
                          "px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50",
                          theme === 'clinic' ? "bg-pink-600 text-white hover:bg-pink-700" : "bg-emerald-600 text-white hover:bg-emerald-700"
                        )}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing Data...
                          </>
                        ) : (
                          <>
                            <Globe size={18} />
                            Generate Predictions
                          </>
                        )}
                      </button>
                    </div>

                    {aiSuggestions ? (
                      <div className={cn(
                        "p-6 rounded-2xl border prose prose-sm max-w-none",
                        theme === 'dark' ? "bg-slate-800/50 border-slate-700 prose-invert" : "bg-slate-50 border-slate-100 prose-slate"
                      )}>
                        <Markdown>{aiSuggestions}</Markdown>
                      </div>
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">Click the button above to generate AI-powered restock suggestions.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {currentView === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-4 lg:p-8 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                    theme === 'clinic' ? "bg-pink-600 text-white" : "bg-emerald-600 text-white"
                  )}>
                    <Settings size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-slate-500 text-sm">Configure automated alerts and notifications.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className={cn(
                    "p-8 border rounded-3xl shadow-sm transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Mail size={20} className="text-blue-500" />
                      Automated Email Alerts
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div>
                          <p className="font-bold text-sm">Daily Sales Summary</p>
                          <p className="text-xs text-slate-500">Send an automated end-of-day sales report to the owner.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                          <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div>
                          <p className="font-bold text-sm">Low Stock Notifications</p>
                          <p className="text-xs text-slate-500">Alert the owner immediately when stock hits threshold.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                          <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Email Address</label>
                        <div className="flex gap-2">
                          <input 
                            type="email"
                            placeholder="owner@fitwhite.com"
                            className={cn(
                              "flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none",
                              theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200"
                            )}
                            defaultValue="owner@fitwhite.com"
                          />
                          <button className={cn(
                            "px-6 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg",
                            theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700" : "bg-emerald-600 hover:bg-emerald-700"
                          )}>
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "p-8 border rounded-3xl shadow-sm transition-colors",
                    theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Smartphone size={20} className="text-emerald-500" />
                      SMS Notifications
                    </h3>
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                      <p className="text-slate-400 text-sm font-medium">SMS Integration requires a Twilio API Key. Please contact support to enable.</p>
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
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setBundleForm({ ...bundleForm, price: isNaN(val) ? 0 : val });
                        }}
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
                      {bundleForm.items.map((item) => (
                        <div key={item.productId} className={cn("flex items-center justify-between p-3 rounded-xl border", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
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
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setProductForm({ ...productForm, price: isNaN(val) ? 0 : val });
                        }}
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
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                          setProductForm({ ...productForm, stockToAdd: isNaN(val) ? 0 : val });
                        }}
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
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setCustomerForm({...customerForm, store_credit: isNaN(val) ? 0 : val});
                      }}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                        theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Allergies</label>
                    <textarea 
                      value={customerForm.allergies}
                      onChange={(e) => setCustomerForm({...customerForm, allergies: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all min-h-[80px]",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                        theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                      )}
                      placeholder="List any known allergies..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
                    <textarea 
                      value={customerForm.notes}
                      onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all min-h-[80px]",
                        theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500",
                        theme === 'clinic' && "focus:ring-pink-500/20 focus:border-pink-500"
                      )}
                      placeholder="Additional patient notes..."
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
          {showHistoryModal && selectedCustomerForHistory && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden transition-colors flex flex-col max-h-[90vh]",
                  theme === 'dark' ? "bg-slate-900 border border-slate-800" : "bg-white"
                )}
              >
                <div className={cn("p-6 border-b flex justify-between items-center", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                  <div>
                    <h3 className={cn("text-xl font-bold", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>
                      Treatment History
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedCustomerForHistory.name}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowHistoryModal(false);
                      setShowAddTreatment(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* Patient Profile Summary in History Modal */}
                  <div className={cn(
                    "mb-6 p-4 rounded-2xl border flex flex-col gap-3",
                    theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                  )}>
                    <div className="flex items-center gap-2 text-rose-600">
                      <AlertTriangle size={16} />
                      <h4 className="text-xs font-black uppercase tracking-wider">Patient Medical Profile</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Known Allergies</p>
                        <p className={cn("text-xs font-medium", selectedCustomerForHistory.allergies ? "text-rose-600" : "text-slate-500 italic")}>
                          {selectedCustomerForHistory.allergies || 'No known allergies recorded.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Notes</p>
                        <p className="text-xs text-slate-600 font-medium">
                          {selectedCustomerForHistory.notes || 'No additional notes.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h4 className={cn("text-sm font-bold uppercase tracking-wider text-slate-400")}>Past Treatments</h4>
                    <button 
                      onClick={() => setShowAddTreatment(!showAddTreatment)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        theme === 'clinic' ? "bg-pink-50 text-pink-600 hover:bg-pink-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      )}
                    >
                      {showAddTreatment ? 'Cancel' : (
                        <>
                          <Plus size={14} />
                          Record New Treatment
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddTreatment && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden"
                      >
                        <form onSubmit={handleTreatmentSubmit} className={cn(
                          "p-4 rounded-2xl border space-y-4",
                          theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                        )}>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Treatment/Drip Name</label>
                              <input 
                                type="text"
                                required
                                value={treatmentForm.treatment_name}
                                onChange={(e) => setTreatmentForm({...treatmentForm, treatment_name: e.target.value})}
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 transition-all",
                                  theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-pink-500/20" : "bg-white border-slate-200 focus:ring-emerald-500/20"
                                )}
                                placeholder="e.g. Gluta Drip"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dosage</label>
                              <input 
                                type="text"
                                value={treatmentForm.dosage}
                                onChange={(e) => setTreatmentForm({...treatmentForm, dosage: e.target.value})}
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 transition-all",
                                  theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-pink-500/20" : "bg-white border-slate-200 focus:ring-emerald-500/20"
                                )}
                                placeholder="e.g. 1200mg"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administered By</label>
                            <input 
                              type="text"
                              value={treatmentForm.administered_by}
                              onChange={(e) => setTreatmentForm({...treatmentForm, administered_by: e.target.value})}
                              className={cn(
                                "w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 transition-all",
                                theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-pink-500/20" : "bg-white border-slate-200 focus:ring-emerald-500/20"
                              )}
                              placeholder={user?.username || "Nurse Name"}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Treatment Notes</label>
                            <textarea 
                              value={treatmentForm.notes}
                              onChange={(e) => setTreatmentForm({...treatmentForm, notes: e.target.value})}
                              className={cn(
                                "w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 transition-all min-h-[60px]",
                                theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-200 focus:ring-pink-500/20" : "bg-white border-slate-200 focus:ring-emerald-500/20"
                              )}
                              placeholder="Any specific observations..."
                            />
                          </div>
                          <button
                            type="submit"
                            className={cn(
                              "w-full py-2.5 text-white rounded-xl font-bold text-xs shadow-lg transition-all",
                              theme === 'clinic' ? "bg-pink-600 hover:bg-pink-700" : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                          >
                            Save Treatment Record
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    {treatments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <History size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium">No treatment records found.</p>
                      </div>
                    ) : (
                      treatments.map((t) => (
                        <div key={t.id} className={cn(
                          "p-4 rounded-2xl border transition-all",
                          theme === 'dark' ? "bg-slate-800/30 border-slate-800" : "bg-white border-slate-100 shadow-sm"
                        )}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className={cn("font-bold text-sm", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{t.treatment_name}</h5>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {format(new Date(t.timestamp), 'MMMM d, yyyy • h:mm a')}
                              </p>
                            </div>
                            {t.dosage && (
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                theme === 'clinic' ? "bg-pink-50 text-pink-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                {t.dosage}
                              </span>
                            )}
                          </div>
                          {t.notes && <p className="text-xs text-slate-500 mb-2 italic">"{t.notes}"</p>}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Administered by: {t.administered_by}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1"><Building2 size={10}/> {t.branch_name}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


