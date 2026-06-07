import React from 'react';
import { BookingType, Tenant, Route } from '../../types';
import AddressAutocomplete from '../shared/AddressAutocomplete';
import { ITSLocalStorageDB } from '../../lib/db';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  ChevronRight, 
  PlaneTakeoff, 
  Map, 
  TrendingUp, 
  Bolt 
} from 'lucide-react';

interface StepTripDetailsProps {
  tenant: Tenant;
  bookingType: BookingType;
  setBookingType: (type: BookingType) => void;
  pickupAddress: string;
  setPickupAddress: (addr: string) => void;
  dropoffAddress: string;
  setDropoffAddress: (addr: string) => void;
  pickupDate: string;
  setPickupDate: (val: string) => void;
  pickupTime: string;
  setPickupTime: (val: string) => void;
  hoursBooked: number;
  setHoursBooked: (val: number) => void;
  selectedRouteId: string;
  setSelectedRouteId: (val: string) => void;
  estimatedDistance: number;
  setEstimatedDistance: (val: number) => void;
  estimatedDuration: number;
  setEstimatedDuration: (val: number) => void;
  flightNumber: string;
  setFlightNumber: (val: string) => void;
  onNext: () => void;
}

export default function StepTripDetails({
  tenant,
  bookingType,
  setBookingType,
  pickupAddress,
  setPickupAddress,
  dropoffAddress,
  setDropoffAddress,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  hoursBooked,
  setHoursBooked,
  selectedRouteId,
  setSelectedRouteId,
  estimatedDistance,
  setEstimatedDistance,
  estimatedDuration,
  setEstimatedDuration,
  flightNumber,
  setFlightNumber,
  onNext
}: StepTripDetailsProps) {

  // Fetch flat-rate fixed routes for this tenant
  const tenantRoutes = ITSLocalStorageDB.getRoutes(tenant.id).filter(r => r.is_active);

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(routeId);
    const selected = tenantRoutes.find(r => r.id === routeId);
    if (selected) {
      setPickupAddress(selected.pickup_area);
      setDropoffAddress(selected.dropoff_area);
      setEstimatedDistance(selected.distance_km || 40);
      setEstimatedDuration(Math.round((selected.distance_km || 40) * 1.5));
    }
  };

  const handleAddressSelect = (
    type: 'pickup' | 'dropoff',
    address: string,
    dist?: number,
    dur?: number
  ) => {
    if (type === 'pickup') {
      setPickupAddress(address);
    } else {
      setDropoffAddress(address);
    }

    // If both addresses are present, or we picked a geocoded option, update limits
    if (dist) {
      setEstimatedDistance(dist);
      if (dur) setEstimatedDuration(dur);
    } else if (pickupAddress && dropoffAddress) {
      // General mock estimation if manually typed
      setEstimatedDistance(32);
      setEstimatedDuration(45);
    }
  };

  const isFormValid = () => {
    if (!pickupDate || !pickupTime) return false;
    
    if (bookingType === 'flat_rate') {
      return !!selectedRouteId;
    }
    if (bookingType === 'hourly') {
      return !!pickupAddress && hoursBooked >= 1;
    }
    
    // distance and on-demand
    return !!pickupAddress && !!dropoffAddress;
  };

  return (
    <div className="space-y-6">
      {/* Tab select mode chips */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
          Select Ride Scheduling Mode
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { id: 'distance', label: 'Distance Charge', desc: 'Per KM point-to-point', icon: Navigation },
            { id: 'hourly', label: 'Hourly Charter', desc: 'Reserve chauffeur by hour', icon: Clock },
            { id: 'flat_rate', label: 'Fixed Flat Route', desc: 'Pre-negotiated airports', icon: Map },
            { id: 'on_demand', label: 'On Demand Flash', desc: 'Immediate dispatch ride', icon: Bolt }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = bookingType === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setBookingType(mode.id as BookingType);
                  // Clear route if we change mode
                  if (mode.id !== 'flat_rate') {
                    setSelectedRouteId('');
                  }
                }}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold font-sans">{mode.label}</span>
                </div>
                <p className={`text-[10px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of location details */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Trip Locations & Destination Map</h4>

        {bookingType === 'flat_rate' ? (
          /* Flat Rate Route Dropdown */
          <div className="space-y-1 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Select Flat-Rate Route Itinerary
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => handleRouteSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
            >
              <option value="">-- Choose pre-configured route --</option>
              {tenantRoutes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({tenant.currency_symbol || '$'}{r.flat_rate})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Ideal for seamless airport, railway, and commercial dry port terminal shuttles.
            </p>
          </div>
        ) : (
          /* Dynamic Autocomplete Pickups */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressAutocomplete
              id="pickup-address"
              label="Passenger Pickup Terminal"
              placeholder="e.g. Heathrow Terminal 5"
              value={pickupAddress}
              onChange={(addr, dist, dur) => handleAddressSelect('pickup', addr, dist, dur)}
              countryCode={tenant.country_code}
            />

            {bookingType !== 'hourly' && (
              <AddressAutocomplete
                id="dropoff-address"
                label="Destination Dropoff Terminal"
                placeholder="e.g. Mayfair Residence"
                value={dropoffAddress}
                onChange={(addr, dist, dur) => handleAddressSelect('dropoff', addr, dist, dur)}
                countryCode={tenant.country_code}
              />
            )}

            {bookingType === 'hourly' && (
              <div className="flex flex-col space-y-1 w-full">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Charter Duration (Hours Booked)
                </label>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1 bg-white">
                  <button
                    type="button"
                    onClick={() => setHoursBooked(Math.max(1, hoursBooked - 1))}
                    className="p-1 text-slate-500 hover:text-slate-800 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-12 text-center">
                    {hoursBooked} Hour{hoursBooked > 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHoursBooked(hoursBooked + 1)}
                    className="p-1 text-slate-500 hover:text-slate-800 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date and Time selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Pickup Time (24h)
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Flight ID (Terminal Arrivals)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <PlaneTakeoff className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. BA-249"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold placeholder:text-slate-400 uppercase outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transit details block */}
      {pickupAddress && estimatedDistance > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4.5 w-4.5 text-blue-600 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold text-slate-700 block">Autodetected Distance Estimate</span>
              <span className="text-[10px] text-slate-400 font-mono">CALCULATED VIA GOOGLE DIRECTIONS GATEWAY</span>
            </div>
          </div>
          <div className="flex gap-4 font-mono font-bold text-slate-800">
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">DISTANCE</span>
              <span>{estimatedDistance} KM</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">EST. TRANSIT</span>
              <span>~{estimatedDuration} MINS</span>
            </div>
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid()}
          style={{ backgroundColor: isFormValid() ? tenant.primary_color : '#E2E8F0' }}
          className="flex items-center gap-2.5 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Select Vehicle Category</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
