import React, { useState } from 'react';
import { Tenant, Vehicle, PromoCode, BookingType, PaymentMethod } from '../../types';
import { calculateFare } from '../../lib/fareCalculator';
import { 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  UserSquare2 
} from 'lucide-react';

interface StepSummaryProps {
  tenant: Tenant;
  vehicle: Vehicle | undefined;
  bookingType: BookingType;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  hoursBooked: number;
  estimatedDistance: number;
  estimatedDuration: number;
  selectedRouteId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  paymentMethod: PaymentMethod;
  promoCodeObj: PromoCode | undefined;
  onPrev: () => void;
  onSubmit: () => void;
}

export default function StepSummary({
  tenant,
  vehicle,
  bookingType,
  pickupAddress,
  dropoffAddress,
  pickupDate,
  pickupTime,
  hoursBooked,
  estimatedDistance,
  estimatedDuration,
  selectedRouteId,
  passengerName,
  passengerEmail,
  passengerPhone,
  paymentMethod,
  promoCodeObj,
  onPrev,
  onSubmit
}: StepSummaryProps) {
  const [submitting, setSubmitting] = useState(false);
  const [stripeCard, setStripeCard] = useState('');
  const [stripeCvc, setStripeCvc] = useState('');
  const [stripeExpiry, setStripeExpiry] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  const getRouteFlatRate = () => {
    if (bookingType === 'flat_rate' && selectedRouteId) {
      const routes = ITSLocalStorageDB_fallback();
      const r = routes.find(item => item.id === selectedRouteId);
      return r?.flat_rate ?? 0;
    }
    return undefined;
  };

  // Basic utility to fetch routes offline
  const ITSLocalStorageDB_fallback = () => {
    try {
      const data = localStorage.getItem('its_routes');
      if (data) return JSON.parse(data);
    } catch(e){}
    return [];
  };

  const fareCalc = calculateFare(tenant, vehicle, bookingType, {
    distanceKm: estimatedDistance,
    durationMin: estimatedDuration,
    hoursBooked: hoursBooked,
    flatRate: getRouteFlatRate(),
    pickupTime: pickupTime,
    promoCodeObj: promoCodeObj
  });

  const handleBookingTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit();
    }, 1100);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">Final Verification & Checkout Terminal</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Please evaluate fare breakdowns and settle billing configurations to authorize transportation dispatch schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left billing breakdown summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Itinerary Review</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Route blocks */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">DEPARTURE PICKUP POINT</span>
              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-tight font-medium">{pickupAddress}</span>
              </div>
            </div>

            {bookingType !== 'hourly' && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">ARRIVAL DESTINATION TERMINAL</span>
                <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 leading-tight font-medium">{dropoffAddress}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">SCHEDULE DATE</span>
              <span className="font-bold text-slate-800">{pickupDate}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">CHAUFFEUR TIME</span>
              <span className="font-bold text-slate-800">{pickupTime}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">VEHICLE ASSIGNED</span>
              <span className="font-bold text-slate-800">{vehicle?.name || 'Luxury Cruiser'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-mono">TRAVELER NAME</span>
              <span className="font-bold text-slate-800 truncate block">{passengerName}</span>
            </div>
          </div>

          {/* Electronic Gateway secure mock forms depend on payment method choice */}
          {paymentMethod !== 'cash' && (
            <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                <h5 className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                  {paymentMethod === 'credit_card' ? 'Secure Stripe Payment Gateway' : 'PayPal Gateway Link'}
                </h5>
              </div>

              {paymentMethod === 'credit_card' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono">CARD NUMBER</label>
                    <input
                      type="text"
                      maxLength={19}
                      required
                      placeholder="4242 •••• •••• 4242"
                      value={stripeCard}
                      onChange={e => setStripeCard(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono">EXP DATE</label>
                    <input
                      type="text"
                      maxLength={5}
                      required
                      placeholder="MM/YY"
                      value={stripeExpiry}
                      onChange={e => setStripeExpiry(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-center"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono">CVV CARD</label>
                    <input
                      type="password"
                      maxLength={3}
                      required
                      placeholder="•••"
                      value={stripeCvc}
                      onChange={e => setStripeCvc(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-center"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono">PAYPAL ELECTRONIC ACCOUNT EMAIL</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@paypal-account.com"
                    value={paypalEmail}
                    onChange={e => setPaypalEmail(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right breakdown calculation values */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">Fare Breakdown Config</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Base Taxi Tariff</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {tenant.currency_symbol || '$'} {fareCalc.base_fare.toFixed(2)}
                </span>
              </div>

              {bookingType !== 'flat_rate' && bookingType !== 'hourly' && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Distance Multipliers ({estimatedDistance} KM)</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {tenant.currency_symbol || '$'} {fareCalc.distance_charge.toFixed(2)}
                  </span>
                </div>
              )}

              {bookingType !== 'flat_rate' && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Duration Transit Fee</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {tenant.currency_symbol || '$'} {fareCalc.time_charge.toFixed(2)}
                  </span>
                </div>
              )}

              {fareCalc.is_surge_active && (
                <div className="flex justify-between bg-amber-500/10 p-2 rounded-lg text-amber-700">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Night Surge Premium ({fareCalc.surge_multiplier}x)
                  </span>
                  <span className="font-mono font-bold">ACTIVE</span>
                </div>
              )}

              {fareCalc.discount_amount > 0 && (
                <div className="flex justify-between bg-emerald-50 text-emerald-700 p-2 rounded-lg">
                  <span className="font-semibold">Promo code reward</span>
                  <span className="font-mono font-bold">- {tenant.currency_symbol || '$'} {fareCalc.discount_amount.toFixed(2)}</span>
                </div>
              )}

              <hr className="border-slate-200 my-1" />

              <div className="flex justify-between text-sm font-bold text-slate-800 pt-1">
                <span>Total Net Charge</span>
                <span className="font-mono text-slate-900 text-lg">
                  {tenant.currency_symbol || '$'} {fareCalc.total_fare.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Secure verify terms */}
          <div className="space-y-3.5 mt-4">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              By authorizing this transaction, you agree to our terms of multi-tenant service, automated toll surcharges, baggage weights constraints, and dispatch protocols.
            </p>

            <button
              onClick={handleBookingTrigger}
              disabled={submitting}
              style={{ backgroundColor: tenant.primary_color }}
              className="w-full text-white font-bold py-3 px-4 rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer text-center disabled:opacity-50 font-mono uppercase tracking-wider block"
            >
              {submitting ? 'Authenticating Gateways...' : 'Authorize Booking & Dispatch'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigator button */}
      <div className="flex">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 bg-white border border-slate-150 text-slate-600 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Edit Traveler Credentials</span>
        </button>
      </div>
    </div>
  );
}
