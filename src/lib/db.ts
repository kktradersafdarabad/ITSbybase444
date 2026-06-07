import { 
  Tenant, Vehicle, Driver, TenantBooking, 
  Route, PromoCode, DriverLocation, Review 
} from '../types';

// Let's create beautiful seeds for the platform
const SEED_TENANTS: Tenant[] = [
  {
    id: 't-elite-ride',
    business_name: 'Elite Ride Luxury Transportation',
    owner_email: 'owner@eliteride.com',
    owner_name: 'Imran Khan',
    phone: '+92 300 1234567',
    slug: 'elite-ride',
    custom_domain: 'eliteride.com',
    plan: 'pro',
    status: 'active',
    monthly_fee: 149,
    billing_day: 15,
    last_payment_date: '2026-05-15',
    next_payment_date: '2026-06-15',
    payment_status: 'paid',
    primary_color: '#C91C14', // Vibrant Red
    currency: 'USD',
    currency_symbol: '$',
    base_fare: 15,
    cost_per_km: 3,
    cost_per_minute: 0.5,
    hourly_rate: 65,
    surge_multiplier: 1.2,
    surge_start_hour: 22,
    surge_end_hour: 5,
    country_code: 'GB',
    form_config: {
      enabled_booking_types: ['distance', 'hourly', 'flat_rate', 'on_demand'],
      custom_fields: [
        { id: 'f-flight', label: 'Flight Number (Optional)', type: 'text', required: false },
        { id: 'f-child', label: 'Child Seat Required', type: 'checkbox', required: false },
        { id: 'f-notes', label: 'Meet and Greet in Terminal', type: 'checkbox', required: false }
      ]
    },
    notes: 'Premium concierge and white-glove chauffeur fleet in London / Riyadh.'
  },
  {
    id: 't-safari-transit',
    business_name: 'Safari Intercity Transit Hub',
    owner_email: 'kktradersafdarabad@gmail.com',
    owner_name: 'KK Traders Safdarabad',
    phone: '+92 321 9876543',
    slug: 'safari-transit',
    custom_domain: 'safaritransit.pk',
    plan: 'enterprise',
    status: 'active',
    monthly_fee: 299,
    billing_day: 1,
    last_payment_date: '2026-06-01',
    next_payment_date: '2026-07-01',
    payment_status: 'paid',
    primary_color: '#2563EB', // Electric Blue
    currency: 'PKR',
    currency_symbol: 'Rs.',
    base_fare: 150,
    cost_per_km: 45,
    cost_per_minute: 5,
    hourly_rate: 1500,
    surge_multiplier: 1.5,
    surge_start_hour: 21,
    surge_end_hour: 6,
    country_code: 'PK',
    form_config: {
      enabled_booking_types: ['distance', 'hourly', 'flat_rate', 'on_demand'],
      custom_fields: [
        { id: 'f-luggage-type', label: 'Cargo Type / Luggage Mode', type: 'text', required: false },
        { id: 'f-assist', label: 'Chauffeur Loading Assistance Required', type: 'checkbox', required: false }
      ]
    },
    notes: 'Primary freight-forwarding and passenger transport network.'
  },
  {
    id: 't-gold-shuttle',
    business_name: 'Gold Coast Shuttle Express',
    owner_email: 'goldcoastshuttle@gmail.com',
    owner_name: 'Sarah O\'Connor',
    phone: '+1 555 7821',
    slug: 'gold-shuttle',
    custom_domain: 'goldcoastshuttle.com',
    plan: 'basic',
    status: 'active',
    monthly_fee: 49,
    billing_day: 10,
    last_payment_date: '2026-05-10',
    next_payment_date: '2026-06-10',
    payment_status: 'paid',
    primary_color: '#D97706', // Golden Amber
    currency: 'CHF',
    currency_symbol: 'CHF',
    base_fare: 20,
    cost_per_km: 4,
    cost_per_minute: 0.8,
    hourly_rate: 80,
    surge_multiplier: 1.3,
    surge_start_hour: 23,
    surge_end_hour: 4,
    country_code: 'CH',
    form_config: {
      enabled_booking_types: ['distance', 'hourly'],
      custom_fields: []
    },
    notes: 'Alpine and mountain pass transfer shuttle fleet.'
  }
];

const SEED_VEHICLES: Vehicle[] = [
  // vehicles for Elite Ride (t-elite-ride)
  {
    id: 'v-101',
    tenant_id: 't-elite-ride',
    name: 'Mercedes Benz S-Class',
    model: 'S560 Executive Chauffeur',
    category: 'luxury',
    max_passengers: 4,
    max_luggage: 3,
    rate_per_km: 5.5,
    rate_per_hour: 95,
    base_fare: 25,
    is_active: true,
    license_plate: 'LUX-777-EX',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
    features: ['Chauffeur Meet & Greet', 'Bottled Evian Water', 'High Speed Wi-Fi', 'Heated Passenger Seats']
  },
  {
    id: 'v-102',
    tenant_id: 't-elite-ride',
    name: 'BMW X5 SUV',
    model: 'xDrive40i Premium Space',
    category: 'suv',
    max_passengers: 6,
    max_luggage: 5,
    rate_per_km: 4.2,
    rate_per_hour: 80,
    base_fare: 20,
    is_active: true,
    license_plate: 'SUV-998-XP',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400',
    features: ['Extra Large Boot Space', 'All-Wheel Drive', 'USB-C Charging Outlets']
  },
  // vehicles for Safari Transit (t-safari-transit)
  {
    id: 'v-201',
    tenant_id: 't-safari-transit',
    name: 'Toyota Grand Cabin',
    model: 'HiAce Executive 14-Seater',
    category: 'van',
    max_passengers: 12,
    max_luggage: 10,
    rate_per_km: 65,
    rate_per_hour: 2200,
    base_fare: 350,
    is_active: true,
    license_plate: 'LEF-26-8912',
    image_url: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=400',
    features: ['High Roof Cabin', 'Individual AC Vents', 'Chauffeur Driven', 'Excellent Cargo Payload']
  },
  {
    id: 'v-202',
    tenant_id: 't-safari-transit',
    name: 'Honda Civic Oriel',
    model: 'Sensing Luxury Sedan',
    category: 'sedan',
    max_passengers: 4,
    max_luggage: 2,
    rate_per_km: 45,
    rate_per_hour: 1600,
    base_fare: 150,
    is_active: true,
    license_plate: 'LXZ-19-4821',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
    features: ['Rear AC Control', 'Sunroof Elegance', 'ADAS Safety Sensors']
  },
  {
    id: 'v-203',
    tenant_id: 't-safari-transit',
    name: 'Toyota Fortuner Sigma4',
    model: 'Offroad Master SUV',
    category: 'suv',
    max_passengers: 7,
    max_luggage: 4,
    rate_per_km: 80,
    rate_per_hour: 2900,
    base_fare: 500,
    is_active: true,
    license_plate: 'OKARA-781',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
    features: ['4x4 Offroad Traction', 'Leather Cabin Interior', 'Heavy Towing Capacity']
  }
];

const SEED_DRIVERS: Driver[] = [
  // Drivers for Elite Ride (t-elite-ride)
  {
    id: 'dr-101',
    tenant_id: 't-elite-ride',
    full_name: 'Arthur Pendelton',
    email: 'arthur.p@eliteride.com',
    phone: '+44 7700 900077',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    license_number: 'UK-DL-982124A',
    status: 'available',
    assigned_vehicle_id: 'v-101',
    rating: 4.9,
    total_trips: 1240,
    total_earnings: 45620,
    commission_percent: 75
  },
  {
    id: 'dr-102',
    tenant_id: 't-elite-ride',
    full_name: 'Robert Vance',
    email: 'robert.v@eliteride.com',
    phone: '+44 7700 900089',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    license_number: 'UK-DL-712891B',
    status: 'on_trip',
    assigned_vehicle_id: 'v-102',
    rating: 4.7,
    total_trips: 840,
    total_earnings: 28410,
    commission_percent: 80
  },
  // Drivers for Safari Transit (t-safari-transit)
  {
    id: 'dr-201',
    tenant_id: 't-safari-transit',
    full_name: 'Sardar Safeer Ahmad',
    email: 'safeer@safaritransit.pk',
    phone: '+92 300 4821992',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    license_number: 'LHR-PK-89104',
    status: 'available',
    assigned_vehicle_id: 'v-201',
    rating: 4.9,
    total_trips: 710,
    total_earnings: 320500,
    commission_percent: 85
  },
  {
    id: 'dr-202',
    tenant_id: 't-safari-transit',
    full_name: 'Zafar Iqbal Chohan',
    email: 'zafar@safaritransit.pk',
    phone: '+92 321 7712399',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    license_number: 'FSD-PK-11048',
    status: 'on_trip',
    assigned_vehicle_id: 'v-202',
    rating: 4.8,
    total_trips: 450,
    total_earnings: 241000,
    commission_percent: 80
  }
];

const SEED_PROMOS: PromoCode[] = [
  {
    id: 'p-1',
    tenant_id: 't-elite-ride',
    code: 'ELITE20',
    discount_type: 'percentage',
    discount_value: 20,
    min_booking_amount: 50,
    max_uses: 200,
    max_uses_per_user: 1,
    current_uses: 45,
    expires_at: '2026-12-31',
    is_active: true
  },
  {
    id: 'p-2',
    tenant_id: 't-safari-transit',
    code: 'AZADI15',
    discount_type: 'percentage',
    discount_value: 15,
    min_booking_amount: 300,
    max_uses: 1000,
    is_active: true
  },
  {
    id: 'p-3',
    tenant_id: 't-safari-transit',
    code: 'SAFAR500',
    discount_type: 'fixed',
    discount_value: 500,
    min_booking_amount: 2500,
    max_uses: 500,
    is_active: true
  },
  {
    id: 'p-4',
    tenant_id: 't-elite-ride',
    code: 'WELCOME10',
    discount_type: 'fixed',
    discount_value: 10,
    min_booking_amount: 30,
    max_uses: 500,
    is_active: true
  }
];

const SEED_ROUTES: Route[] = [
  {
    id: 'r-101',
    tenant_id: 't-elite-ride',
    name: 'Heathrow Airport Transfer',
    pickup_area: 'London Heathrow Airport Terminal 5 (LHR)',
    dropoff_area: 'Mayfair, Central London',
    distance_km: 26,
    flat_rate: 85,
    is_active: true,
    description: 'Fixed pricing from LHR arrivals direct to Mayfair and Westminster district hotel transfers.'
  },
  {
    id: 'r-102',
    tenant_id: 't-elite-ride',
    name: 'Gatwick Direct Liaison',
    pickup_area: 'London Gatwick Airport (LGW)',
    dropoff_area: 'City of London Financial Hub',
    distance_km: 48,
    flat_rate: 130,
    is_active: true,
    description: 'Fast track corporate executive flat-fare service.'
  },
  {
    id: 'r-201',
    tenant_id: 't-safari-transit',
    name: 'Sialkot Dry Port Cargo Link',
    pickup_area: 'Sialkot Export Dry Port Complex',
    dropoff_area: 'Lahore Dry Port / Thokar Niaz Baig',
    distance_km: 135,
    flat_rate: 12000,
    is_active: true,
    description: 'Fast-track logistical trailer link for manufacturing goods.'
  },
  {
    id: 'r-202',
    tenant_id: 't-safari-transit',
    name: 'Karachi Port Sea Chauffeur',
    pickup_area: 'Port Qasim Terminal Harbour',
    dropoff_area: 'Saddar Business Cantonment Hub',
    distance_km: 38,
    flat_rate: 4500,
    is_active: true,
    description: 'Fast intercity transit link for container clearing agents.'
  }
];

const SEED_BOOKINGS: TenantBooking[] = [
  {
    id: 'b-001',
    tenant_id: 't-elite-ride',
    tenant_slug: 'elite-ride',
    booking_ref: 'ITS-895124',
    status: 'completed',
    booking_type: 'distance',
    pickup_address: 'London Heathrow Airport Terminal 5 (LHR)',
    dropoff_address: 'The Ritz Hotel, Piccadilly, London',
    pickup_date: '2026-06-06',
    pickup_time: '14:30',
    estimated_distance_km: 26,
    estimated_duration_min: 45,
    vehicle_name: 'Mercedes Benz S-Class',
    driver_name: 'Arthur Pendelton',
    driver_id: 'dr-101',
    passenger_name: 'Michael Sterling',
    passenger_email: 'michael@sterlingholding.co.uk',
    passenger_phone: '+44 7911 882191',
    passengers_count: 2,
    luggage_count: 2,
    special_requests: 'Require name plaque board sign at terminal arrivals gate.',
    flight_number: 'BA-248',
    base_fare: 25,
    distance_charge: 143,
    time_charge: 22.5,
    discount_amount: 0,
    total_fare: 190.5,
    payment_method: 'credit_card',
    payment_status: 'paid',
    payment_intent_id: 'pi_elite_lz812903',
    notes: 'Completed beautifully on time. Excellent VIP feedback received.'
  },
  {
    id: 'b-002',
    tenant_id: 't-elite-ride',
    tenant_slug: 'elite-ride',
    booking_ref: 'ITS-482103',
    status: 'in_progress',
    booking_type: 'hourly',
    pickup_address: 'Claridge\'s, Brook St, London',
    dropoff_address: 'London Chauffeur Guided Tour (As Directed)',
    pickup_date: '2026-06-07',
    pickup_time: '10:00',
    hours_booked: 4,
    estimated_duration_min: 240,
    vehicle_name: 'BMW X5 SUV',
    driver_name: 'Robert Vance',
    driver_id: 'dr-102',
    passenger_name: 'Lord Arthur Pendelton',
    passenger_email: 'pendelton@vanguardlords.com',
    passenger_phone: '+44 7911 110948',
    passengers_count: 4,
    luggage_count: 3,
    special_requests: 'Private security clearance verified.',
    base_fare: 20,
    distance_charge: 0,
    time_charge: 320, // 4 hours * 80
    discount_amount: 10, // WELCOME10
    total_fare: 330,
    payment_method: 'credit_card',
    payment_status: 'paid',
    payment_intent_id: 'pi_elite_vx771239aa',
    notes: 'In progress now. Live tracker feeds active.'
  },
  {
    id: 'b-003',
    tenant_id: 't-safari-transit',
    tenant_slug: 'safari-transit',
    booking_ref: 'ITS-219803',
    status: 'confirmed',
    booking_type: 'flat_rate',
    pickup_address: 'Sialkot Export Dry Port Complex',
    dropoff_address: 'Lahore Dry Port / Thokar Niaz Baig',
    pickup_date: '2026-06-08',
    pickup_time: '08:00',
    estimated_distance_km: 135,
    vehicle_name: 'Toyota Grand Cabin',
    driver_name: 'Sardar Safeer Ahmad',
    driver_id: 'dr-201',
    passenger_name: 'Malik Safdar Iqbal',
    passenger_email: 'kktradersafdarabad@gmail.com',
    passenger_phone: '+92 300 4812999',
    passengers_count: 1,
    luggage_count: 8,
    special_requests: 'Urgent cargo loading of Sialkot export sports goods. Heavy trunk security needed.',
    base_fare: 350,
    distance_charge: 11650,
    time_charge: 0,
    discount_amount: 0,
    total_fare: 12000,
    payment_method: 'cash',
    payment_status: 'pending',
    notes: 'Safdarabad dry port schedule verified with agent.'
  }
];

const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    tenant_id: 't-elite-ride',
    booking_id: 'b-001',
    booking_ref: 'ITS-895124',
    driver_id: 'dr-101',
    driver_name: 'Arthur Pendelton',
    passenger_name: 'Michael Sterling',
    passenger_email: 'michael@sterlingholding.co.uk',
    rating: 5,
    comment: 'Arthur was exceptionally professional. The Mercedes was pristine, cold water and fresh newspapers included! Will book again.',
    service_rating: 5,
    cleanliness_rating: 5,
    punctuality_rating: 5
  }
];

const SEED_LOCATIONS: DriverLocation[] = [
  {
    id: 'dr-101',
    driver_id: 'dr-101',
    booking_id: 'b-001',
    tenant_slug: 'elite-ride',
    lat: 51.4700, // Heathrow
    lng: -0.4543,
    heading: 90,
    is_active: false
  },
  {
    id: 'dr-102',
    driver_id: 'dr-102',
    booking_id: 'b-002',
    tenant_slug: 'elite-ride',
    lat: 51.5074, // Mayfair / Central London
    lng: -0.1278,
    heading: 180,
    is_active: true
  },
  {
    id: 'dr-201',
    driver_id: 'dr-201',
    booking_id: 'b-003',
    tenant_slug: 'safari-transit',
    lat: 32.5085, // Sialkot
    lng: 74.5204,
    heading: 270,
    is_active: true
  }
];

// Helper to access and manipulate local database state
export class ITSLocalStorageDB {
  private static initKey(key: string, defaultValue: any) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }

  static initialize() {
    this.initKey('its_tenants', SEED_TENANTS);
    this.initKey('its_vehicles', SEED_VEHICLES);
    this.initKey('its_drivers', SEED_DRIVERS);
    this.initKey('its_promos', SEED_PROMOS);
    this.initKey('its_routes', SEED_ROUTES);
    this.initKey('its_bookings', SEED_BOOKINGS);
    this.initKey('its_reviews', SEED_REVIEWS);
    this.initKey('its_locations', SEED_LOCATIONS);
  }

  // --- QUERY APIS ---
  static getTenants(): Tenant[] {
    this.initialize();
    return JSON.parse(localStorage.getItem('its_tenants') || '[]');
  }

  static getTenantBySlug(slug: string): Tenant | undefined {
    return this.getTenants().find(t => t.slug === slug);
  }

  static saveTenant(tenant: Tenant): void {
    const tenants = this.getTenants();
    const idx = tenants.findIndex(t => t.id === tenant.id);
    if (idx !== -1) {
      tenants[idx] = tenant;
    } else {
      tenants.push(tenant);
    }
    localStorage.setItem('its_tenants', JSON.stringify(tenants));
  }

  static deleteTenant(id: string): void {
    const tenants = this.getTenants().filter(t => t.id !== id);
    localStorage.setItem('its_tenants', JSON.stringify(tenants));
  }

  // Vehicles
  static getVehicles(tenantId?: string): Vehicle[] {
    this.initialize();
    const all = JSON.parse(localStorage.getItem('its_vehicles') || '[]');
    return tenantId ? all.filter((v: Vehicle) => v.tenant_id === tenantId) : all;
  }

  static saveVehicle(vehicle: Vehicle): void {
    const all = this.getVehicles();
    const idx = all.findIndex(v => v.id === vehicle.id);
    if (idx !== -1) {
      all[idx] = vehicle;
    } else {
      all.push(vehicle);
    }
    localStorage.setItem('its_vehicles', JSON.stringify(all));
  }

  static deleteVehicle(id: string): void {
    const all = this.getVehicles().filter(v => v.id !== id);
    localStorage.setItem('its_vehicles', JSON.stringify(all));
  }

  // Drivers
  static getDrivers(tenantId?: string): Driver[] {
    this.initialize();
    const all = JSON.parse(localStorage.getItem('its_drivers') || '[]');
    return tenantId ? all.filter((d: Driver) => d.tenant_id === tenantId) : all;
  }

  static saveDriver(driver: Driver): void {
    const all = this.getDrivers();
    const idx = all.findIndex(d => d.id === driver.id);
    if (idx !== -1) {
      all[idx] = driver;
    } else {
      all.push(driver);
    }
    localStorage.setItem('its_drivers', JSON.stringify(all));
  }

  static deleteDriver(id: string): void {
    const all = this.getDrivers().filter(d => d.id !== id);
    localStorage.setItem('its_drivers', JSON.stringify(all));
  }

  // Bookings
  static getBookings(tenantId?: string): TenantBooking[] {
    this.initialize();
    const all = JSON.parse(localStorage.getItem('its_bookings') || '[]');
    return tenantId ? all.filter((b: TenantBooking) => b.tenant_id === tenantId) : all;
  }

  static getBookingByRef(ref: string): TenantBooking | undefined {
    return this.getBookings().find(b => b.booking_ref.toUpperCase() === ref.toUpperCase().trim());
  }

  static saveBooking(booking: TenantBooking): void {
    const all = this.getBookings();
    const idx = all.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      all[idx] = booking;
    } else {
      all.push(booking);
    }
    localStorage.setItem('its_bookings', JSON.stringify(all));
  }

  // Routes
  static getRoutes(tenantId?: string): Route[] {
    this.initialize();
    const all = JSON.parse(localStorage.getItem('its_routes') || '[]');
    return tenantId ? all.filter((r: Route) => r.tenant_id === tenantId) : all;
  }

  static saveRoute(route: Route): void {
    const all = this.getRoutes();
    const idx = all.findIndex(r => r.id === route.id);
    if (idx !== -1) {
      all[idx] = route;
    } else {
      all.push(route);
    }
    localStorage.setItem('its_routes', JSON.stringify(all));
  }

  static deleteRoute(id: string): void {
    const all = this.getRoutes().filter(r => r.id !== id);
    localStorage.setItem('its_routes', JSON.stringify(all));
  }

  // Promo Codes
  static getPromos(tenantId?: string): PromoCode[] {
    this.initialize();
    const all = JSON.parse(localStorage.getItem('its_promos') || '[]');
    return tenantId ? all.filter((p: PromoCode) => p.tenant_id === tenantId) : all;
  }

  static savePromo(promo: PromoCode): void {
    const all = this.getPromos();
    const idx = all.findIndex(p => p.id === promo.id);
    if (idx !== -1) {
      all[idx] = promo;
    } else {
      all.push(promo);
    }
    localStorage.setItem('its_promos', JSON.stringify(all));
  }

  static deletePromo(id: string): void {
    const all = this.getPromos().filter(p => p.id !== id);
    localStorage.setItem('its_promos', JSON.stringify(all));
  }

  // Locations (Driver GPS Simulators)
  static getLocations(): DriverLocation[] {
    this.initialize();
    return JSON.parse(localStorage.getItem('its_locations') || '[]');
  }

  static getDriverLocation(driverId: string): DriverLocation | undefined {
    return this.getLocations().find(l => l.driver_id === driverId);
  }

  static updateDriverLocation(driverId: string, lat: number, lng: number, is_active = true) {
    const all = this.getLocations();
    const idx = all.findIndex(l => l.driver_id === driverId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], lat, lng, is_active, updated_at: new Date().toISOString() };
    } else {
      all.push({ id: driverId, driver_id: driverId, lat, lng, is_active, updated_at: new Date().toISOString() });
    }
    localStorage.setItem('its_locations', JSON.stringify(all));
  }

  // Reviews
  static getReviews(tenantId?: string): Review[] {
    this.initialize();
    const all = JSON.parse(localStorage.getItem('its_reviews') || '[]');
    return tenantId ? all.filter((r: Review) => r.tenant_id === tenantId) : all;
  }

  static saveReview(review: Review): void {
    const all = this.getReviews();
    const idx = all.findIndex(r => r.id === review.id);
    if (idx !== -1) {
      all[idx] = review;
    } else {
      all.push(review);
    }
    localStorage.setItem('its_reviews', JSON.stringify(all));
  }
}
