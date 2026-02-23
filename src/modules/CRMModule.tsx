import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Filter } from 'lucide-react';
import { Lead } from '../types';

export const CRMModule = () => {
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
