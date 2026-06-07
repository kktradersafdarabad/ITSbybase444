import React from 'react';
import { BookingStatus, BookingPaymentStatus, TenantStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus | BookingPaymentStatus | TenantStatus;
  type?: 'booking' | 'payment' | 'tenant';
}

export default function StatusBadge({ status, type = 'booking' }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    const s = status.toLowerCase();
    
    if (type === 'booking') {
      switch (s) {
        case 'pending': 
          return 'bg-slate-100 text-slate-700 border-slate-200';
        case 'confirmed': 
          return 'bg-indigo-50 text-indigo-700 border-indigo-100/80';
        case 'arrived': 
          return 'bg-amber-50 text-amber-700 border-amber-100/80';
        case 'in_progress': 
          return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'completed': 
          return 'bg-green-50 text-green-700 border-green-100';
        case 'cancelled': 
          return 'bg-red-50 text-red-700 border-red-100';
        default: 
          return 'bg-slate-50 text-slate-500 border-slate-100';
      }
    } else if (type === 'payment') {
      switch (s) {
        case 'paid': 
          return 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50';
        case 'pending': 
          return 'bg-amber-500/10 text-amber-600 border-amber-200/50';
        case 'refunded': 
          return 'bg-slate-500/10 text-slate-600 border-slate-200';
        default: 
          return 'bg-slate-100 text-slate-600 border-slate-200';
      }
    } else { // tenant/plan status
      switch (s) {
        case 'active': 
          return 'bg-green-500/10 text-green-600 border-green-200/50';
        case 'suspended': 
          return 'bg-red-500/10 text-red-600 border-red-200/50';
        case 'cancelled': 
          return 'bg-gray-500/10 text-gray-600 border-gray-200';
        default: 
          return 'bg-blue-500/10 text-blue-600 border-blue-200/50';
      }
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold font-mono uppercase rounded-full border ${getBadgeStyle()}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace('_', ' ')}
    </span>
  );
}
