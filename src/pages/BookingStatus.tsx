import React, { useState, useEffect } from 'react';
import { TenantBooking, Tenant, Review } from '../types';
import { ITSLocalStorageDB } from '../lib/db';
import LiveTracker from '../components/driver/LiveTracker';
import RatingModal from '../components/shared/RatingModal';
import StatusBadge from '../components/shared/StatusBadge';
import { downloadInvoicePDF } from '../lib/invoiceGenerator';
import { 
  Search, 
  MapPin, 
  User, 
  CreditCard, 
  FileText, 
  Sparkles, 
  Award, 
  PhoneCall, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function BookingStatus() {
  const [searchRef, setSearchRef] = useState('');
  const [booking, setBooking] = useState<TenantBooking | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [searched, setSearched] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Listen for global custom search events from confirmations page
  useEffect(() => {
    const handleGlobalSearch = (e: Event) => {
      const code = (e as CustomEvent).detail;
      if (code) {
        setSearchRef(code);
        triggerSearch(code);
      }
    };
    window.addEventListener('global-search', handleGlobalSearch);
    return () => window.removeEventListener('global-search', handleGlobalSearch);
  }, []);

  const triggerSearch = (refCode: string) => {
    setBooking(null);
    setTenant(null);
    setSearched(true);

    const b = ITSLocalStorageDB.getBookingByRef(refCode);
    if (b) {
      setBooking(b);
      const t = ITSLocalStorageDB.getTenants().find(item => item.id === b.tenant_id);
      if (t) setTenant(t);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      triggerSearch(searchRef.toUpperCase().trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left p-2.5">
      
      {/* Search Input terminal header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-4">
        <div className="leading-snug text-left">
          <h2 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
            Universal Ride Status Verification portal
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-mono">
            INPUT TRAVEL REFERENCE KEY FOR TELEMETRY MAPS & INVOICE PRINTS
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-450">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Enter Ride Code (e.g. ITS-240182)"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 select-all focus:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold font-mono placeholder:text-slate-400 outline-hidden tracking-wider uppercase transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 text-white rounded-2xl px-6 py-3 text-xs font-mono font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            VERIFY SLOT
          </button>
        </form>
      </div>

      {/* Searched item results details block */}
      {searched && !booking && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3 shadow-sm py-12">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800">Booking Reference Not Registered</h3>
          <p className="text-[10px] text-slate-400 leading-normal font-medium">
            Please cross verify references, make sure it matches <strong>{`"ITS-XXXXXX"`}</strong> standard, or select other tenant slugs to generate test files.
          </p>
        </div>
      )}

      {booking && tenant && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main specifications left column */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-3xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="leading-snug">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">UNIQUE KEY</span>
                <span className="text-sm font-bold text-slate-800 font-mono select-all uppercase">
                  {booking.booking_ref}
                </span>
              </div>
              <StatusBadge status={booking.status} type="booking" />
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Pickup / drop items */}
              <div className="space-y-3.5">
                <div className="flex gap-3">
                  <MapPin className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">PASSENGER PICKUP DEPARTURE</span>
                    <span className="font-semibold text-slate-700 leading-snug">{booking.pickup_address}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">DESTINATION DROP SITE</span>
                    <span className="font-semibold text-slate-700 leading-snug">{booking.dropoff_address || 'As Directed (Hourly Charter)'}</span>
                  </div>
                </div>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold text-slate-700">
                <div>
                  <span className="text-[8px] text-slate-400 block font-mono">SCHEDULE DATE</span>
                  <span>{booking.pickup_date}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block font-mono">CHAUFFEUR TIME</span>
                  <span>{booking.pickup_time}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block font-mono">CLASS FLEET</span>
                  <span className="truncate block font-bold">{booking.vehicle_name}</span>
                </div>
              </div>

              {/* Chauffeur info brief banner if assigned */}
              {booking.driver_name && (
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8.5 w-8.5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {booking.driver_name[0]}
                    </div>
                    <div className="leading-tight">
                      <span className="font-bold text-slate-800 block text-[11px]">{booking.driver_name}</span>
                      <span className="text-[9px] text-slate-400">ASSIGNED PREMIUM CHAUFFEUR</span>
                    </div>
                  </div>
                  <a 
                    href={`tel:${booking.passenger_phone}`} 
                    className="p-1.5 bg-white hover:bg-slate-150 rounded-xl border border-slate-150 text-slate-600 transition-colors cursor-pointer"
                    title="Simulate calling driver phone line"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                  </a>
                </div>
              )}

              {/* Custom special comment text */}
              {booking.special_requests && (
                <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-xl leading-normal text-[10px] text-indigo-700">
                  <strong>Traveler Instructions:</strong> {booking.special_requests}
                </div>
              )}

              {/* Invoicing triggers / rating modifiers */}
              <div className="flex gap-2.5 pt-2.5 border-t border-slate-55">
                <button
                  type="button"
                  onClick={() => downloadInvoicePDF(booking, tenant)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono font-bold py-2.5 rounded-xl text-[10px] border border-slate-150 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  PRINT RECEIPT
                </button>

                {booking.status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => setShowRating(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold py-2.5 rounded-xl text-[10px] shadow-3xs"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-300" />
                    POST CHAUFFEUR RATING
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Live GPS position column map */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Live GPS locator mock block */}
            <LiveTracker booking={booking} tenant={tenant} />

            {/* Financial summaries card */}
            <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 border border-slate-950 text-left space-y-3">
              <span className="text-[8px] text-slate-500 font-mono uppercase block tracking-wider">
                Transaction settlement logs
              </span>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Net fare paid</span>
                <span className="text-sm font-extrabold text-white font-mono">
                  {tenant.currency_symbol || '$'} {booking.total_fare.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[10px] text-slate-400">Payment Gateway</span>
                <span className="text-[10px] text-slate-200 font-mono uppercase">
                  {booking.payment_method.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Star Feedback review popup */}
      {showRating && booking && tenant && (
        <RatingModal
          booking={booking}
          tenant={tenant}
          onClose={() => setShowRating(false)}
          onSubmitted={() => {
            // Reload status to register review changes
            triggerSearch(booking.booking_ref);
          }}
        />
      )}
    </div>
  );
}
