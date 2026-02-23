import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { Transaction, TransactionItem, Partner, Product, Employee } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SalesModule = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'QUOTATION' | 'SO' | 'INVOICE_OUT'>('QUOTATION');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [items, setItems] = useState<{ product_id: number, qty: number, price: number, subtotal: number }[]>([]);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
  const [viewItems, setViewItems] = useState<TransactionItem[]>([]);

  const fetchTransactions = () => {
    axios.get('/api/transactions')
      .then(res => setTransactions(res.data.filter((t: any) => ['QUOTATION', 'SO', 'INVOICE_OUT'].includes(t.type))));
  };

  useEffect(() => {
    fetchTransactions();
    axios.get('/api/partners').then(res => setPartners(res.data.filter((p: any) => p.type === 'Customer')));
    axios.get('/api/employees').then(res => setEmployees(res.data));
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);

  const handleCreate = () => {
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const number = `${type === 'INVOICE_OUT' ? 'INV' : type}-${Date.now()}`;
    axios.post('/api/transactions', {
      type,
      number,
      date: new Date().toISOString().split('T')[0],
      partner_id: selectedPartner,
      employee_id: selectedEmployee,
      status: 'DRAFT',
      total_amount: total,
      items
    }).then(() => {
      setShowForm(false);
      fetchTransactions();
      setItems([]);
      setSelectedPartner('');
      setSelectedEmployee('');
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
        <h3 className="text-lg font-semibold">Sales Management</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => { setType('QUOTATION'); setShowForm(true); }}
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Quotation
          </button>
          <button 
            onClick={() => { setType('SO'); setShowForm(true); }}
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Sales Order
          </button>
          <button 
            onClick={() => { setType('INVOICE_OUT'); setShowForm(true); }}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Invoice
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
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Customer</label>
              <select 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
              >
                <option value="">Select Customer</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Sales Person</label>
              <select 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select Sales Person</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
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
                    newItems[idx] = { ...item, product_id: prod?.id || 0, price: prod?.sales_price || 0, subtotal: (prod?.sales_price || 0) * item.qty };
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
          
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="text-sm font-medium text-zinc-900">{viewTransaction.partner_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Sales Person</p>
              <p className="text-sm font-medium text-zinc-900">{viewTransaction.employee_name || 'N/A'}</p>
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
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sales Person</th>
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
                      t.type === 'QUOTATION' ? "bg-amber-50 text-amber-600" : 
                      t.type === 'SO' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900">{t.partner_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900">{t.employee_name || '-'}</td>
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
