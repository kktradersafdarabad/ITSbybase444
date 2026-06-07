import React, { useState } from 'react';
import { ShieldCheck, Truck, MapPin, Users, Ticket, Award, Zap, Compass, Star, Settings } from 'lucide-react';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';

interface WelcomePageProps {
  onNavigate: (route: string) => void;
  selectedTenantSlug: string;
  setSelectedTenantSlug: (slug: string) => void;
}

export default function WelcomePage({ onNavigate, selectedTenantSlug, setSelectedTenantSlug }: WelcomePageProps) {
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>('monthly');

  const marketingStats = [
    { num: '450k+', desc: 'Successful Passenger Dispatches' },
    { num: '99.9%', desc: 'SLA Telemetry Response' },
    { num: '4.9★', desc: 'Average Chauffeur Ratings' },
    { num: '85+', desc: 'Operational High-Road Cities' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      
      {/* Header bar */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-3xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-extrabold font-serif text-sm border border-slate-800">
            I
          </div>
          <div className="leading-tight text-left">
            <h1 className="text-xs font-bold font-sans text-slate-900 tracking-wider">ITS HUB PLATFORM</h1>
            <span className="text-[9px] text-slate-400 font-mono block">INTELLIGENT MULTI-TENANT ROUTING</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-12 py-10">
        
        {/* Top Banner layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-left space-y-5">
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full font-bold uppercase tracking-widest font-mono inline-block">
              🚀 Multi-Tenant Intelligent Chauffeur Network
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
              White-labeled <span className="text-red-600">ITS transport scheduling</span> gateway.
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Run custom-branded transportation systems instantly. Manage diverse luxury vehicle fleets, calculate night-surge mileage fare bounds, and deploy real-time driver GPS tracking. Fully integrated with Stripe, PayPal, and WhatsApp automated alerts.
            </p>
            
            {/* Quick launcher select card */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-md space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wider block">
                  Choose Live Active Tenant Portal
                </label>
                <select
                  value={selectedTenantSlug}
                  onChange={(e) => setSelectedTenantSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold outline-hidden"
                >
                  <option value="elite-ride">Elite Ride Luxury (UK/USD Account)</option>
                  <option value="safari-transit">Safari Transit Hub (Pakistan/PKR Account)</option>
                  <option value="gold-shuttle">Gold Coast Alpine Transfer (Swiss/CHF Account)</option>
                </select>
              </div>

              {/* Action grid launchers */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onNavigate(`/book/${selectedTenantSlug}`)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Schedule Ride
                </button>
                <button
                  onClick={() => onNavigate(`/tenant/${selectedTenantSlug}`)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Tenant Console
                </button>
              </div>
            </div>
          </div>

          {/* Graphical Launcher Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-5 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-red-100/30 blur-2xl rounded-full pointer-events-none" />
            
            <div className="border-b border-slate-105 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono">Platform Gateway Router</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Jump directly to various responsive platform layouts simulated live:</p>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => onNavigate(`/book/${selectedTenantSlug}`)}
                className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-250 cursor-pointer hover:bg-white transition-all hover:shadow-xs group"
              >
                <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="flex-1 leading-snug">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">Customer Passenger Booking Form</span>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-red-50 text-red-600 rounded-sm">Step 0-4</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Multi-step scheduling form with fare estimators, surge toggles, and payment gateways.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('/booking/status')}
                className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-250 cursor-pointer hover:bg-white transition-all hover:shadow-xs group"
              >
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 leading-snug">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">Universal Booking Tracking portal</span>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-sm">Live GPS</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Search travel codes to monitor real-time driver coordinates on maps, rating tools, and download PDF invoices.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate(`/driver/${selectedTenantSlug}`)}
                className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-250 cursor-pointer hover:bg-white transition-all hover:shadow-xs group"
              >
                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 leading-snug">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">Verified Chauffeur Mobile Portal</span>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-sm font-mono uppercase">Driver App</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Execute dispatched trip sequences, trigger status transitions (Arrived, Star Ride), and view earnings curves.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('/admin')}
                className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-850 cursor-pointer hover:bg-white transition-all hover:shadow-xs group"
              >
                <div className="h-10 w-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="flex-1 leading-snug">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">Global Super Admin Dashboard</span>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-mono uppercase">Master</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supervise overall multi-tenant allocations, customize core limits, billing cycles, and subscription models.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Features section */}
        <div className="space-y-4 pt-4 text-center">
          <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest block">System Capabilities</span>
          <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Fully Loaded Passenger Logistics Subsystem</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
            {[
              { title: 'Dynamic Surges Scheduler', desc: 'Auto-adjust tariff calculations under night parameters or heavy local traffic peak bounds.', icon: Zap },
              { title: 'Local Storage Syncing', desc: 'Offline-first framework designed to retain custom setups, fleets, reviews and routes locally.', icon: ShieldCheck },
              { title: 'Printable Invoice PDFs', desc: 'Direct vector generated PDFs ready for passenger logs, expense sheets and auditing.', icon: Award }
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl text-left space-y-2.5 shadow-3xs">
                  <div className="h-9 w-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{feat.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counter analytics display banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-around gap-6 shadow-md border border-slate-850">
          {marketingStats.map((st, i) => (
            <div key={i} className="text-center space-y-1">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono tracking-tight block">
                {st.num}
              </span>
              <span className="text-[10px] text-slate-400 font-sans tracking-wide block uppercase font-semibold">
                {st.desc}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="h-14 border-t border-slate-150 bg-white flex items-center justify-between px-6 text-[10px] font-mono text-slate-400">
        <span>© 2026 ITS Transportation booking hub. White-label software sequence ready.</span>
        <span>KARACHI // LONDON // SAFDARABAD // ZURICH</span>
      </footer>
    </div>
  );
}
