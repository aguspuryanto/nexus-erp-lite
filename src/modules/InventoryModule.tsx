import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, StockMovement } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const InventoryModule = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [adjType, setAdjType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('ADJUSTMENT');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjRef, setAdjRef] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'reports'>('stock');

  const fetchData = () => {
    axios.get('/api/products').then(res => setProducts(res.data));
    axios.get('/api/inventory/movements').then(res => setMovements(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustment = () => {
    if (!selectedProduct || adjQty <= 0) return;
    axios.post('/api/inventory/adjustments', {
      product_id: selectedProduct,
      type: adjType,
      qty: adjQty,
      reference: adjRef || 'Manual Adjustment'
    }).then(() => {
      setShowAdjustment(false);
      fetchData();
      setSelectedProduct('');
      setAdjQty(0);
      setAdjRef('');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Inventory Management</h3>
        <button 
          onClick={() => setShowAdjustment(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Stock Adjustment
        </button>
      </div>

      <div className="flex gap-4 border-b border-zinc-200">
        <button 
          onClick={() => setActiveTab('stock')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
            activeTab === 'stock' ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          Current Stock
        </button>
        <button 
          onClick={() => setActiveTab('movements')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
            activeTab === 'movements' ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          Stock Movements
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
            activeTab === 'reports' ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          Inventory Reports
        </button>
      </div>

      {showAdjustment && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h4 className="font-semibold">Stock Adjustment</h4>
            <button onClick={() => setShowAdjustment(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Product</label>
              <select 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
              <select 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as any)}
              >
                <option value="ADJUSTMENT">ADJUSTMENT</option>
                <option value="IN">STOCK IN</option>
                <option value="OUT">STOCK OUT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Quantity</label>
              <input 
                type="number" 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={adjQty}
                onChange={(e) => setAdjQty(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Reference/Reason</label>
              <input 
                type="text" 
                className="w-full p-2 bg-zinc-50 border rounded-xl text-sm"
                value={adjRef}
                onChange={(e) => setAdjRef(e.target.value)}
                placeholder="Reference"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleAdjustment}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600"
            >
              Apply Adjustment
            </button>
          </div>
        </div>
      )}

      {activeTab === 'stock' ? (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Current Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-zinc-600">{p.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{p.category}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className={cn(
                        "font-bold",
                        p.stock_qty <= 5 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'movements' ? (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Qty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-500">{new Date(m.date).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                      <div className="flex flex-col">
                        <span>{m.product_name}</span>
                        <span className="text-xs font-mono text-zinc-400">{m.product_code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        m.type === 'IN' ? "bg-emerald-50 text-emerald-600" : 
                        m.type === 'OUT' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      {m.type === 'OUT' ? '-' : '+'}{m.qty}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{m.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <p className="text-sm text-zinc-500 font-medium">Total Stock Value</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">
                ${products.reduce((acc, p) => acc + (p.stock_qty * (p.purchase_price || 0)), 0).toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-2">Based on purchase price</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <p className="text-sm text-zinc-500 font-medium">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                {products.filter(p => p.stock_qty <= 5).length}
              </h3>
              <p className="text-xs text-zinc-400 mt-2">Items with stock ≤ 5</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <p className="text-sm text-zinc-500 font-medium">Total Movements (30d)</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                {movements.length}
              </h3>
              <p className="text-xs text-zinc-400 mt-2">Total IN/OUT transactions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <h4 className="font-semibold mb-4">Low Stock Alerts</h4>
              <div className="space-y-3">
                {products.filter(p => p.stock_qty <= 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600">{p.stock_qty} {p.unit}</p>
                      <p className="text-[10px] text-rose-400 font-medium uppercase">Critical</p>
                    </div>
                  </div>
                ))}
                {products.filter(p => p.stock_qty <= 5).length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-4">No low stock alerts</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <h4 className="font-semibold mb-4">Stock Value by Category</h4>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    Object.entries(products.reduce((acc: any, p) => {
                      acc[p.category] = (acc[p.category] || 0) + (p.stock_qty * (p.purchase_price || 0));
                      return acc;
                    }, {})).map(([name, value]) => ({ name, value }))
                  }>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
