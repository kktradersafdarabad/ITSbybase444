import React from 'react';
import { TenantBooking } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import { Calendar, Eye, MapPin, DollarSign } from 'lucide-react';

interface RecentBookingsTableProps {
  bookings: TenantBooking[];
  currencySymbol: string;
  onViewBooking: (refCode: string) => void;
}

export default function RecentBookingsTable({ bookings, currencySymbol, onViewBooking }: RecentBookingsTableProps) {
  
  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium">
        No travel bookings recorded. Access the "Schedule Rider" panel to generate bookings.
      </div>
    );
  }

  // Slice down first 6 recent items
  const recents = bookings.slice(0, 6);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Recent Operations Sequences</h4>
        <span className="text-[9px] text-slate-400 font-mono">LAST {recents.length} DISPATCHES</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-slate-50">
          <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Reference / Code</th>
              <th className="px-5 py-3">Traveler Name</th>
              <th className="px-5 py-3">Schedule Date</th>
              <th className="px-5 py-3">Itinerary Routes</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
            {recents.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-900">
                  {b.booking_ref}
                </td>
                <td className="px-5 py-3">
                  <div className="leading-tight">
                    <span className="font-bold text-slate-800 block text-wrap max-w-[120px]">{b.passenger_name}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{b.passenger_email}</span>
                  </div>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-mono text-slate-600 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {b.pickup_date} · {b.pickup_time}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="leading-tight max-w-[200px] truncate text-slate-600 font-sans">
                    <span className="font-semibold block truncate">Departure: {b.pickup_address}</span>
                    <span className="text-[10px] text-slate-400 block truncate">Dropoff: {b.dropoff_address || 'As Directed'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-blue-600 font-bold whitespace-nowrap">
                  {currencySymbol} {b.total_fare.toFixed(2)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <StatusBadge status={b.status} type="booking" />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => onViewBooking(b.booking_ref)}
                    className="p-1 px-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-lg text-[10px] font-bold font-mono transition-all inline-flex items-center gap-1 cursor-pointer border border-slate-100"
                  >
                    <Eye className="h-3 w-3" />
                    MONITOR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
