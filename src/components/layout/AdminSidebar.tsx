import React from 'react';
import { Tenant } from '../../types';
import { 
  BarChart, 
  Car, 
  Users, 
  Map, 
  Ticket, 
  Settings, 
  Activity, 
  CheckSquare, 
  BookOpen, 
  Navigation, 
  LogOut, 
  Grid 
} from 'lucide-react';

interface AdminSidebarProps {
  tenant: Tenant;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  onExit: () => void;
}

export default function AdminSidebar({
  tenant,
  activeSubTab,
  setActiveSubTab,
  onExit
}: AdminSidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Overview Metrics', icon: BarChart },
    { id: 'bookings', label: 'Trip Bookings', icon: CheckSquare },
    { id: 'fleet', label: 'Fleet Management', icon: Car },
    { id: 'drivers', label: 'Chauffeur Logs', icon: Users },
    { id: 'routes', label: 'Fixed Routes', icon: Map },
    { id: 'promos', label: 'Promo Campaigns', icon: Ticket },
    { id: 'reviews', label: 'Customer Reviews', icon: BookOpen },
    { id: 'settings', label: 'Business Profile', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-950">
      
      {/* Brand logo block */}
      <div className="p-5 border-b border-slate-800/60 text-left">
        <div className="flex items-center gap-3">
          <div 
            style={{ backgroundColor: tenant.primary_color }} 
            className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-extrabold font-serif text-sm border border-white/10"
          >
            {tenant.business_name[0]}
          </div>
          <div className="leading-tight">
            <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-[150px]">
              {tenant.business_name}
            </h3>
            <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
              TENANT SLUG: {tenant.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Reactive list menus links */}
      <nav className="flex-1 p-4 py-6 space-y-1.5 overflow-y-auto">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-3.5 mb-2">
          Subsystem Pages
        </span>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeSubTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white border-l-4'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
              style={{ borderLeftColor: isSelected ? tenant.primary_color : 'transparent' }}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Exit control block */}
      <div className="p-4 border-t border-slate-800/60 space-y-2">
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40 font-mono text-[9px] text-slate-500">
          <div>LOCALE: {tenant.country_code}</div>
          <div>CURR: {tenant.currency} ({tenant.currency_symbol})</div>
        </div>

        <button
          onClick={onExit}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-850 cursor-pointer transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 text-red-400" />
          EXIT CONSOLE
        </button>
      </div>
    </aside>
  );
}
