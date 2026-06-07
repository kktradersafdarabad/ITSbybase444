import React from 'react';
import { Tenant, TenantBooking } from '../../types';
import { downloadInvoicePDF } from '../../lib/invoiceGenerator';
import { 
  CheckCircle, 
  MapPin, 
  FileText, 
  Share2, 
  ExternalLink, 
  Home, 
  Copy, 
  MessageSquare 
} from 'lucide-react';

interface StepConfirmationProps {
  tenant: Tenant;
  booking: TenantBooking | undefined;
  onReset: () => void;
  onTrackLink: (ref: string) => void;
}

export default function StepConfirmation({
  tenant,
  booking,
  onReset,
  onTrackLink
}: StepConfirmationProps) {

  if (!booking) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        No active booking processed. Please construct trip schedules.
      </div>
    );
  }

  const handleCopyRef = () => {
    navigator.clipboard.writeText(booking.booking_ref);
    alert(`Copied reference code: ${booking.booking_ref}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs text-center space-y-6">
      
      {/* Visual Success Accent Banner */}
      <div className="space-y-2">
        <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-200/50 hover:scale-105 transition-transform">
          <CheckCircle className="h-9 w-9" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">Booking Secured Successfully!</h3>
        <p className="text-xs text-slate-400">Your luxury transportation slot has been authorized and Chauffeurs dispatched.</p>
      </div>

      {/* Booking Identifier card */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
          <div className="text-left leading-tight">
            <span className="text-[9px] text-slate-400 font-mono block">BOOKING REFERENCE</span>
            <span className="text-sm font-bold text-slate-800 font-mono select-all uppercase">
              {booking.booking_ref}
            </span>
          </div>
          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer"
          >
            <Copy className="h-3 w-3" />
            COPY CODE
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-left">
          <div>
            <span className="text-[9px] text-slate-400 font-mono block uppercase">TRAVELER</span>
            <span className="font-bold text-slate-700">{booking.passenger_name}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-mono block uppercase">PAYMENT METHOD</span>
            <span className="font-bold text-slate-700 uppercase font-mono">{booking.payment_method.replace('_', ' ')}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] text-slate-400 font-mono block uppercase">PICKUP DEPARTURE</span>
            <span className="font-medium text-slate-650 block leading-tight truncate">{booking.pickup_address}</span>
          </div>
        </div>
      </div>

      {/* Operational guidelines button grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
        <button
          onClick={() => downloadInvoicePDF(booking, tenant)}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-slate-900 rounded-xl py-3 text-xs font-bold font-mono shadow-3xs hover:shadow-sm cursor-pointer transition-all"
        >
          <FileText className="h-4 w-4 text-slate-500" />
          PRINT INVOICE (PDF)
        </button>

        <button
          onClick={() => onTrackLink(booking.booking_ref)}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-3 text-xs font-bold font-mono shadow-3xs cursor-pointer transition-all"
        >
          <ExternalLink className="h-4 w-4 text-amber-400" />
          LIVE RIDE TRACKING
        </button>
      </div>

      {/* WhatsApp verification status summary label */}
      <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl max-w-md mx-auto text-left space-y-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <h4 className="text-[11px] font-bold text-emerald-800 uppercase font-mono">Automated WhatsApp & Email dispatches</h4>
        </div>
        <p className="text-[10px] text-emerald-700 leading-normal font-medium">
          A confirmation card containing download links and secure status triggers has been simulated and printed in the server consoles corresponding to client credentials <strong>{booking.passenger_email}</strong>.
        </p>
      </div>

      {/* Action button */}
      <div className="pt-4 border-t border-slate-50 max-w-md mx-auto">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Book Another Shipment / Return</span>
        </button>
      </div>
    </div>
  );
}
