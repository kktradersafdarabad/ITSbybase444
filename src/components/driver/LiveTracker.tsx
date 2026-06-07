import React, { useState, useEffect } from 'react';
import { TenantBooking, DriverLocation, Tenant } from '../../types';
import { ITSLocalStorageDB } from '../../lib/db';
import { MapPin, Plane, Compass, RotateCcw, AlertTriangle, Play, Pause, Navigation } from 'lucide-react';

interface LiveTrackerProps {
  booking: TenantBooking;
  tenant: Tenant;
}

export default function LiveTracker({ booking, tenant }: LiveTrackerProps) {
  const [lat, setLat] = useState(51.5074);
  const [lng, setLng] = useState(-0.1278);
  const [heading, setHeading] = useState(0);
  const [simActive, setSimActive] = useState(true);
  const [stepsTraveled, setStepsTraveled] = useState(0);

  // Set initial coordinates based on location
  useEffect(() => {
    if (tenant.country_code === 'PK') {
      // Sialkot / Lahore
      setLat(32.5085);
      setLng(74.5204);
    } else if (tenant.country_code === 'CH') {
      // Zurich
      setLat(47.3769);
      setLng(8.5417);
    } else {
      // London Heathrow
      setLat(51.4700);
      setLng(-0.4543);
    }
  }, [tenant.country_code]);

  // Simulated GPS Location tracking loop
  useEffect(() => {
    if (!simActive) return;

    const interval = setInterval(() => {
      setStepsTraveled((prev) => {
        const next = prev + 1;
        
        // Slightly fluctuate coordinates based on heading standard direction
        setLat((currLat) => {
          const deltaLat = tenant.country_code === 'PK' ? -0.003 : 0.002; // heading towards destination
          return currLat + (Math.sin(next * 0.5) * 0.0005) + deltaLat;
        });

        setLng((currLng) => {
          const deltaLng = tenant.country_code === 'PK' ? 0.0045 : 0.0035;
          return currLng + (Math.cos(next * 0.5) * 0.0005) + deltaLng;
        });

        setHeading((h) => (h + 15) % 360);

        // Record coordinates into LocalStorage DB for consistency!
        if (booking.driver_id) {
          ITSLocalStorageDB.updateDriverLocation(
            booking.driver_id,
            lat,
            lng,
            true
          );
        }

        return next;
      });
    }, 5000); // Feed every 5 seconds exactly matching spec

    return () => clearInterval(interval);
  }, [simActive, tenant.country_code, booking.driver_id, lat, lng]);

  const handleResetSim = () => {
    setStepsTraveled(0);
    if (tenant.country_code === 'PK') {
      setLat(32.5085);
      setLng(74.5204);
    } else if (tenant.country_code === 'CH') {
      setLat(47.3769);
      setLng(8.5417);
    } else {
      setLat(51.4700);
      setLng(-0.4543);
    }
    setHeading(0);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="leading-tight text-left">
          <h4 className="text-xs font-bold text-slate-800">Live GPS Chauffeur Telemetry</h4>
          <span className="text-[9px] text-slate-400 font-mono block">GPS UNIT ACTIVE · INTERVAL: 5SEC SECURED</span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setSimActive(!simActive)}
            title={simActive ? 'Pause simulation feed' : 'Resume simulation feed'}
            className="p-1.5 bg-slate-50 border border-slate-150 hover:border-slate-800 text-slate-600 rounded-lg cursor-pointer"
          >
            {simActive ? <Pause className="h-3.5 w-3.5 text-blue-600" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
          </button>
          
          <button
            onClick={handleResetSim}
            title="Reset telemetry trajectory"
            className="p-1.5 bg-slate-50 border border-slate-150 hover:border-slate-800 text-slate-600 rounded-lg cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Map Container representing tracking system */}
      <div className="h-44 w-full bg-slate-900 rounded-xl relative overflow-hidden border border-slate-950 flex flex-col justify-between p-3.5">
        
        {/* Subtle grid elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* GPS Coordinate Display */}
        <div className="z-10 bg-slate-950/85 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300 font-mono text-[9px] w-fit space-y-0.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">CHAUFFEUR:</span>
            <span className="text-white font-bold">{booking.driver_name || 'VIP DISPATCH'}</span>
          </div>
          <div>LATITUDE: {lat.toFixed(6)} N</div>
          <div>LONGITUDE: {lng.toFixed(6)} E</div>
          <div>BEARING: {heading}° TARGET</div>
        </div>

        {/* Compass Radar animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full border border-blue-500/10 flex items-center justify-center pointer-events-none">
          <div className="h-20 w-20 rounded-full border border-blue-500/20 flex items-center justify-center animate-pulse" />
        </div>

        {/* Vector Points */}
        <div className="absolute top-1/3 left-1/4 flex flex-col items-center z-10 text-center">
          <span className="absolute -top-6 text-[8px] bg-slate-950/90 text-slate-300 px-1 py-0.5 rounded-sm whitespace-nowrap border border-slate-800 font-mono uppercase">
            DEPARTURE
          </span>
          <MapPin className="h-5 w-5 text-red-500 drop-shadow-md animate-bounce" />
        </div>

        {/* Real-time moving vehicle node */}
        <div 
          className="absolute z-15 flex flex-col items-center text-center transition-all duration-1000 ease-in-out"
          style={{ 
            top: `${Math.min(75, Math.max(15, 30 + (stepsTraveled % 10) * 4))}%`, 
            left: `${Math.min(85, Math.max(15, 25 + (stepsTraveled % 10) * 6))}%` 
          }}
        >
          <div className="bg-slate-950/90 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-sm whitespace-nowrap border border-slate-800 font-mono flex items-center gap-1">
            <span className="h-1 w-1 bg-blue-400 rounded-full animate-ping" />
            CHAUFFEUR
          </div>
          <div style={{ transform: `rotate(${heading}deg)` }} className="transition-transform duration-1000">
            <Navigation className="h-6 w-6 text-blue-400 fill-blue-450 drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center z-10 text-center">
          <span className="absolute -top-6 text-[8px] bg-slate-950/90 text-slate-300 px-1 py-0.5 rounded-sm whitespace-nowrap border border-slate-800 font-mono uppercase">
            TARGET DESTINATION
          </span>
          <MapPin className="h-5 w-5 text-blue-500 drop-shadow-md" />
        </div>

        {/* Progress percent text */}
        <div className="z-10 self-end text-[9px] font-mono text-slate-400 bg-slate-950/85 px-2 py-0.5 rounded-md border border-slate-800">
          STATUS: {booking.status.toUpperCase()} (SIM PROGRESS)
        </div>
      </div>
    </div>
  );
}
