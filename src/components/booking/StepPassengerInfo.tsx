import React, { useState } from 'react';
import { Tenant, PromoCode, PaymentMethod } from '../../types';
import { ITSLocalStorageDB } from '../../lib/db';
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  Luggage, 
  Ticket, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  XOctagon 
} from 'lucide-react';

interface StepPassengerInfoProps {
  tenant: Tenant;
  passengerName: string;
  setPassengerName: (val: string) => void;
  passengerEmail: string;
  setPassengerEmail: (val: string) => void;
  passengerPhone: string;
  setPassengerPhone: (val: string) => void;
  passengersCount: number;
  setPassengersCount: (val: number) => void;
  luggageCount: number;
  setLuggageCount: (val: number) => void;
  specialRequests: string;
  setSpecialRequests: (val: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  promoCode: string;
  setPromoCode: (val: string) => void;
  setPromoCodeObj: (obj: PromoCode | undefined) => void;
  promoCodeObj: PromoCode | undefined;
  subtotal: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepPassengerInfo({
  tenant,
  passengerName,
  setPassengerName,
  passengerEmail,
  setPassengerEmail,
  passengerPhone,
  setPassengerPhone,
  passengersCount,
  setPassengersCount,
  luggageCount,
  setLuggageCount,
  specialRequests,
  setSpecialRequests,
  paymentMethod,
  setPaymentMethod,
  promoCode,
  setPromoCode,
  setPromoCodeObj,
  promoCodeObj,
  subtotal,
  onNext,
  onPrev
}: StepPassengerInfoProps) {
  const [typedCode, setTypedCode] = useState(promoCode);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleValidatePromo = () => {
    setPromoError('');
    setPromoSuccess('');

    if (!typedCode.trim()) {
      setPromoCodeObj(undefined);
      setPromoCode('');
      return;
    }

    const codeUpper = typedCode.toUpperCase().trim();
    const allPromos = ITSLocalStorageDB.getPromos(tenant.id);
    const found = allPromos.find(p => p.code.toUpperCase() === codeUpper && p.is_active);

    if (!found) {
      setPromoError('Promo code not found or expired.');
      setPromoCodeObj(undefined);
      return;
    }

    // Min Booking Amount check
    if (found.min_booking_amount && subtotal < found.min_booking_amount) {
      setPromoError(`Requires a minimum booking amount of ${tenant.currency_symbol || '$'}${found.min_booking_amount}.`);
      setPromoCodeObj(undefined);
      return;
    }

    // Success
    setPromoCodeObj(found);
    setPromoCode(found.code);
    const reward = found.discount_type === 'percentage' 
      ? `${found.discount_value}% OFF` 
      : `${tenant.currency_symbol || '$'}${found.discount_value} OFF`;
      
    setPromoSuccess(`Applied successfully! code: ${found.code} (${reward})`);
  };

  const isFormValid = () => {
    return !!passengerName.trim() && !!passengerEmail.trim() && !!passengerPhone.trim();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">Passenger & Billing Credentials</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Please provide travelers information to authorize travel passes and issue GPS navigation tracking links.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left block form */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Traveler Credentials</h4>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
              Traveler Full Name (Required)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Malik Safdar Iqbal"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
                Contact Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+92 300 1234567"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
                Passenger Seats Limit
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Users className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={passengersCount}
                  onChange={(e) => setPassengersCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
                Baggage / Luggage Pieces
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Luggage className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={luggageCount}
                  onChange={(e) => setLuggageCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-semibold outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
              Chauffeur Special Instructions & Requests
            </label>
            <textarea
              placeholder="Child booster seat requested under 5 years old. Pick up placard at gate arrivals..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 hover:bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Right side form: payment + promo */}
        <div className="space-y-4">
          
          {/* Promo code block */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Offers & Promotional Reductions</h4>
            
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Ticket className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. ELITE20"
                  value={typedCode}
                  onChange={(e) => setTypedCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-bold uppercase transition-all outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={handleValidatePromo}
                className="bg-slate-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold font-mono hover:bg-slate-800 transition-colors cursor-pointer"
              >
                APPLY CODE
              </button>
            </div>

            {promoError && (
              <div className="text-[10px] text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100/50">
                <XOctagon className="h-3.5 w-3.5" />
                <span>{promoError}</span>
              </div>
            )}

            {promoSuccess && (
              <div className="text-[10px] text-green-600 font-semibold flex items-center gap-1.5 bg-green-50 p-2 rounded-lg border border-green-100/50">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>{promoSuccess}</span>
              </div>
            )}
          </div>

          {/* Payment gateway selection */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Select Booking Settlement Layer</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { id: 'credit_card', title: 'Stripe Credit', desc: 'Secure card details', icon: CreditCard },
                { id: 'paypal', title: 'PayPal Checkout', desc: 'Standard electronic wallet', icon: Ticket },
                { id: 'cash', title: 'Cash Chauffeur', desc: 'Pay driver directly', icon: User }
              ].map((gateway) => {
                const Icon = gateway.icon;
                const isSelected = paymentMethod === gateway.id;
                
                return (
                  <button
                    key={gateway.id}
                    type="button"
                    onClick={() => setPaymentMethod(gateway.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 mb-1.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold block leading-none">{gateway.title}</span>
                    <span className={`text-[8px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-450'}`}>{gateway.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons feedback */}
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 bg-white border border-slate-150 text-slate-600 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Vehicle Class</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid()}
          style={{ backgroundColor: isFormValid() ? tenant.primary_color : '#E2E8F0' }}
          className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>Calculate Summary</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
