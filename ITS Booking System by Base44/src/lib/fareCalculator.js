// UK/Europe style fare calculator
// Standard UK minicab/private hire industry pricing model:
// Flag Fall (hire charge) + per-mile rate + per-minute waiting + night/surge surcharge + extras

import { EXTRAS } from "@/components/booking/BookingExtras";

export function calculateFare({ bookingType, vehicle, settings, distance, duration, hours, route, promoCode, extras = [], returnTrip = false }) {
  // --- Rate resolution ---
  // UK: "flag fall" = hire charge, charged per mile (not km), waiting time per minute
  const flagFall = vehicle?.base_fare || settings?.flag_fall || settings?.base_fare || 3.0;
  const perMileRate = vehicle?.rate_per_km
    ? vehicle.rate_per_km * 1.60934            // convert per-km to per-mile if stored that way
    : settings?.cost_per_mile || (settings?.cost_per_km ? settings.cost_per_km * 1.60934 : 2.80);
  
  // For internal calculations, we store distance in KM but display in miles
  const distanceMiles = (distance || 0) / 1.60934;
  
  const waitingRatePerMin = settings?.waiting_rate_per_min || settings?.cost_per_minute || 0.30;
  const hourlyRate = vehicle?.rate_per_hour || settings?.hourly_rate || 55;

  // Night premium (% added to total, e.g. 0.2 = 20%)
  const nightPremiumRate = settings?.night_premium || 0;

  let distanceCharge = 0;
  let timeCharge = 0;
  let totalBeforeDiscount = 0;

  if (bookingType === "flat_rate" && route) {
    totalBeforeDiscount = route.flat_rate;
  } else if (bookingType === "hourly") {
    totalBeforeDiscount = flagFall + hourlyRate * (hours || 1);
  } else if (bookingType === "on_demand") {
    totalBeforeDiscount = flagFall;
  } else {
    // Standard distance booking — UK style metered fare
    distanceCharge = distanceMiles * perMileRate;
    timeCharge = (duration || 0) * waitingRatePerMin;
    totalBeforeDiscount = flagFall + distanceCharge + timeCharge;
  }

  // Return trip — double the distance/time charge, not the flag fall
  if (returnTrip && bookingType !== "flat_rate" && bookingType !== "on_demand") {
    const tripCost = totalBeforeDiscount - flagFall;
    totalBeforeDiscount = flagFall + tripCost * 2;
    distanceCharge = distanceCharge * 2;
    timeCharge = timeCharge * 2;
  }

  // Surge/night pricing
  let surgeMultiplier = 1;
  if (settings?.surge_multiplier && settings.surge_multiplier > 1) {
    const now = new Date().getHours();
    const start = settings.surge_start_hour ?? 22;
    const end = settings.surge_end_hour ?? 5;
    const isSurge = start > end ? (now >= start || now < end) : (now >= start && now < end);
    if (isSurge) surgeMultiplier = settings.surge_multiplier;
  }
  totalBeforeDiscount *= surgeMultiplier;

  // Night premium
  if (nightPremiumRate > 0) {
    const now = new Date().getHours();
    const isNight = now >= 22 || now < 6;
    if (isNight) totalBeforeDiscount *= (1 + nightPremiumRate);
  }

  // Extras (child seat, meet & greet, etc.)
  let extrasCharge = 0;
  if (extras && extras.length > 0) {
    extrasCharge = extras.reduce((sum, key) => {
      const extra = EXTRAS.find(e => e.key === key);
      return sum + (extra?.price || 0);
    }, 0);
  }

  totalBeforeDiscount += extrasCharge;

  // Promo discount
  let discountAmount = 0;
  if (promoCode) {
    const minAmount = promoCode.min_booking_amount || 0;
    if (totalBeforeDiscount >= minAmount || minAmount === 0) {
      if (promoCode.discount_type === "percentage") {
        discountAmount = totalBeforeDiscount * (promoCode.discount_value / 100);
      } else {
        discountAmount = promoCode.discount_value;
      }
      discountAmount = Math.min(discountAmount, totalBeforeDiscount);
    }
  }

  return {
    base_fare: parseFloat(flagFall.toFixed(2)),
    distance_charge: parseFloat(distanceCharge.toFixed(2)),
    time_charge: parseFloat(timeCharge.toFixed(2)),
    extras_charge: parseFloat(extrasCharge.toFixed(2)),
    surge_multiplier: surgeMultiplier,
    discount_amount: parseFloat(discountAmount.toFixed(2)),
    total_fare: parseFloat(Math.max(0, totalBeforeDiscount - discountAmount).toFixed(2)),
    distance_miles: parseFloat(distanceMiles.toFixed(1)),
  };
}