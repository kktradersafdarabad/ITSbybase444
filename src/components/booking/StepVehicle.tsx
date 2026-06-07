import React, { useState, useEffect } from 'react';
import { Vehicle, Tenant, BookingType } from '../../types';
import { calculateFare } from '../../lib/fareCalculator';
import { ITSLocalStorageDB } from '../../lib/db';
import { Users, Briefcase, Star, Sparkles, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface StepVehicleProps {
  tenant: Tenant;
  bookingType: BookingType;
  estimatedDistance: number;
  estimatedDuration: number;
  hoursBooked: number;
  pickupTime: string;
  selectedRouteId: string;
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepVehicle({
  tenant,
  bookingType,
  estimatedDistance,
  estimatedDuration,
  hoursBooked,
  pickupTime,
  selectedRouteId,
  selectedVehicleId,
  setSelectedVehicleId,
  onNext,
  onPrev
}: StepVehicleProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Query active vehicles for this tenant
    const activeVehicles = ITSLocalStorageDB.getVehicles(tenant.id).filter(v => v.is_active);
    setVehicles(activeVehicles);
    
    // Auto-select first vehicle if none selected
    if (activeVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(activeVehicles[0].id);
    }
  }, [tenant.id, selectedVehicleId, setSelectedVehicleId]);

  const handleSelect = (id: string) => {
    setSelectedVehicleId(id);
  };

  const getRouteFlatRate = () => {
    if (bookingType === 'flat_rate' && selectedRouteId) {
      const routes = ITSLocalStorageDB.getRoutes(tenant.id);
      const r = routes.find(item => item.id === selectedRouteId);
      return r?.flat_rate ?? 0;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">Select Chauffeur Class Fleet</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Please choose a dispatch vehicle configured for your travel comfort and passenger volume requirements.</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-amber-50 border border-amber-100/75 rounded-2xl p-5 text-center text-xs text-amber-800 space-y-1.5 font-medium">
          <AlertCircle className="h-5 w-5 text-amber-500 mx-auto" />
          <h4 className="font-bold">No active vehicles found!</h4>
          <p className="text-[10px] text-amber-600">Please access the Tenant Admin Fleet dashboard first to register premium vehicles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => {
            // Precise simulated base rate calc for vehicle cards
            const fareCalc = calculateFare(tenant, v, bookingType, {
              distanceKm: estimatedDistance,
              durationMin: estimatedDuration,
              hoursBooked: hoursBooked,
              flatRate: getRouteFlatRate(),
              pickupTime: pickupTime
            });

            const isSelected = selectedVehicleId === v.id;

            return (
              <div
                key={v.id}
                onClick={() => handleSelect(v.id)}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-3xs hover:shadow-md cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-900 ring-1 ring-slate-900 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Image fallback or actual photo */}
                  <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-50 relative">
                    <img
                      src={v.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=450'}
                      alt={v.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {v.category === 'luxury' && (
                      <span className="absolute top-2.5 right-2.5 bg-slate-900 text-white border border-slate-800 text-[8px] font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="h-2 w-2 text-amber-400" />
                        PREMIUM CLASS
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{v.name}</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase">MODEL: {v.model}</p>
                  </div>

                  {/* Badges specifications */}
                  <div className="flex gap-4 text-[10px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1 font-mono">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {v.max_passengers} SEATS
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      {v.max_luggage || 2} LUGGAGE
                    </span>
                  </div>

                  {/* Highlights list */}
                  {v.features && v.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 border-t border-slate-50 pt-2.5">
                      {v.features.slice(0, 2).map((feat, index) => (
                        <span key={index} className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 font-medium rounded-sm border border-slate-100">
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-tier billing block */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center mt-auto">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block">MAPPED TARIFF</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {tenant.currency_symbol || '$'} {fareCalc.total_fare.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-mono block">BASE FEE</span>
                    <span className="text-[10px] font-semibold text-slate-700">
                      {tenant.currency_symbol || '$'}{v.base_fare || tenant.base_fare}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Button controls */}
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 bg-white border border-slate-150 text-slate-600 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Trip Details</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!selectedVehicleId}
          style={{ backgroundColor: selectedVehicleId ? tenant.primary_color : '#E2E8F0' }}
          className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>Passenger Details</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
