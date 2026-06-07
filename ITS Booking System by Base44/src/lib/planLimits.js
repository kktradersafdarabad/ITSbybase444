/**
 * Plan-based feature limits for ITS Booking System
 * Controls what each plan can and cannot do.
 */

export const PLAN_LIMITS = {
  trial: {
    label: "Trial",
    color: "#6b7280",
    maxBookingsPerMonth: 10,
    maxDrivers: 1,
    hasPaypal: false,
    hasStripe: false,
    hasLiveTracking: false,
    hasPromos: false,
    hasAnalytics: false,
    hasMultiLanguage: false,
    hasCustomBranding: false,
    hasCustomDomain: false,
    hasFormBuilder: false,
    hasPrioritySupport: false,
  },
  basic: {
    label: "Basic",
    color: "#3b82f6",
    maxBookingsPerMonth: 50,
    maxDrivers: 1,
    hasPaypal: false,
    hasStripe: true,
    hasLiveTracking: false,
    hasPromos: false,
    hasAnalytics: true,
    hasMultiLanguage: false,
    hasCustomBranding: false,
    hasCustomDomain: false,
    hasFormBuilder: false,
    hasPrioritySupport: false,
  },
  pro: {
    label: "Pro",
    color: "#d4a017",
    maxBookingsPerMonth: null, // unlimited
    maxDrivers: null,          // unlimited
    hasPaypal: true,
    hasStripe: true,
    hasLiveTracking: true,
    hasPromos: true,
    hasAnalytics: true,
    hasMultiLanguage: true,
    hasCustomBranding: true,
    hasCustomDomain: false,
    hasFormBuilder: true,
    hasPrioritySupport: false,
  },
  enterprise: {
    label: "Enterprise",
    color: "#8b5cf6",
    maxBookingsPerMonth: null,
    maxDrivers: null,
    hasPaypal: true,
    hasStripe: true,
    hasLiveTracking: true,
    hasPromos: true,
    hasAnalytics: true,
    hasMultiLanguage: true,
    hasCustomBranding: true,
    hasCustomDomain: true,
    hasFormBuilder: true,
    hasPrioritySupport: true,
  },
};

/**
 * Get limits for a given plan
 */
export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.trial;
}

/**
 * Check if a tenant can add more drivers
 */
export function canAddDriver(plan, currentDriverCount) {
  const limits = getPlanLimits(plan);
  if (limits.maxDrivers === null) return true;
  return currentDriverCount < limits.maxDrivers;
}

/**
 * Check if a tenant has reached booking limit this month
 */
export function hasReachedBookingLimit(plan, bookingsThisMonth) {
  const limits = getPlanLimits(plan);
  if (limits.maxBookingsPerMonth === null) return false;
  return bookingsThisMonth >= limits.maxBookingsPerMonth;
}

/**
 * Get a human-readable description of the plan limits
 */
export function getPlanDescription(plan) {
  const l = getPlanLimits(plan);
  return {
    bookings: l.maxBookingsPerMonth === null ? "Unlimited bookings" : `Up to ${l.maxBookingsPerMonth} bookings/month`,
    drivers: l.maxDrivers === null ? "Unlimited drivers" : `${l.maxDrivers} driver account`,
  };
}