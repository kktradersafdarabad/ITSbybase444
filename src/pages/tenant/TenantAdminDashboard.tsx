import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tenant, Vehicle, Driver, Route, PromoCode, TenantBooking } from '../../types';
import { ITSLocalStorageDB } from '../../lib/db';
import AdminSidebar from '../../components/layout/AdminSidebar';
import BookingChart from '../../components/dashboard/BookingChart';
import RecentBookingsTable from '../../components/dashboard/RecentBookingsTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { PlusCircle, Trash, Edit, Star, Sliders, Settings, Car, Users, Ticket, Map, Check, X, ShieldAlert } from 'lucide-react';

export default function TenantAdminDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'elite-ride';
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  // Generic List States
  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Modals / Add/Edit States
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form Fields
  const [nameField, setNameField] = useState('');
  const [vModel, setVModel] = useState('');
  const [vCategory, setVCategory] = useState<'sedan' | 'suv' | 'luxury' | 'van'>('sedan');
  const [vPassengers, setVPassengers] = useState(4);
  const [vBase, setVBase] = useState(25);
  const [vKm, setVKm] = useState(2);
  const [vHour, setVHour] = useState(55);

  const [routePickup, setRoutePickup] = useState('');
  const [routeDrop, setRouteDrop] = useState('');
  const [routeFlat, setRouteFlat] = useState(99);

  const [promoCodeVal, setPromoCodeVal] = useState('');
  const [promoRate, setPromoRate] = useState(15);
  const [promoType, setPromoType] = useState<'percentage' | 'fixed'>('percentage');

  // Load configuration based on URL Slug
  useEffect(() => {
    const t = ITSLocalStorageDB.getTenantBySlug(activeSlug);
    if (t) {
      setTenant(t);
      reload_all_lists(t.id);
    }
  }, [activeSlug]);

  const reload_all_lists = (tenantId: string) => {
    setBookings(ITSLocalStorageDB.getBookings(tenantId));
    setVehicles(ITSLocalStorageDB.getVehicles(tenantId));
    setDrivers(ITSLocalStorageDB.getDrivers(tenantId));
    setRoutes(ITSLocalStorageDB.getRoutes(tenantId));
    setPromos(ITSLocalStorageDB.getPromos(tenantId));
    setReviews(ITSLocalStorageDB.getReviews(tenantId));
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      tenant_id: tenant.id,
      name: nameField,
      model: vModel || 'Chauffeur Class Classic',
      category: vCategory,
      max_passengers: vPassengers,
      max_luggage: vCategory === 'van' ? 8 : 3,
      base_fare: vBase,
      rate_per_km: vKm,
      rate_per_hour: vHour,
      is_active: true,
      image_url: vCategory === 'luxury' 
        ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=450'
        : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=450'
    };

    ITSLocalStorageDB.saveVehicle(newVeh);
    reload_all_lists(tenant.id);
    setShowForm(false);
    setNameField('');
    setVModel('');
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    const newRoute: Route = {
      id: `rt-${Date.now()}`,
      tenant_id: tenant.id,
      name: `${routePickup} to ${routeDrop} VIP Shuttle`,
      pickup_area: routePickup,
      dropoff_area: routeDrop,
      flat_rate: routeFlat,
      is_active: true,
      distance_km: 30
    };

    ITSLocalStorageDB.saveRoute(newRoute);
    reload_all_lists(tenant.id);
    setShowForm(false);
    setRoutePickup('');
    setRouteDrop('');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    const newPromo: PromoCode = {
      id: `prm-${Date.now()}`,
      tenant_id: tenant.id,
      code: promoCodeVal.toUpperCase().trim(),
      discount_type: promoType,
      discount_value: promoRate,
      is_active: true,
      min_booking_amount: 30
    };

    ITSLocalStorageDB.savePromo(newPromo);
    reload_all_lists(tenant.id);
    setShowForm(false);
    setPromoCodeVal('');
  };

  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    // Save updated tenant properties
    ITSLocalStorageDB.saveTenant(tenant);
    alert('Corporate billing configurations updated successfully!');
  };

  if (!tenant) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-medium">
        Loading Tenant Admin Profile...
      </div>
    );
  }

  // Calculated totals indicators
  const grossSales = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_fare, 0);
  const totalFleet = vehicles.length;
  const totalDrivers = drivers.length;
  const upcomingSchedules = bookings.filter(b => b.status === 'confirmed' || b.status === 'arrived').length;

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      
      {/* Sidebar layouts */}
      <AdminSidebar
        tenant={tenant}
        activeSubTab={activeSubTab}
        setActiveSubTab={(tab) => {
          setActiveSubTab(tab);
          setShowForm(false);
        }}
        onExit={() => navigate('/')}
      />

      {/* Main workspace container */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Dynamic Inner SubTab routing */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Visual Analytics Grid counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  ★
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">COMPLETED REVENUE</span>
                  <span className="text-sm font-extrabold text-slate-800 font-mono">
                    {tenant.currency_symbol || '$'} {grossSales.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  ★
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">PENDING DISPATCHES</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {upcomingSchedules} Scheduled
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Car className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">FLEET ACTIVE LIMIT</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {totalFleet} Cars Assigned
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">REGISTERED CHAUFFEURS</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {totalDrivers} Active
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Revenue sequence */}
            <BookingChart tenantId={tenant.id} currencySymbol={tenant.currency_symbol || '$'} />

            {/* Bookings log table list */}
            <RecentBookingsTable 
              bookings={bookings} 
              currencySymbol={tenant.currency_symbol || '$'} 
              onViewBooking={(code) => {
                alert(`Redirecting to universal tracker portal for travel card ref: ${code}`);
                navigate('/booking/status');
                setTimeout(() => {
                  const event = new CustomEvent('global-search', { detail: code });
                  window.dispatchEvent(event);
                }, 50);
              }}
            />
          </div>
        )}

        {activeSubTab === 'bookings' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-805 tracking-tight uppercase font-mono text-left">Detailed Scheduling Log Ledger</h3>
            <RecentBookingsTable
              bookings={bookings}
              currencySymbol={tenant.currency_symbol || '$'}
              onViewBooking={(code) => {
                navigate('/booking/status');
                setTimeout(() => {
                  const event = new CustomEvent('global-search', { detail: code });
                  window.dispatchEvent(event);
                }, 50);
              }}
            />
          </div>
        )}

        {/* FLEET MANAGEMENT TAB INTERACTIVE */}
        {activeSubTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Assigned Corporate Fleet Vehicles</h4>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                ADD FLEET MEMBER
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreateVehicle} className="bg-white border border-slate-200 rounded-2xl p-5 max-w-2xl text-left space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">VEHICLE BRAND / NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mercedes-Benz S-Class"
                      value={nameField}
                      onChange={e => setNameField(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">MODEL CODE YEAR</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026 Edition"
                      value={vModel}
                      onChange={e => setVModel(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">CLASSIFY SLOT CATEGORY</label>
                    <select
                      value={vCategory}
                      onChange={e => setVCategory(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="sedan">Executive Sedan Class (Standard)</option>
                      <option value="suv">Premium SUV (All-Weather)</option>
                      <option value="luxury">Luxury Elite Edition</option>
                      <option value="van">Luxury Van Shuttler (14 Seats)</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">MAX PASSENGERS</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={vPassengers}
                      onChange={e => setVPassengers(parseInt(e.target.value, 15) || 4)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 col-span-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">BASE TARIFF</label>
                      <input
                        type="number"
                        value={vBase}
                        onChange={e => setVBase(parseFloat(e.target.value) || 0)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">RATE PER KM</label>
                      <input
                        type="number"
                        value={vKm}
                        onChange={e => setVKm(parseFloat(e.target.value) || 0)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">RATE PER HOUR</label>
                      <input
                        type="number"
                        value={vHour}
                        onChange={e => setVHour(parseFloat(e.target.value) || 0)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-slate-250 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Save Vehicle Specs
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 flex flex-col justify-between space-y-4 shadow-3xs text-left">
                  <div className="space-y-2">
                    <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-50">
                      <img src={v.image_url} alt={v.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{v.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono uppercase">MODEL: {v.model} ({v.category})</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] font-mono border border-slate-100 space-y-1 text-slate-600 block mt-1.5">
                    <div>BASE FARE: {tenant.currency_symbol || '$'}{v.base_fare}</div>
                    <div>PER KM TARIFF: {tenant.currency_symbol || '$'}{v.rate_per_km}</div>
                    <div>CHARTER HOUR: {tenant.currency_symbol || '$'}{v.rate_per_hour}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAUFFEURS LOG ACTIONS */}
        {activeSubTab === 'drivers' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono text-left border-b border-slate-100 pb-2">Registered Professional Chauffeurs Logs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              {drivers.map(d => (
                <div key={d.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 flex items-start gap-4.5 shadow-3xs">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-extrabold shrink-0 border border-slate-150">
                    {d.full_name[0]}
                  </div>
                  <div className="flex-1 space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block">{d.full_name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">LICENSE: {d.license_number}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">CONTACT: {d.phone}</span>
                    
                    <div className="flex gap-2.5 pt-2">
                      <span className="text-[9px] font-mono font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 uppercase">
                        {d.status}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 uppercase">
                        ★ {d.rating?.toFixed(1) || '4.9'} OVERALL
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIXED ROUTES TAB */}
        {activeSubTab === 'routes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Fixed Flat-Rate Routes</h4>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                ADD FIXED ROUTE
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreateRoute} className="bg-white border border-slate-250 rounded-2xl p-5 max-w-xl text-left space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">Pickup Area Terminal</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sialkot Dry Port Terminal Gateway"
                      value={routePickup}
                      onChange={e => setRoutePickup(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">Dropoff Destination Area</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lahore Airport Allama Iqbal Cargo"
                      value={routeDrop}
                      onChange={e => setRouteDrop(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 w-32">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">Flat Rate Price ({tenant.currency_symbol})</label>
                    <input
                      type="number"
                      required
                      value={routeFlat}
                      onChange={e => setRouteFlat(parseFloat(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-100 rounded-xl text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                    Authorise Route
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {routes.map(r => (
                <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-3xs text-left space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs block">{r.name}</h5>
                    <p className="text-[10px] mt-2 font-medium text-slate-500">
                      From: {r.pickup_area} <br />
                      To: {r.dropoff_area}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100 font-mono font-bold text-blue-600 block text-xs">
                    FLAT COST: {tenant.currency_symbol} {r.flat_rate.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMO CAMPAIGNS TAB */}
        {activeSubTab === 'promos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Promotional Campaigns Codes</h4>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                CREATE CAMPAIGN
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreatePromo} className="bg-white border border-slate-250 rounded-2xl p-5 max-w-xl text-left space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">Promo String Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SPECIAL30"
                      value={promoCodeVal}
                      onChange={e => setPromoCodeVal(e.target.value.toUpperCase())}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold uppercase"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">Reduction Type</label>
                    <select
                      value={promoType}
                      onChange={e => setPromoType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs"
                    >
                      <option value="percentage">Percentage Allocation (% Off)</option>
                      <option value="fixed">Fixed Rate Offset</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1 w-32">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">Reduction Value</label>
                    <input
                      type="number"
                      required
                      value={promoRate}
                      onChange={e => setPromoRate(parseFloat(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-100 rounded-xl text-xs font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold font-mono">
                    Activate Code
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {promos.map(p => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-3xs text-left flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 block tracking-wider uppercase bg-slate-150 border border-slate-200/50 px-2 py-0.5 rounded w-fit">
                      {p.code}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1.5 font-semibold">
                      Discount: {p.discount_value} {p.discount_type === 'percentage' ? '%' : tenant.currency_symbol} OFF
                    </span>
                  </div>

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Campaign code is active" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMER REVIEWS LIST */}
        {activeSubTab === 'reviews' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono text-left border-b border-slate-100 pb-2 text-wrap">Customer Star Ratings & Reviews Comments</h4>
            {reviews.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center text-xs text-slate-400 py-12">
                No customer ratings recorded in persistent database.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 text-left">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-3xs flex flex-col space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <div className="leading-snug">
                        <span className="font-bold text-xs text-slate-800 block">{r.passenger_name} ({r.passenger_email})</span>
                        <span className="text-[9px] text-slate-400 block font-mono">REF: {r.booking_ref} / CHAUFFEUR: {r.driver_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-amber-500 font-bold text-xs leading-none">
                        <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                        <span>★ {r.rating} / 5</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-650 font-medium italic leading-relaxed">
                      "{r.comment || 'Excellent elite partner transit service with zero complaints!'}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUSINESS PROFILE SETTINGS */}
        {activeSubTab === 'settings' && (
          <form onSubmit={handleSettingsUpdate} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs text-left max-w-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono border-b border-slate-100 pb-2 block">
              Business Profiles & Billing Rule Coefficients
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-400 font-mono block">BUSINESS TRADING BRAND NAME</label>
                <input
                  type="text"
                  required
                  value={tenant.business_name}
                  onChange={e => setTenant({ ...tenant, business_name: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-400 font-mono block">BRAND PRIMARY COLOR</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tenant.primary_color}
                    onChange={e => setTenant({ ...tenant, primary_color: e.target.value })}
                    className="h-10 w-12 border border-slate-200 rounded-xl p-0.5 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={tenant.primary_color}
                    onChange={e => setTenant({ ...tenant, primary_color: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 col-span-2 border-t border-slate-50 pt-2.5">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono block">BASE TARIFF ({tenant.currency_symbol})</label>
                  <input
                    type="number"
                    value={tenant.base_fare}
                    onChange={e => setTenant({ ...tenant, base_fare: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono block">KM RATE COST ({tenant.currency_symbol})</label>
                  <input
                    type="number"
                    value={tenant.cost_per_km}
                    onChange={e => setTenant({ ...tenant, cost_per_km: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono block">SURGE FACTOR MULTIPLIER (x)</label>
                  <input
                    type="number"
                    step={0.05}
                    value={tenant.surge_multiplier}
                    onChange={e => setTenant({ ...tenant, surge_multiplier: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono block">HOURLY CHARTER VALUE</label>
                  <input
                    type="number"
                    value={tenant.hourly_rate}
                    onChange={e => setTenant({ ...tenant, hourly_rate: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                style={{ backgroundColor: tenant.primary_color }}
                className="w-full text-white font-bold py-2.5 rounded-xl text-xs hover:opacity-90 transition-all font-mono uppercase cursor-pointer"
              >
                COMMIT DYNAMIC COEFFICIENTS
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
