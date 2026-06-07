import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver, TenantBooking, Tenant, Vehicle } from '../types';
import { ITSLocalStorageDB } from '../lib/db';
import AnalyticsDashboard from '../components/driver/AnalyticsDashboard';
import PwaInstallBanner from '../components/driver/PwaInstallBanner';
import StatusBadge from '../components/shared/StatusBadge';
import { sendWhatsAppBookingConfirmation } from '../lib/whatsappService';
import { sendBookingConfirmationEmail } from '../lib/emailService';
import { 
  Compass, 
  MapPin, 
  User, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Briefcase, 
  ChevronRight, 
  LogOut, 
  SlidersHorizontal 
} from 'lucide-react';

export default function DriverApp() {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'elite-ride';
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'analytics'>('jobs');
  const [selectedBooking, setSelectedBooking] = useState<TenantBooking | null>(null);

  useEffect(() => {
    const t = ITSLocalStorageDB.getTenantBySlug(activeSlug);
    if (t) {
      setTenant(t);
      // Fetch drivers for this tenant context
      const drs = ITSLocalStorageDB.getDrivers(t.id);
      if (drs.length > 0) {
        setDriver(drs[0]); // Default to first simulated chauffeur
        const allBookings = ITSLocalStorageDB.getBookings(t.id).filter(
          b => b.driver_id === drs[0].id
        );
        setBookings(allBookings);
      }
    }
  }, [activeSlug]);

  const handleStatusTransition = (bookingId: string, nextStatus: 'arrived' | 'in_progress' | 'completed') => {
    // Update local DB
    const updated = ITSLocalStorageDB_update_status(bookingId, nextStatus);
    if (updated) {
      setSelectedBooking(updated);
      
      // Sync list
      if (tenant && driver) {
        setBookings(ITSLocalStorageDB.getBookings(tenant.id).filter(b => b.driver_id === driver.id));
      }

      // If completed, update driver earnings
      if (nextStatus === 'completed' && driver && tenant) {
        const d = { ...driver };
        d.total_earnings = (d.total_earnings || 42000) + (updated.total_fare * 0.8); // 80% split
        d.total_trips = (d.total_trips || 120) + 1;
        d.status = 'available';
        ITSLocalStorageDB.saveDriver(d);
        setDriver(d);
      }

      // Trigger dummy logs and alerts
      console.log(`[DRIVER FLOW] Transitioned Booking ${updated.booking_ref} to ${nextStatus.toUpperCase()}`);
    }
  };

  const ITSLocalStorageDB_update_status = (id: string, nextStatus: any) => {
    try {
      const data = localStorage.getItem('its_bookings');
      if (data) {
        const bookingsList: TenantBooking[] = JSON.parse(data);
        const idx = bookingsList.findIndex(b => b.id === id);
        if (idx !== -1) {
          bookingsList[idx].status = nextStatus;
          // If cash, mark paid on completion
          if (nextStatus === 'completed' && bookingsList[idx].payment_method === 'cash') {
            bookingsList[idx].payment_status = 'paid';
          }
          localStorage.setItem('its_bookings', JSON.stringify(bookingsList));
          return bookingsList[idx];
        }
      }
    }catch(e){}
    return null;
  };

  if (!tenant || !driver) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-medium">
        Syncing Chauffeur console files...
      </div>
    );
  }

  // Active Job filtered
  const activeJobs = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left p-2">
      
      {/* Upper white mobile PWA banner bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center font-extrabold font-serif text-sm border border-white/5 shadow-inner">
            {driver.full_name[0]}
          </div>
          <div className="leading-snug text-left">
            <h2 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
              Logged in: Chauffeur {driver.full_name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono block uppercase">
                FLEET ASSIGNED: {driver.vehicle_model || 'Premium Class Sedan'} (★ {driver.rating?.toFixed(1) || '4.9'})
              </span>
            </div>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 w-fit">
          <button
            onClick={() => {
              setActiveTab('jobs');
              setSelectedBooking(null);
            }}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer uppercase ${
              activeTab === 'jobs' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            ACTIVE DISPATCHES ({activeJobs.length})
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer uppercase ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            MONTHLY PERFORMANCE
          </button>
        </div>
      </div>

      {/* PWA smart install prompter */}
      <PwaInstallBanner />

      {/* Primary Tab router switch */}
      {activeTab === 'analytics' ? (
        <AnalyticsDashboard
          driver={driver}
          bookings={bookings}
          currencySymbol={tenant.currency_symbol || '$'}
        />
      ) : (
        /* Jobs routing */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel lists job cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">
                Schedules Assigned
              </h3>
            </div>

            {activeJobs.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center text-xs text-slate-400 font-semibold py-12">
                No active dispatches available for this vehicle.
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeJobs.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className={`bg-white border rounded-2xl p-4.5 text-left cursor-pointer transition-all hover:shadow-xs hover:border-slate-350 ${
                      selectedBooking?.id === b.id
                        ? 'border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <span className="font-mono text-[10px] text-slate-900 font-bold">{b.booking_ref}</span>
                      <StatusBadge status={b.status} type="booking" />
                    </div>

                    <div className="mt-3.5 space-y-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Calendar className="h-4 w-4 text-slate-450 shrink-0" />
                        <span>{b.pickup_date} at {b.pickup_time}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px] leading-tight text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="truncate block max-w-[200px]">Pickup: {b.pickup_address}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 flex justify-between items-center mt-3 border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-mono block">SETTLED VALUE</span>
                      <span className="text-xs font-bold text-blue-600 font-mono">
                        {tenant.currency_symbol || '$'} {b.total_fare.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right active dispatcher sequence controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-3xs text-left space-y-4">
            
            {selectedBooking ? (
              <div className="space-y-4">
                <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                  <div className="leading-tight">
                    <h4 className="text-xs font-bold text-slate-800">Job Detail Controls</h4>
                    <span className="text-[9px] text-slate-400 font-mono">REF: {selectedBooking.booking_ref}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-50 px-2.5 py-1 rounded-md">
                    METHOD: {selectedBooking.payment_method.toUpperCase()}
                  </span>
                </div>

                {/* Itined points */}
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-400 block font-mono">PASSENGER NAME</span>
                    <span className="font-bold text-slate-800 block">{selectedBooking.passenger_name} ({selectedBooking.passenger_phone})</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-400 block font-mono">DEPARTURE ROUTE ADDR</span>
                    <span className="font-medium text-slate-650 leading-tight block">{selectedBooking.pickup_address}</span>
                  </div>

                  {selectedBooking.dropoff_address && (
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 block font-mono">TARGET TERMINAL DESTINATION</span>
                      <span className="font-medium text-slate-650 leading-tight block">{selectedBooking.dropoff_address}</span>
                    </div>
                  )}

                  {selectedBooking.special_requests && (
                    <div className="p-3 bg-indigo-50 text-[10px] text-indigo-700 rounded-xl leading-normal">
                      <strong>Client Note:</strong> {selectedBooking.special_requests}
                    </div>
                  )}
                </div>

                {/* Workflow status trigger lists */}
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-3 pt-3.5">
                  <h5 className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                    Trigger GPS Stage Shift
                  </h5>

                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusTransition(selectedBooking.id, 'arrived')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center font-mono uppercase tracking-wide block"
                    >
                      ✓ I HAVE ARRIVED AT PICKUP LOCATION
                    </button>
                  )}

                  {selectedBooking.status === 'arrived' && (
                    <button
                      onClick={() => handleStatusTransition(selectedBooking.id, 'in_progress')}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center font-mono uppercase tracking-wide block"
                    >
                      ▶ BOARD PASSENGERS // START JOURNEY
                    </button>
                  )}

                  {selectedBooking.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusTransition(selectedBooking.id, 'completed')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center font-mono uppercase tracking-wide block"
                    >
                      ✓ TRIP COMPLETE // SETTLE RIDE VALUE
                    </button>
                  )}

                  {selectedBooking.status === 'completed' && (
                    <div className="text-center py-2 text-xs text-green-700 font-semibold flex items-center justify-center gap-1.5 bg-green-50 rounded-xl border border-green-150 p-2 leading-none">
                      <span>✓ Dispatch completed and passenger slate settled.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-450 font-medium">
                Please tap an active dispatch sequence cards card on the left panel to trigger live GPS workflows.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
