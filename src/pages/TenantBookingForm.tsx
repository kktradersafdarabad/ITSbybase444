import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tenant, Vehicle, PromoCode, BookingType, PaymentMethod, TenantBooking } from '../types';
import { ITSLocalStorageDB } from '../lib/db';
import StepIndicator from '../components/booking/StepIndicator';
import { sendBookingConfirmationEmail } from '../lib/emailService';
import { sendWhatsAppBookingConfirmation } from '../lib/whatsappService';

// Individual Step Component Imports
import StepTripDetails from '../components/booking/StepTripDetails';
import StepVehicle from '../components/booking/StepVehicle';
import StepPassengerInfo from '../components/booking/StepPassengerInfo';
import StepSummary from '../components/booking/StepSummary';
import StepConfirmation from '../components/booking/StepConfirmation';

import { Sparkles, Calendar, TrendingUp, ShieldAlert, ArrowLeft } from 'lucide-react';

interface TenantBookingFormProps {
  onBack: () => void;
}

export default function TenantBookingForm({ onBack }: TenantBookingFormProps) {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'elite-ride';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Form states
  const [bookingType, setBookingType] = useState<BookingType>('distance');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-06-08');
  const [pickupTime, setPickupTime] = useState('12:00');
  const [hoursBooked, setHoursBooked] = useState(1);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [flightNumber, setFlightNumber] = useState('');

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined);

  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeObj, setPromoCodeObj] = useState<PromoCode | undefined>(undefined);

  // Output Booking State
  const [processedBooking, setProcessedBooking] = useState<TenantBooking | undefined>(undefined);

  useEffect(() => {
    // Lookup tenant config from localStorage database
    const t = ITSLocalStorageDB.getTenantBySlug(activeSlug);
    if (t) {
      setTenant(t);
    } else {
      // Fallback fallback if slug missing
      const first = ITSLocalStorageDB.getTenants()[0];
      setTenant(first);
    }
  }, [activeSlug]);

  useEffect(() => {
    if (selectedVehicleId && tenant) {
      const v = ITSLocalStorageDB.getVehicles(tenant.id).find(item => item.id === selectedVehicleId);
      setSelectedVehicle(v);
    }
  }, [selectedVehicleId, tenant]);

  if (!tenant) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-medium">
        Syncing tenant parameters...
      </div>
    );
  }

  // Handle dynamic checkout finalization
  const handleFinalSubmit = () => {
    // Generate Booking reference key
    const refCode = `ITS-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Auto-calculate fare parameters
    const baseVal = selectedVehicle?.base_fare ?? tenant.base_fare;
    const distanceCharge = bookingType === 'flat_rate' ? 0 : (estimatedDistance() * (selectedVehicle?.rate_per_km ?? tenant.cost_per_km));
    const timeCharge = bookingType === 'hourly' ? (hoursBooked * (selectedVehicle?.rate_per_hour ?? tenant.hourly_rate)) : (estimatedDuration() * tenant.cost_per_minute);
    
    // Surge coefficient checks
    let multi = 1;
    try {
      const hour = parseInt(pickupTime.split(':')[0], 10);
      if (hour >= tenant.surge_start_hour || hour < tenant.surge_end_hour) {
        multi = tenant.surge_multiplier || 1.25;
      }
    } catch(e){}

    const totalBeforePromo = (baseVal + distanceCharge + timeCharge) * multi;
    let promoDeduction = 0;
    if (promoCodeObj) {
      if (promoCodeObj.discount_type === 'percentage') {
        promoDeduction = (totalBeforePromo * promoCodeObj.discount_value) / 100;
      } else {
        promoDeduction = promoCodeObj.discount_value;
      }
    }

    const netCharge = Math.max(0, totalBeforePromo - promoDeduction);

    // Auto-dispatch driver if available for mock reality!
    const availableDrivers = ITSLocalStorageDB.getDrivers(tenant.id).filter(d => d.status === 'available');
    const selectedDriver = availableDrivers.length > 0 ? availableDrivers[0] : undefined;

    const newBooking: TenantBooking = {
      id: `b-${Date.now()}`,
      tenant_id: tenant.id,
      tenant_slug: tenant.slug,
      booking_ref: refCode,
      status: 'confirmed', // Confirmed directly after mock payments
      booking_type: bookingType,
      pickup_address: pickupAddress,
      dropoff_address: bookingType === 'hourly' ? 'London Guided Sightseeing As Directed' : dropoffAddress,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      estimated_distance_km: estimatedDistance(),
      estimated_duration_min: estimatedDuration(),
      hours_booked: bookingType === 'hourly' ? hoursBooked : undefined,
      vehicle_name: selectedVehicle?.name || 'Class Luxe',
      driver_name: selectedDriver?.full_name || 'VIP Courier Partner',
      driver_id: selectedDriver?.id || 'dr-assigned',
      passenger_name: passengerName,
      passenger_email: passengerEmail,
      passenger_phone: passengerPhone,
      passengers_count: passengersCount,
      luggage_count: luggageCount,
      special_requests: specialRequests,
      flight_number: flightNumber || undefined,
      base_fare: baseVal,
      distance_charge: Math.round(distanceCharge * 100) / 100,
      time_charge: Math.round(timeCharge * 100) / 100,
      discount_amount: Math.round(promoDeduction * 100) / 100,
      promo_code: promoCodeObj ? promoCodeObj.code : undefined,
      total_fare: Math.round(netCharge * 100) / 100,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cash' ? 'pending' : 'paid'
    };

    // Save of booking entity
    ITSLocalStorageDB.saveBooking(newBooking);

    // Set driver status to "on_trip"
    if (selectedDriver) {
      selectedDriver.status = 'on_trip';
      selectedDriver.total_trips = (selectedDriver.total_trips || 0) + 1;
      selectedDriver.total_earnings = (selectedDriver.total_earnings || 0) + newBooking.total_fare;
      ITSLocalStorageDB.saveDriver(selectedDriver);
    }

    // Trigger dispatches
    sendBookingConfirmationEmail(newBooking, tenant);
    sendWhatsAppBookingConfirmation(newBooking, tenant);

    setProcessedBooking(newBooking);
    setCurrentStep(4); // Jump to success page
  };

  const estimatedDistance = () => {
    if (bookingType === 'flat_rate' && selectedRouteId) {
      const r = ITSLocalStorageDB.getRoutes(tenant.id).find(item => item.id === selectedRouteId);
      return r?.distance_km ?? 25;
    }
    return bookingType === 'hourly' ? 0 : 35; // standard simulated distance factor
  };

  const estimatedDuration = () => {
    return bookingType === 'hourly' ? hoursBooked * 60 : Math.round(estimatedDistance() * 1.4);
  };

  // Switch dynamic states
  const handleRedirectToTracker = (refCode: string) => {
    // Navigate directly
    onBack();
    setTimeout(() => {
      // Global search simulation
      const event = new CustomEvent('global-search', { detail: refCode });
      window.dispatchEvent(event);
    }, 50);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      
      {/* Upper white-labeled header banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onBack}
            className="p-2 border border-slate-150 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="leading-tight text-left">
            <h2 className="text-base font-bold text-slate-950 font-sans tracking-tight">
              {tenant.business_name} Secure Booking Platform
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Multi-tenant logistics router configured for terminal dispatches in {tenant.currency}.
            </p>
          </div>
        </div>

        {/* Brand color badge visualizer */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
            SLA ACTIVE: {tenant.country_code}
          </span>
          <div 
            style={{ backgroundColor: tenant.primary_color }}
            className="h-4.5 w-10 rounded-full border border-slate-200/50"
            title="Custom corporate branding theme applied"
          />
        </div>
      </div>

      {/* Steps Indicator timeline bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Sub-panels router */}
      <div className="bg-slate-50/50 rounded-2xl">
        {currentStep === 0 && (
          <StepTripDetails
            tenant={tenant}
            bookingType={bookingType}
            setBookingType={setBookingType}
            pickupAddress={pickupAddress}
            setPickupAddress={setPickupAddress}
            dropoffAddress={dropoffAddress}
            setDropoffAddress={setDropoffAddress}
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            pickupTime={pickupTime}
            setPickupTime={setPickupTime}
            hoursBooked={hoursBooked}
            setHoursBooked={setHoursBooked}
            selectedRouteId={selectedRouteId}
            setSelectedRouteId={setSelectedRouteId}
            estimatedDistance={estimatedDistance()}
            setEstimatedDistance={() => {}}
            estimatedDuration={estimatedDuration()}
            setEstimatedDuration={() => {}}
            flightNumber={flightNumber}
            setFlightNumber={setFlightNumber}
            onNext={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 1 && (
          <StepVehicle
            tenant={tenant}
            bookingType={bookingType}
            estimatedDistance={estimatedDistance()}
            estimatedDuration={estimatedDuration()}
            hoursBooked={hoursBooked}
            pickupTime={pickupTime}
            selectedRouteId={selectedRouteId}
            selectedVehicleId={selectedVehicleId}
            setSelectedVehicleId={setSelectedVehicleId}
            onNext={() => setCurrentStep(2)}
            onPrev={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepPassengerInfo
            tenant={tenant}
            passengerName={passengerName}
            setPassengerName={setPassengerName}
            passengerEmail={passengerEmail}
            setPassengerEmail={setPassengerEmail}
            passengerPhone={passengerPhone}
            setPassengerPhone={setPassengerPhone}
            passengersCount={passengersCount}
            setPassengersCount={setPassengersCount}
            luggageCount={luggageCount}
            setLuggageCount={setLuggageCount}
            specialRequests={specialRequests}
            setSpecialRequests={setSpecialRequests}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            setPromoCodeObj={setPromoCodeObj}
            promoCodeObj={promoCodeObj}
            subtotal={(selectedVehicle?.base_fare ?? tenant.base_fare) + (estimatedDistance() * (selectedVehicle?.rate_per_km ?? tenant.cost_per_km))}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepSummary
            tenant={tenant}
            vehicle={selectedVehicle}
            bookingType={bookingType}
            pickupAddress={pickupAddress}
            dropoffAddress={dropoffAddress}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            hoursBooked={hoursBooked}
            estimatedDistance={estimatedDistance()}
            estimatedDuration={estimatedDuration()}
            selectedRouteId={selectedRouteId}
            passengerName={passengerName}
            passengerEmail={passengerEmail}
            passengerPhone={passengerPhone}
            paymentMethod={paymentMethod}
            promoCodeObj={promoCodeObj}
            onPrev={() => setCurrentStep(2)}
            onSubmit={handleFinalSubmit}
          />
        )}

        {currentStep === 4 && (
          <StepConfirmation
            tenant={tenant}
            booking={processedBooking}
            onReset={() => {
              setCurrentStep(0);
              setPickupAddress('');
              setDropoffAddress('');
              setSelectedVehicleId('');
              setPassengerName('');
              setPassengerEmail('');
              setPassengerPhone('');
              setPromoCodeObj(undefined);
              setProcessedBooking(undefined);
            }}
            onTrackLink={handleRedirectToTracker}
          />
        )}
      </div>
    </div>
  );
}
