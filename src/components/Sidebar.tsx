import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  MapPin, 
  TrendingUp, 
  Building2, 
  LogOut, 
  Compass, 
  Settings, 
  ShieldCheck,
  User
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
}

export default function Sidebar({ activeTab, setActiveTab, userEmail }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Portal', icon: LayoutDashboard },
    { id: 'book', label: 'Book New Shipment', icon: PlusCircle },
    { id: 'track', label: 'Live GPS Tracking', icon: MapPin },
    { id: 'rates', label: 'Carrier Tariffs', icon: TrendingUp },
  ];

  return (
    <div className="w-80 bg-slate-900 text-white min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      {/* Top Brand Block */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Compass className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-lg text-white">ITS Cargo Logistics</h1>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Intelligent Transit</span>
          </div>
        </div>

        {/* Integration Status Pill */}
        <div className="bg-slate-800/60 rounded-xl p-3 mb-8 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono text-slate-300">Firebase Cloud DB</span>
          </div>
          <span className="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono uppercase">Live</span>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Information & Deployment Context */}
      <div className="p-6 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{userEmail || 'Admin Trader'}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase truncate">Netlify Host Ready</p>
          </div>
        </div>

        {/* Security / Quality verification Badge */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>SSL Encryption Enabled</span>
        </div>
      </div>
    </div>
  );
}
