import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Navigation2, MapPin, Clock } from "lucide-react";

function waitForGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google?.maps) return resolve();
    const iv = setInterval(() => {
      if (window.google?.maps) { clearInterval(iv); resolve(); }
    }, 200);
  });
}

export default function DriverLiveMap({ booking, driverId, isDriver = false }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const watchRef = useRef(null);

  const [locationShared, setLocationShared] = useState(false);
  const [driverPos, setDriverPos] = useState(null);
  const [eta, setEta] = useState(null);

  // Initialize Google Map
  useEffect(() => {
    let mounted = true;
    waitForGoogleMaps().then(() => {
      if (!mounted || !mapRef.current || googleMapRef.current) return;

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 51.5074, lng: -0.1278 },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        ],
      });

      // Pickup marker (green)
      if (booking?.pickup_address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: booking.pickup_address }, (results, status) => {
          if (status === "OK" && results[0] && mounted) {
            const pos = results[0].geometry.location;
            pickupMarkerRef.current = new window.google.maps.Marker({
              position: pos,
              map: googleMapRef.current,
              title: "Pickup",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#22c55e",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              },
            });

            new window.google.maps.InfoWindow({
              content: `<div style="font-size:12px;font-weight:600;color:#16a34a">📍 Pickup<br/><span style="font-weight:400;color:#555">${booking.pickup_address}</span></div>`,
            }).open(googleMapRef.current, pickupMarkerRef.current);

            if (!driverPos) {
              googleMapRef.current.setCenter(pos);
            }
          }
        });
      }

      // Dropoff marker (red)
      if (booking?.dropoff_address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: booking.dropoff_address }, (results, status) => {
          if (status === "OK" && results[0] && mounted) {
            dropoffMarkerRef.current = new window.google.maps.Marker({
              position: results[0].geometry.location,
              map: googleMapRef.current,
              title: "Dropoff",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              },
            });
          }
        });
      }
    });

    return () => { mounted = false; };
  }, []);

  // Poll driver location every 5 seconds (customer view)
  useEffect(() => {
    if (isDriver || !booking?.id) return;

    const poll = async () => {
      const locations = await base44.entities.DriverLocation.filter({
        booking_id: booking.id,
        is_active: true,
      });
      if (locations[0]) {
        const loc = locations[0];
        const pos = { lat: loc.lat, lng: loc.lng };
        setDriverPos(pos);
        updateDriverMarker(pos, loc.heading);
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [booking?.id, isDriver]);

  // Calculate ETA when driver position changes
  useEffect(() => {
    if (!driverPos || !booking?.pickup_address || !window.google?.maps) return;

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [driverPos],
        destinations: [booking.pickup_address],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const duration = response.rows[0]?.elements[0]?.duration;
          if (duration) setEta(duration.text);
        }
      }
    );
  }, [driverPos, booking?.pickup_address]);

  const updateDriverMarker = (pos, heading) => {
    if (!googleMapRef.current) return;
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: pos,
        map: googleMapRef.current,
        title: "Driver",
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="20" fill="#1d4ed8" stroke="white" stroke-width="3"/>
              <text x="22" y="28" text-anchor="middle" font-size="18">🚗</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 22),
        },
        zIndex: 999,
      });
    } else {
      driverMarkerRef.current.setPosition(pos);
    }
    googleMapRef.current.panTo(pos);
  };

  // Driver: share GPS location
  const shareLocation = () => {
    if (!navigator.geolocation || !driverId || !booking?.id) return;
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const data = {
          driver_id: driverId,
          booking_id: booking.id,
          tenant_slug: booking.tenant_slug,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading || 0,
          is_active: true,
        };
        const existing = await base44.entities.DriverLocation.filter({ driver_id: driverId, booking_id: booking.id });
        if (existing[0]) {
          await base44.entities.DriverLocation.update(existing[0].id, data);
        } else {
          await base44.entities.DriverLocation.create(data);
        }
        setLocationShared(true);
        updateDriverMarker({ lat: data.lat, lng: data.lng }, data.heading);
      },
      null,
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
  };

  const stopSharing = () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setLocationShared(false);
  };

  return (
    <div className="space-y-3">
      <div ref={mapRef} style={{ height: 320, borderRadius: 12, border: "1px solid hsl(var(--border))", overflow: "hidden" }} />

      {/* ETA + status for customer */}
      {!isDriver && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {booking?.status === "in_progress" ? "Driver is on the way to dropoff" : "Driver is approaching pickup"}
            </span>
          </div>
          {eta && (
            <div className="flex items-center gap-1.5 ml-auto text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded-lg px-3 py-1">
              <Clock className="w-3.5 h-3.5" />
              ETA: {eta}
            </div>
          )}
          {!driverPos && (
            <span className="ml-auto text-xs text-blue-500">Waiting for driver location...</span>
          )}
        </div>
      )}

      {/* Driver controls */}
      {isDriver && booking?.status === "in_progress" && (
        <button
          onClick={locationShared ? stopSharing : shareLocation}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            locationShared
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Navigation2 className="w-4 h-4" />
          {locationShared ? "📡 Location Sharing Active — Tap to Stop" : "Share Live Location with Passenger"}
        </button>
      )}
    </div>
  );
}