import React, { useState } from 'react';
import { Star, MessageSquare, ShieldAlert, Check } from 'lucide-react';
import { TenantBooking, Review, Tenant } from '../../types';
import { ITSLocalStorageDB } from '../../lib/db';

interface RatingModalProps {
  booking: TenantBooking;
  tenant: Tenant;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RatingModal({ booking, tenant, onClose, onSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [punctuality, setPunctuality] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const review: Review = {
      id: `rev-${Date.now()}`,
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      driver_id: booking.driver_id,
      driver_name: booking.driver_name,
      passenger_name: booking.passenger_name,
      passenger_email: booking.passenger_email,
      rating: rating,
      comment: comment,
      service_rating: rating,
      cleanliness_rating: cleanliness,
      punctuality_rating: punctuality
    };

    // Save review
    ITSLocalStorageDB.saveReview(review);

    // Update driver total score if assigned
    if (booking.driver_id) {
      const drivers = ITSLocalStorageDB.getDrivers(booking.tenant_id);
      const dr = drivers.find(d => d.id === booking.driver_id);
      if (dr) {
        const currentRating = dr.rating || 5;
        const totalTrips = (dr.total_trips || 0) + 1;
        dr.rating = parseFloat(((currentRating * (totalTrips - 1) + rating) / totalTrips).toFixed(1));
        dr.total_trips = totalTrips;
        ITSLocalStorageDB.saveDriver(dr);
      }
    }

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1500);
    }, 800);
  };

  const renderStars = (current: number, setter: (val: number) => void) => {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setter(num)}
            className="cursor-pointer hover:scale-110 transition-transform focus:outline-hidden"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                num <= current
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-slate-100 shadow-xl overflow-hidden relative">
        
        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Review Submitted!</h3>
            <p className="text-xs text-slate-400">Thank you for rating. Your feedback keeps our premium network pristine.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Rate Your Ride Chauffeur</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
                REF: {booking.booking_ref} / CAR: {booking.vehicle_name || 'VIP FLEET'}
              </p>
            </div>

            {/* Drivers Profile brief banner */}
            {booking.driver_name && (
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  {booking.driver_name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-bold text-slate-700 block">{booking.driver_name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">VERIFIED PROFESSIONAL PARTNER</span>
                </div>
              </div>
            )}

            {/* Service Stars Slider */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Overall Driver Service (★ 1-5)
                </label>
                {renderStars(rating, setRating)}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Vehicle Cleanliness & Sanitization (★ 1-5)
                </label>
                {renderStars(cleanliness, setCleanliness)}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Driver Punctuality & Response (★ 1-5)
                </label>
                {renderStars(punctuality, setPunctuality)}
              </div>
            </div>

            {/* Review Comment Area */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                Share your journey comments
              </label>
              <textarea
                placeholder="Arthur opened doors for bags, excellent music volume control..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={400}
                rows={3}
                className="w-full bg-slate-50 hover:bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-100"
              >
                Close / Dismiss
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: tenant.primary_color }}
                className="w-1/2 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
