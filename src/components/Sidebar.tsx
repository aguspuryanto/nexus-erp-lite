import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BadgeDollarSign, 
  Warehouse, 
  BookOpen, 
  UserCircle, 
  Target, 
  Globe, 
  Settings, 
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavItem } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = ({ activeModule, setActiveModule }: { activeModule: string, setActiveModule: (m: string) => void }) => {
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
