/**
 * Custom Domain Utility
 * 
 * Jab tenant apna custom domain (e.g. customerdomain.com) use kare,
 * to system automatically us domain ko detect karta hai aur accordingly
 * routing aur URLs adjust karta hai.
 */

const BASE44_DOMAINS = [
  "base44.app",
  "localhost",
  "127.0.0.1",
];

/**
 * Check karo ke current hostname ek custom domain hai ya nahi
 */
export function isCustomDomain() {
  const hostname = window.location.hostname;
  return !BASE44_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));
}

/**
 * Current custom domain return karo (agar hai to)
 */
export function getCustomDomain() {
  if (isCustomDomain()) return window.location.hostname;
  return null;
}

/**
 * Tenant ke liye booking URL generate karo
 * - Custom domain pe: https://customerdomain.com/book
 * - Base44 pe: https://app.base44.app/book/:slug
 */
export function getBookingUrl(tenant) {
  if (!tenant) return "";
  if (tenant.custom_domain) {
    return `https://${tenant.custom_domain}/book`;
  }
  return `${window.location.origin}/book/${tenant.slug}`;
}

/**
 * Tenant ke liye driver URL generate karo
 */
export function getDriverUrl(tenant) {
  if (!tenant) return "";
  if (tenant.custom_domain) {
    return `https://${tenant.custom_domain}/driver`;
  }
  return `${window.location.origin}/driver/${tenant.slug}`;
}

/**
 * Tenant ke liye dashboard URL generate karo
 * Super admin is link ko share kar sakta hai tenant owner ke saath
 */
export function getDashboardUrl(tenant) {
  if (!tenant) return "";
  if (tenant.custom_domain) {
    return `https://${tenant.custom_domain}/dashboard`;
  }
  return `${window.location.origin}/tenant/${tenant.slug}/dashboard`;
}