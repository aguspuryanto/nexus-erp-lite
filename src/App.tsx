import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardStats } from './types';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Modules
import { DashboardModule } from './modules/DashboardModule';
import { MasterDataModule } from './modules/MasterDataModule';
import { PurchasingModule } from './modules/PurchasingModule';
import { SalesModule } from './modules/SalesModule';
import { InventoryModule } from './modules/InventoryModule';
import { CRMModule } from './modules/CRMModule';

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
      case 'sales': return <SalesModule />;
      case 'inventory': return <InventoryModule />;
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
