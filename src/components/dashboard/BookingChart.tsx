import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface BookingChartProps {
  tenantId: string;
  currencySymbol: string;
}

export default function BookingChart({ tenantId, currencySymbol }: BookingChartProps) {
  
  // Real statistical sequences mock representations
  const data = [
    { day: 'Mon', completed: 4, revenue: 320 },
    { day: 'Tue', completed: 6, revenue: 540 },
    { day: 'Wed', completed: 8, revenue: 780 },
    { day: 'Thu', completed: 5, revenue: 490 },
    { day: 'Fri', completed: 11, revenue: 1250 },
    { day: 'Sat', completed: 15, revenue: 1980 },
    { day: 'Sun', completed: 10, revenue: 1150 }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-50 pb-2">
        <div className="leading-tight text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase font-mono flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Weekly Operations Curve & Sales
          </h4>
          <span className="text-[9px] text-slate-400 font-mono block">LIVE REVENUE SCALES UPDATING</span>
        </div>

        <div className="flex gap-3 text-[10px] font-bold font-mono">
          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            BLUE: REVENUE
          </span>
          <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            COMPLETED RIDES (★)
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" fontSize={9} stroke="#94a3b8" />
            <YAxis fontSize={9} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
              itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
              formatter={(value) => [`${currencySymbol} ${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
