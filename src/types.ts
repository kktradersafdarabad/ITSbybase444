export type PlanType = 'trial' | 'basic' | 'pro' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'cancelled';
export type PaymentStatusType = 'paid' | 'overdue' | 'pending';

export interface Tenant {
  id: string; // Document ID
  business_name: string;
  owner_email: string;
  owner_name?: string;
  phone?: string;
  slug: string; // unique URL identifier
  custom_domain?: string;
  plan?: PlanType;
  status?: TenantStatus;
  monthly_fee?: number;
  billing_day?: number;
  last_payment_date?: string;
  next_payment_date?: string;
  payment_status?: PaymentStatusType;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  paypal_client_id?: string;
  paypal_secret?: string;
  wa_phone_id?: string;
  wa_token?: string;
  primary_color: string; // Default: #C91C14
  logo_url?: string;
  currency: string; // Default: USD
  currency_symbol: string; // Default: $
  base_fare: number; // Default: 15
  cost_per_km: number; // Default: 3
  cost_per_minute: number; // Default: 0.5
  hourly_rate: number; // Default: 65
  surge_multiplier: number; // Default: 1
  surge_start_hour: number; // Default: 22
  surge_end_hour: number; // Default: 5
  country_code: string; // ISO 2-letter, default: GB
  form_config?: {
    enabled_booking_types?: string[]; // distance, hourly, flat_rate, on_demand
    custom_fields?: { id: string; label: string; type: 'text' | 'checkbox' | 'select'; required: boolean; options?: string[] }[];
  };
  notes?: string;
}

export type VehicleCategory = 'sedan' | 'suv' | 'luxury' | 'van' | 'stretch_limo';

export interface Vehicle {
  id: string;
  tenant_id: string;
  name: string;
  model: string;
  image_url?: string;
  category: VehicleCategory;
  max_passengers: number;
  max_luggage?: number;
  rate_per_km: number;
  rate_per_hour?: number;
  base_fare?: number;
  is_active: boolean;
  license_plate?: string;
  features?: string[];
}

export type DriverStatus = 'available' | 'on_trip' | 'offline' | 'suspended';

export interface Driver {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  license_number?: string;
  status: DriverStatus;
  assigned_vehicle_id?: string;
  rating?: number;
  total_trips?: number;
  total_earnings?: number;
  commission_percent?: number; // default: 80
}

export type BookingStatus = 'pending' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
export type BookingType = 'distance' | 'hourly' | 'flat_rate' | 'on_demand';
export type PaymentMethod = 'credit_card' | 'paypal' | 'cash';
export type BookingPaymentStatus = 'pending' | 'paid' | 'refunded';

export interface TenantBooking {
  id: string;
  tenant_id: string;
  tenant_slug: string;
  booking_ref: string; // unique human-readable code
  status: BookingStatus;
  booking_type: BookingType;
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string;
  pickup_time: string;
  estimated_distance_km?: number;
  estimated_duration_min?: number;
  hours_booked?: number;
  vehicle_name?: string;
  driver_name?: string;
  driver_id?: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone?: string;
  passengers_count?: number;
  luggage_count?: number;
  special_requests?: string;
  flight_number?: string;
  base_fare: number;
  distance_charge: number;
  time_charge: number;
  discount_amount: number;
  promo_code?: string;
  total_fare: number;
  payment_method: PaymentMethod;
  payment_status: BookingPaymentStatus;
  payment_intent_id?: string;
  notes?: string;
}

export interface Route {
  id: string;
  tenant_id: string;
  name: string;
  pickup_area: string;
  dropoff_area: string;
  distance_km?: number;
  flat_rate: number;
  is_active: boolean;
  description?: string;
}

export type PromoDiscountType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  tenant_id: string;
  code: string; // uppercase
  discount_type: PromoDiscountType;
  discount_value: number;
  min_booking_amount?: number;
  max_uses?: number; // 0 = unlimited
  max_uses_per_user?: number;
  current_uses?: number; // default: 0
  expires_at?: string;
  is_active: boolean;
}

export interface DriverLocation {
  id: string; // same as driver_id
  driver_id: string;
  booking_id?: string;
  tenant_slug?: string;
  lat: number;
  lng: number;
  heading?: number;
  is_active: boolean;
  updated_at?: string;
}

export interface Review {
  id: string;
  tenant_id: string;
  booking_id: string;
  booking_ref: string;
  driver_id?: string;
  driver_name?: string;
  passenger_name?: string;
  passenger_email?: string;
  rating: number; // 1-5
  comment?: string;
  service_rating?: number;
  cleanliness_rating?: number;
  punctuality_rating?: number;
}
