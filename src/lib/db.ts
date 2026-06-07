import { 
  Tenant, Vehicle, Driver, TenantBooking, 
  Route, PromoCode, DriverLocation, Review 
} from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

// Operation Types as defined by rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Error Handler callback conform to requirements
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Beautiful initial seeds
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
    primary_color: '#C91C14',
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
    primary_color: '#2563EB',
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
    primary_color: '#D97706',
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
    time_charge: 320,
    discount_amount: 10,
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
    lat: 51.4700,
    lng: -0.4543,
    heading: 90,
    is_active: false
  },
  {
    id: 'dr-102',
    driver_id: 'dr-102',
    booking_id: 'b-002',
    tenant_slug: 'elite-ride',
    lat: 51.5074,
    lng: -0.1278,
    heading: 180,
    is_active: true
  },
  {
    id: 'dr-201',
    driver_id: 'dr-201',
    booking_id: 'b-003',
    tenant_slug: 'safari-transit',
    lat: 32.5085,
    lng: 74.5204,
    heading: 270,
    is_active: true
  }
];

// Helper to access and manipulate client/cloud states
export class ITSLocalStorageDB {
  private static initKey(key: string, defaultValue: any) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }

  // Set up synchronization and background seeding
  static initialize() {
    // Initialise fallback states first
    this.initKey('its_tenants', SEED_TENANTS);
    this.initKey('its_vehicles', SEED_VEHICLES);
    this.initKey('its_drivers', SEED_DRIVERS);
    this.initKey('its_promos', SEED_PROMOS);
    this.initKey('its_routes', SEED_ROUTES);
    this.initKey('its_bookings', SEED_BOOKINGS);
    this.initKey('its_reviews', SEED_REVIEWS);
    this.initKey('its_locations', SEED_LOCATIONS);

    // Boot background sync listeners & seeding
    this.seedFirestoreAndBootSync();
  }

  private static async seedFirestoreAndBootSync() {
    try {
      // Check if tenants database on Firestore is empty
      const tSnap = await getDocs(collection(db, 'tenants')).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'tenants');
        return null;
      });

      if (tSnap && tSnap.empty) {
        console.log('⚡ Firestore database is unseeded. Populating original whitelabel presets...');
        
        // Populate collections securely
        for (const t of SEED_TENANTS) {
          await setDoc(doc(db, 'tenants', t.id), t).catch(err => handleFirestoreError(err, OperationType.WRITE, `tenants/${t.id}`));
        }
        for (const v of SEED_VEHICLES) {
          await setDoc(doc(db, 'vehicles', v.id), v).catch(err => handleFirestoreError(err, OperationType.WRITE, `vehicles/${v.id}`));
        }
        for (const d of SEED_DRIVERS) {
          await setDoc(doc(db, 'drivers', d.id), d).catch(err => handleFirestoreError(err, OperationType.WRITE, `drivers/${d.id}`));
        }
        for (const p of SEED_PROMOS) {
          await setDoc(doc(db, 'promos', p.id), p).catch(err => handleFirestoreError(err, OperationType.WRITE, `promos/${p.id}`));
        }
        for (const r of SEED_ROUTES) {
          await setDoc(doc(db, 'routes', r.id), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `routes/${r.id}`));
        }
        for (const b of SEED_BOOKINGS) {
          await setDoc(doc(db, 'bookings', b.id), b).catch(err => handleFirestoreError(err, OperationType.WRITE, `bookings/${b.id}`));
        }
        for (const r of SEED_REVIEWS) {
          await setDoc(doc(db, 'reviews', r.id), r).catch(err => handleFirestoreError(err, OperationType.WRITE, `reviews/${r.id}`));
        }
        for (const l of SEED_LOCATIONS) {
          await setDoc(doc(db, 'locations', l.id), l).catch(err => handleFirestoreError(err, OperationType.WRITE, `locations/${l.id}`));
        }
        console.log('👑 Seeding completed successfully.');
      }
    } catch (error) {
      console.warn('Silent seeding error ignored (rules/offline protection schema):', error);
    }

    // Connect real-time listeners for instant cross-tab updates
    this.startRealtimeListeners();
  }

  private static startRealtimeListeners() {
    const listConfig = [
      { path: 'tenants', localKey: 'its_tenants' },
      { path: 'vehicles', localKey: 'its_vehicles' },
      { path: 'drivers', localKey: 'its_drivers' },
      { path: 'bookings', localKey: 'its_bookings' },
      { path: 'routes', localKey: 'its_routes' },
      { path: 'promos', localKey: 'its_promos' },
      { path: 'locations', localKey: 'its_locations' },
      { path: 'reviews', localKey: 'its_reviews' }
    ];

    listConfig.forEach(({ path, localKey }) => {
      onSnapshot(collection(db, path), (snap) => {
        const items: any[] = [];
        snap.forEach(docSnap => {
          items.push(docSnap.data());
        });
        if (items.length > 0) {
          localStorage.setItem(localKey, JSON.stringify(items));
          // Dispatch events so components reload automatically
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('its-db-update', { detail: { path } }));
        }
      }, (err) => {
        console.warn(`Snapshot subscription blocked or offline for path ${path}:`, err.message);
      });
    });
  }

  static subscribe(callback: () => void): () => void {
    window.addEventListener('its-db-update', callback);
    window.addEventListener('storage', callback);
    return () => {
      window.removeEventListener('its-db-update', callback);
      window.removeEventListener('storage', callback);
    };
  }

  // --- QUERY APIS ---
  static getTenants(): Tenant[] {
    return JSON.parse(localStorage.getItem('its_tenants') || '[]');
  }

  static getTenantBySlug(slug: string): Tenant | undefined {
    return this.getTenants().find(t => t.slug === slug);
  }

  static saveTenant(tenant: Tenant): void {
    // Write locally for immediate rendering response
    const tenants = this.getTenants();
    const idx = tenants.findIndex(t => t.id === tenant.id);
    if (idx !== -1) {
      tenants[idx] = tenant;
    } else {
      tenants.push(tenant);
    }
    localStorage.setItem('its_tenants', JSON.stringify(tenants));

    // Upload to Firestore in the background
    setDoc(doc(db, 'tenants', tenant.id), tenant)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `tenants/${tenant.id}`));
  }

  static deleteTenant(id: string): void {
    const tenants = this.getTenants().filter(t => t.id !== id);
    localStorage.setItem('its_tenants', JSON.stringify(tenants));

    // Delete in background
    deleteDoc(doc(db, 'tenants', id))
      .catch((err) => handleFirestoreError(err, OperationType.DELETE, `tenants/${id}`));
  }

  // Vehicles
  static getVehicles(tenantId?: string): Vehicle[] {
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

    setDoc(doc(db, 'vehicles', vehicle.id), vehicle)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `vehicles/${vehicle.id}`));
  }

  static deleteVehicle(id: string): void {
    const all = this.getVehicles().filter(v => v.id !== id);
    localStorage.setItem('its_vehicles', JSON.stringify(all));

    deleteDoc(doc(db, 'vehicles', id))
      .catch((err) => handleFirestoreError(err, OperationType.DELETE, `vehicles/${id}`));
  }

  // Drivers
  static getDrivers(tenantId?: string): Driver[] {
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

    setDoc(doc(db, 'drivers', driver.id), driver)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `drivers/${driver.id}`));
  }

  static deleteDriver(id: string): void {
    const all = this.getDrivers().filter(d => d.id !== id);
    localStorage.setItem('its_drivers', JSON.stringify(all));

    deleteDoc(doc(db, 'drivers', id))
      .catch((err) => handleFirestoreError(err, OperationType.DELETE, `drivers/${id}`));
  }

  // Bookings
  static getBookings(tenantId?: string): TenantBooking[] {
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

    setDoc(doc(db, 'bookings', booking.id), booking)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `bookings/${booking.id}`));
  }

  // Routes
  static getRoutes(tenantId?: string): Route[] {
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

    setDoc(doc(db, 'routes', route.id), route)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `routes/${route.id}`));
  }

  static deleteRoute(id: string): void {
    const all = this.getRoutes().filter(r => r.id !== id);
    localStorage.setItem('its_routes', JSON.stringify(all));

    deleteDoc(doc(db, 'routes', id))
      .catch((err) => handleFirestoreError(err, OperationType.DELETE, `routes/${id}`));
  }

  // Promo Codes
  static getPromos(tenantId?: string): PromoCode[] {
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

    setDoc(doc(db, 'promos', promo.id), promo)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `promos/${promo.id}`));
  }

  static deletePromo(id: string): void {
    const all = this.getPromos().filter(p => p.id !== id);
    localStorage.setItem('its_promos', JSON.stringify(all));

    deleteDoc(doc(db, 'promos', id))
      .catch((err) => handleFirestoreError(err, OperationType.DELETE, `promos/${id}`));
  }

  // Locations (Driver GPS Simulators)
  static getLocations(): DriverLocation[] {
    return JSON.parse(localStorage.getItem('its_locations') || '[]');
  }

  static getDriverLocation(driverId: string): DriverLocation | undefined {
    return this.getLocations().find(l => l.driver_id === driverId);
  }

  static updateDriverLocation(driverId: string, lat: number, lng: number, is_active = true) {
    const all = this.getLocations();
    const idx = all.findIndex(l => l.driver_id === driverId);
    let item: DriverLocation;
    if (idx !== -1) {
      all[idx] = { ...all[idx], lat, lng, is_active, updated_at: new Date().toISOString() };
      item = all[idx];
    } else {
      item = { id: driverId, driver_id: driverId, lat, lng, is_active, updated_at: new Date().toISOString() };
      all.push(item);
    }
    localStorage.setItem('its_locations', JSON.stringify(all));

    setDoc(doc(db, 'locations', driverId), item)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `locations/${driverId}`));
  }

  // Reviews
  static getReviews(tenantId?: string): Review[] {
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

    setDoc(doc(db, 'reviews', review.id), review)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`));
  }
}
