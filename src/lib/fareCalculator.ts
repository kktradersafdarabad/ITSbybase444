import { Tenant, Vehicle, PromoCode, BookingType } from '../types';

export interface FareCalculationResult {
  base_fare: number;
  distance_charge: number;
  time_charge: number;
  surge_multiplier: number;
  is_surge_active: boolean;
  discount_amount: number;
  subtotal: number;
  total_fare: number;
  error?: string;
}

export function calculateFare(
  tenant: Tenant,
  vehicle: Vehicle | undefined,
  bookingType: BookingType,
  params: {
    distanceKm?: number;
    durationMin?: number;
    hoursBooked?: number;
    flatRate?: number;
    pickupTime?: string; // "HH:MM" format
    promoCodeObj?: PromoCode;
  }
): FareCalculationResult {
  const currencySymbol = tenant.currency_symbol || '$';
  
  let base_fare = vehicle?.base_fare ?? tenant.base_fare;
  let distance_charge = 0;
  let time_charge = 0;
  let surge_multiplier = 1;
  let is_surge_active = false;
  
  // Calculate surge based on pickup hours
  if (params.pickupTime) {
    try {
      const hours = parseInt(params.pickupTime.split(':')[0], 10);
      const startSurge = tenant.surge_start_hour ?? 22;
      const endSurge = tenant.surge_end_hour ?? 5;
      
      const isSurgeHour = startSurge > endSurge
        ? (hours >= startSurge || hours < endSurge)            // Overnight (e.g., 22:00 to 05:00)
        : (hours >= startSurge && hours < endSurge);            // Daytime core
        
      if (isSurgeHour) {
        surge_multiplier = tenant.surge_multiplier || 1.25;
        is_surge_active = true;
      }
    } catch (e) {
      console.error('Surge time checking failed', e);
    }
  }

  // Calculate base rates depending on booking structure
  switch (bookingType) {
    case 'flat_rate':
      // From routes
      const flat = params.flatRate ?? 0;
      base_fare = flat;
      distance_charge = 0;
      time_charge = 0;
      break;

    case 'hourly':
      const hours = params.hoursBooked ?? 1;
      const ratePerHour = vehicle?.rate_per_hour ?? tenant.hourly_rate;
      time_charge = hours * ratePerHour;
      distance_charge = 0;
      break;

    case 'on_demand':
    case 'distance':
    default:
      const km = params.distanceKm ?? 0;
      const min = params.durationMin ?? 0;
      const perKm = vehicle?.rate_per_km ?? tenant.cost_per_km;
      const perMin = tenant.cost_per_minute;
      
      distance_charge = km * perKm;
      time_charge = min * perMin;
      break;
  }

  // Core sum before promo
  const subtotal = (base_fare + distance_charge + time_charge) * surge_multiplier;
  
  // Validate and apply promo code
  let discount_amount = 0;
  if (params.promoCodeObj) {
    const promo = params.promoCodeObj;
    let promoValid = true;
    
    // Minimum booking amount
    if (promo.min_booking_amount && subtotal < promo.min_booking_amount) {
      promoValid = false;
    }
    
    // Expiry check
    if (promo.expires_at) {
      const expiry = new Date(promo.expires_at);
      const today = new Date();
      if (expiry < today) {
        promoValid = false;
      }
    }
    
    if (promo.is_active === false) {
      promoValid = false;
    }
    
    if (promoValid) {
      if (promo.discount_type === 'percentage') {
        discount_amount = (subtotal * promo.discount_value) / 100;
      } else {
        discount_amount = promo.discount_value;
      }
    }
  }

  // Final validation parameters
  const total = Math.max(0, subtotal - discount_amount);

  return {
    base_fare,
    distance_charge: Math.round(distance_charge * 100) / 100,
    time_charge: Math.round(time_charge * 100) / 100,
    surge_multiplier,
    is_surge_active,
    discount_amount: Math.round(discount_amount * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    total_fare: Math.round(total * 100) / 100
  };
}
