import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BadgeDollarSign, 
  Warehouse, 
  BookOpen, 
  UserCircle, 
  Target, 
  Globe, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DashboardStats, Product, Partner, Transaction, TransactionItem, Employee, Lead, NavItem } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ activeModule, setActiveModule }: { activeModule: string, setActiveModule: (m: string) => void }) => {
  const navItems: NavItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '#', module: 'dashboard' },
    { title: 'Master Data', icon: Package, href: '#', module: 'master' },
    { title: 'Purchasing', icon: ShoppingCart, href: '#', module: 'purchasing' },
    { title: 'Sales', icon: BadgeDollarSign, href: '#', module: 'sales' },
    { title: 'Inventory', icon: Warehouse, href: '#', module: 'inventory' },
    { title: 'Accounting', icon: BookOpen, href: '#', module: 'accounting' },
    { title: 'HRD', icon: UserCircle, href: '#', module: 'hrd' },
    { title: 'CRM', icon: Target, href: '#', module: 'crm' },
    { title: 'CMS', icon: Globe, href: '#', module: 'cms' },
    { title: 'Settings', icon: Settings, href: '#', module: 'settings' },
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-400 flex flex-col h-screen border-r border-zinc-800/50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-950 font-bold">N</div>
        <span className="text-white font-semibold tracking-tight text-lg">NexusERP</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.module}
            onClick={() => setActiveModule(item.module)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              activeModule === item.module 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "hover:bg-zinc-900 hover:text-zinc-200"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeModule === item.module ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
            )} />
            <span className="text-sm font-medium">{item.title}</span>
            {activeModule === item.module && (
              <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 hover:text-zinc-200 transition-all">
          <LogOut className="w-5 h-5 text-zinc-500" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title }: { title: string }) => (
  <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
    <h1 className="text-xl font-semibold text-zinc-900 capitalize">{title}</h1>
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="pl-10 pr-4 py-2 bg-zinc-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
        />
      </div>
      <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden border border-zinc-300">
        <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
      </div>
    </div>
  </header>
);

const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm text-zinc-500 font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-zinc-900 mt-1">{value}</h3>
  </div>
);

// --- Modules ---

const DashboardModule = ({ stats }: { stats: DashboardStats | null }) => {
  const data = [
    { name: 'Jan', sales: 4000, expenses: 2400 },
    { name: 'Feb', sales: 3000, expenses: 1398 },
    { name: 'Mar', sales: 2000, expenses: 9800 },
    { name: 'Apr', sales: 2780, expenses: 3908 },
    { name: 'May', sales: 1890, expenses: 4800 },
    { name: 'Jun', sales: 2390, expenses: 3800 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats?.revenue.toLocaleString() || 0}`} 
          icon={TrendingUp} 
          trend="+12.5%" 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${stats?.expenses.toLocaleString() || 0}`} 
          icon={TrendingDown} 
          trend="-2.4%" 
          color="bg-rose-50 text-rose-600" 
        />
        <StatCard 
          title="Active Products" 
          value={stats?.productCount || 0} 
          icon={Package} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Total Employees" 
          value={stats?.employeeCount || 0} 
          icon={Users} 
          color="bg-amber-50 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Revenue vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">New Invoice Created</p>
                  <p className="text-xs text-zinc-500">Invoice #INV-2024-00{i} for John Doe Corp</p>
                </div>
                <span className="text-xs text-zinc-400">2h ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MasterDataModule = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Master</h3>
        <button className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-mono text-zinc-600">{p.code}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{p.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{p.category}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    p.stock_qty > 5 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {p.stock_qty} {p.unit}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">${p.sales_price}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-zinc-400 hover:text-emerald-600 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PurchasingModule = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'PR' | 'PO'>('PR');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [items, setItems] = useState<{ product_id: number, qty: number, price: number, subtotal: number }[]>([]);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
  const [viewItems, setViewItems] = useState<TransactionItem[]>([]);

  const fetchTransactions = () => {
    axios.get('/api/transactions')
      .then(res => setTransactions(res.data.filter((t: any) => t.type === 'PR' || t.type === 'PO')));
  };

  useEffect(() => {
    fetchTransactions();
    axios.get('/api/partners').then(res => setPartners(res.data.filter((p: any) => p.type === 'Supplier')));
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);

  const handleCreate = () => {
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const number = `${type}-${Date.now()}`;
    axios.post('/api/transactions', {
      type,
      number,
      date: new Date().toISOString().split('T')[0],
      partner_id: selectedPartner,
      status: 'DRAFT',
      total_amount: total,
      items
    }).then(() => {
      setShowForm(false);
      fetchTransactions();
      setItems([]);
      setSelectedPartner('');
    });
  };

  const handleStatusUpdate = (id: number, status: string) => {
    axios.put(`/api/transactions/${id}`, { status }).then(fetchTransactions);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      axios.delete(`/api/transactions/${id}`).then(fetchTransactions);
    }
  };

  const handleViewDetails = (t: Transaction) => {
    setViewTransaction(t);
    axios.get(`/api/transactions/${t.id}/items`).then(res => setViewItems(res.data));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Purchasing Management</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => { setType('PR'); setShowForm(true); }}
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Requisition (PR)
          </button>
          <button 
            onClick={() => { setType('PO'); setShowForm(true); }}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Order (PO)
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h4 className="font-semibold">Create New {type}</h4>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Supplier</label>
              <select 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
              >
                <option value="">Select Supplier</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select 
                  className="flex-1 p-2 bg-zinc-50 border rounded-xl text-sm"
                  value={item.product_id}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === parseInt(e.target.value));
                    const newItems = [...items];
                    newItems[idx] = { ...item, product_id: prod?.id || 0, price: prod?.purchase_price || 0, subtotal: (prod?.purchase_price || 0) * item.qty };
                    setItems(newItems);
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Qty" 
                  className="w-24 p-2 bg-zinc-50 border rounded-xl text-sm"
                  value={item.qty}
                  onChange={(e) => {
                    const qty = parseFloat(e.target.value) || 0;
                    const newItems = [...items];
                    newItems[idx] = { ...item, qty, subtotal: item.price * qty };
                    setItems(newItems);
                  }}
                />
                <button 
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setItems([...items, { product_id: 0, qty: 1, price: 0, subtotal: 0 }])}
              className="text-emerald-600 text-xs font-bold hover:underline"
            >
              + Add Item
            </button>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleCreate}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600"
            >
              Save {type}
            </button>
          </div>
        </div>
      )}

      {viewTransaction && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h4 className="font-semibold text-lg">{viewTransaction.number} Details</h4>
              <p className="text-sm text-zinc-500">{viewTransaction.type} - {viewTransaction.date}</p>
            </div>
            <button onClick={() => setViewTransaction(null)} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Supplier</p>
              <p className="text-sm font-medium text-zinc-900">{viewTransaction.partner_name || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xl font-bold text-emerald-600">${viewTransaction.total_amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="overflow-hidden border border-zinc-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Qty</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Price</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {viewItems.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-4 py-3 font-mono text-zinc-500">{item.product_code}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{item.product_name}</td>
                    <td className="px-4 py-3 text-right text-zinc-600">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-zinc-600">${item.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900">${item.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-600">{t.number}</td>
                  <td className="px-6 py-4 text-sm font-bold">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px]",
                      t.type === 'PR' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900">{t.partner_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{t.date}</td>
                  <td className="px-6 py-4 text-sm font-medium">${t.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <select 
                      className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg border-none focus:ring-0",
                        t.status === 'DRAFT' && "bg-zinc-100 text-zinc-600",
                        t.status === 'APPROVED' && "bg-emerald-50 text-emerald-600",
                        t.status === 'REJECTED' && "bg-rose-50 text-rose-600",
                        t.status === 'COMPLETED' && "bg-blue-50 text-blue-600"
                      )}
                      value={t.status}
                      onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleViewDetails(t)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
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
    </div>
  );
};

const CRMModule = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    axios.get('/api/leads')
      .then(res => setLeads(res.data));
  }, []);

  const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sales Pipeline</h3>
        <div className="flex gap-2">
          <button className="bg-white border border-zinc-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage} className="min-w-[250px] space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stage}</span>
              <span className="text-xs font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                {leads.filter(l => l.status === stage).length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(l => l.status === stage).map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer group">
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors">{lead.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{lead.company}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-900">${lead.value.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400">{lead.last_follow_up}</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-500 transition-all text-xs font-medium">
                + Add Lead
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data));
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardModule stats={stats} />;
      case 'master': return <MasterDataModule />;
      case 'purchasing': return <PurchasingModule />;
      case 'crm': return <CRMModule />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-400 space-y-4">
          <div className="p-4 bg-zinc-100 rounded-full">
            <Settings className="w-12 h-12 animate-spin-slow" />
          </div>
          <p className="text-lg font-medium">Module "{activeModule}" is under development</p>
          <p className="text-sm">We're working hard to bring this feature to you soon.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={activeModule} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
