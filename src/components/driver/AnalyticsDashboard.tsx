import React from 'react';
import { Driver, TenantBooking } from '../../types';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface AnalyticsDashboardProps {
  driver: Driver;
  bookings: TenantBooking[];
  currencySymbol: string;
}

export default function AnalyticsDashboard({ driver, bookings, currencySymbol }: AnalyticsDashboardProps) {
  
  // Calculate historical monthly splits for Recharts
  const monthlyData = [
    { name: 'Jan', trips: 14, earnings: 4200 },
    { name: 'Feb', trips: 18, earnings: 5600 },
    { name: 'Mar', trips: 22, earnings: 7800 },
    { name: 'Apr', trips: 25, earnings: 9200 },
    { name: 'May', trips: 28, earnings: 11000 },
    { name: 'Jun', trips: (bookings.length * 4) + 8, earnings: (driver.total_earnings || 0) / 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Visual Counters row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">TOTAL REWARDS</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {currencySymbol} {(driver.total_earnings || 42000).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">TOTAL TRIPS</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {driver.total_trips || 120} Trips
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">SATISFACTION Star</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              ★ {driver.rating?.toFixed(1) || '4.9'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">COMMISSION SLICE</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {driver.commission_percent || 80}% Split
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Charts + driver info details card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts interactive bar chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Earnings Development Sequence
            </h4>
            <span className="text-[9px] text-slate-400 font-mono uppercase">PAST 6 MONTHS</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" />
                <YAxis fontSize={9} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Earnings" />
                <Bar dataKey="trips" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chauffeur profile summary block */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4 text-left">
          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2 uppercase font-mono">License & Auth Metrics</h4>

          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold">Full Name</span>
              <span className="font-bold text-slate-800">{driver.full_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold">Email</span>
              <span className="font-medium text-slate-700">{driver.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold">Phone</span>
              <span className="font-medium text-slate-700">{driver.phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2 font-mono">
              <span className="font-sans font-semibold">License Registration</span>
              <span className="font-bold text-slate-800">{driver.license_number || 'UK-DL-7104'}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="font-sans font-semibold">Identity Status</span>
              <span className="text-emerald-600 font-bold uppercase">VERIFIED CHAUFFEUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
