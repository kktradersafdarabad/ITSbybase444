import React, { useState, useEffect } from 'react';
import { Tenant, TenantStatus } from '../types';
import { ITSLocalStorageDB } from '../lib/db';
import StatusBadge from '../components/shared/StatusBadge';
import { 
  Building2, 
  MapPin, 
  Settings, 
  TrendingUp, 
  PlusCircle, 
  Activity, 
  CheckCircle, 
  DollarSign, 
  Sparkles,
  Award
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  // Create / Edit Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [countryCode, setCountryCode] = useState('GB');
  const [currency, setCurrency] = useState('GBP');
  const [symbol, setSymbol] = useState('£');
  const [primaryColor, setPrimaryColor] = useState('#1e293b');
  const [plan, setPlan] = useState<'starter' | 'scale' | 'enterprise'>('starter');

  useEffect(() => {
    setTenants(ITSLocalStorageDB.getTenants());
  }, []);

  const handleRegisterTenant = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) return;

    const newTenant: Tenant = {
      id: `ten-${Date.now()}`,
      business_name: name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      country_code: countryCode.toUpperCase(),
      currency: currency.toUpperCase(),
      currency_symbol: symbol,
      primary_color: primaryColor,
      status: 'active',
      plan: plan,
      owner_email: 'partner-admin@itsplatform.env',
      owner_name: 'Verified Tenant Proprietor',
      phone: '+92 300 0000000',
      base_fare: 5,
      cost_per_km: 1.5,
      cost_per_minute: 0.35,
      hourly_rate: 45,
      surge_multiplier: 1.25,
      surge_start_hour: 22,
      surge_end_hour: 6
    };

    ITSLocalStorageDB.saveTenant(newTenant);
    setTenants(ITSLocalStorageDB.getTenants());

    // Reset standard states
    setName('');
    setSlug('');
    setShowAddForm(false);
  };

  const toggleTenantStatus = (id: string, currentStatus: TenantStatus) => {
    const nextStatus: TenantStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    // Fetch and mutate list
    const list = ITSLocalStorageDB.getTenants();
    const idx = list.findIndex(t => t.id === id);
    if (idx !== -1) {
      list[idx].status = nextStatus;
      localStorage.setItem('its_tenants', JSON.stringify(list));
      setTenants(list);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left p-2.5">
      
      {/* Super Admin header tracker */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-white border border-slate-700">
            ★
          </div>
          <div className="leading-tight text-left">
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
              SUPER SYSTEM ADMIN CONTROL PANEL
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
              ITS White-label multi-tenant cloud provisioner allocations sequence.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2.5 rounded-xl text-xs text-white flex items-center gap-1.5 cursor-pointer transition-colors font-mono uppercase"
        >
          <PlusCircle className="h-4 w-4" />
          PROVISION NEW TENANT
        </button>
      </div>

      {/* Numerical widgets row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">TOTAL TENANTS</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {tenants.length} Managed
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">MONTHLY PLATFORM MRR</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              £14,500 Gross
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">SURGE CHILLS</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              1.25x Active Surge
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">RELIABILITY SCALE</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              99.99% Guaranteed
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Slide in Provision Form */}
      {showAddForm && (
        <form onSubmit={handleRegisterTenant} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-4 max-w-2xl">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">Provision New Whitelabel Tenant</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">BUSINESS BRAND NAME</label>
              <input
                type="text"
                required
                placeholder="e.g. Sialkot Luxury Shuttles"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase font-bold">SLUG ROUTE (UNIQUE IDENTIFIER)</label>
              <input
                type="text"
                required
                placeholder="e.g. sialkot-shuttles"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-850"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">COUNTRY CODE</label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  placeholder="e.g. PK or GB"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-mono font-bold text-center"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">CURRENCY</label>
                <input
                  type="text"
                  maxLength={3}
                  required
                  placeholder="PKR"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-mono font-bold text-center"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">SYMBOL</label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  placeholder="Rs"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-mono font-bold text-center"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">BRAND PRIMARY CSS COLOR</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 border border-slate-200 rounded-xl p-0.5 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold flex-1"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">PLAN SUBSCRIPTION TIER</label>
              <select
                value={plan}
                onChange={e => setPlan(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700"
              >
                <option value="starter">Starter Plan (0.5% commission fee)</option>
                <option value="scale">Scale Plan (1% commission fee)</option>
                <option value="enterprise">Enterprise Custom SLA</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer transition-all"
            >
              Authorize Tenant Slot
            </button>
          </div>
        </form>
      )}

      {/* Tenants tables logs list */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-3xs">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Live Multi-Tenant Subsystems</h4>
          <span className="text-[9px] text-slate-400 font-mono">PROVISIONED LOGS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-50">
            <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Tenant Details</th>
                <th className="px-5 py-3">Slug Routing</th>
                <th className="px-5 py-3">Locale Account</th>
                <th className="px-5 py-3">Subscribed Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700 text-[11px]">
              {tenants.map((ten) => (
                <tr key={ten.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div 
                        style={{ backgroundColor: ten.primary_color }} 
                        className="h-7 w-7 rounded-lg text-white flex items-center justify-center font-bold"
                      >
                        {ten.business_name[0]}
                      </div>
                      <span className="font-bold text-slate-800 text-sm block">{ten.business_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-blue-600 block pt-5">
                    /book/{ten.slug}
                  </td>
                  <td className="px-5 py-3 uppercase font-mono">
                    {ten.country_code} ({ten.currency_symbol || '$'}{ten.currency})
                  </td>
                  <td className="px-5 py-3 font-mono font-bold uppercase text-indigo-600 text-xs">
                    {ten.plan}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={ten.status} type="tenant" />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleTenantStatus(ten.id, ten.status)}
                      className={`p-1 px-2 text-[9px] font-bold font-mono uppercase rounded-lg transition-all border cursor-pointer ${
                        ten.status === 'active'
                          ? 'border-red-150 text-red-650 hover:bg-red-50'
                          : 'border-green-150 text-green-650 hover:bg-green-50'
                      }`}
                    >
                      {ten.status === 'active' ? 'SUSPEND' : 'ACTIVATE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
