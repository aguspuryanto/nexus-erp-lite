import React from 'react';
import { Search } from 'lucide-react';

export const Header = ({ title }: { title: string }) => (
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
