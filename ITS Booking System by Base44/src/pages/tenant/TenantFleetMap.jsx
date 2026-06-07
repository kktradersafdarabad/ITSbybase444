import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, Navigation, Car, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  available: "#10b981",
  on_trip: "#3b82f6",
  offline: "#6b7280",
  suspended: "#ef4444",
};

const STATUS_LABELS = {
  available: "Available",
  on_trip: "On Trip",
  offline: "Offline",
  suspended: "Suspended",
};

function waitForGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google?.maps) return resolve();
    const iv = setInterval(() => { if (window.google?.maps) { clearInterval(iv); resolve(); } }, 200);
  });
}

function GoogleFleetMap({ locations, drivers, onTripBookings, selectedDriver, onSelectDriver }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    waitForGoogleMaps().then(() => {
      if (!mounted || !mapRef.current) return;
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 11,
          center: { lat: 51.5074, lng: -0.1278 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          ],
        });
        infoWindowRef.current = new window.google.maps.InfoWindow();
      }
    });
    return () => { mounted = false; };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps) return;

    const currentIds = new Set(locations.map(l => l.driver_id));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    const bounds = new window.google.maps.LatLngBounds();

    locations.forEach(loc => {
      const driver = drivers.find(d => d.id === loc.driver_id);
      const status = driver?.status || "offline";
      const color = STATUS_COLORS[status] || "#6b7280";
      const tripBooking = onTripBookings.find(b => b.driver_id === loc.driver_id);
      const position = { lat: loc.lat, lng: loc.lng };

      bounds.extend(position);

      const svgIcon = {
        url: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><circle cx='18' cy='18' r='16' fill='${encodeURIComponent(color)}' stroke='white' stroke-width='3'/><text x='18' y='23' text-anchor='middle' font-size='14' fill='white'>🚗</text></svg>`,
        scaledSize: new window.google.maps.Size(36, 36),
        anchor: new window.google.maps.Point(18, 18),
      };

      if (markersRef.current[loc.driver_id]) {
        markersRef.current[loc.driver_id].setPosition(position);
        markersRef.current[loc.driver_id].setIcon(svgIcon);
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          icon: svgIcon,
          title: driver?.full_name || "Driver",
        });

        marker.addListener("click", () => {
          const content = `
            <div style="font-family:sans-serif;min-width:160px;padding:4px">
              <strong style="font-size:14px">${driver?.full_name || "Driver"}</strong>
              <div style="color:${color};font-size:12px;margin-top:4px">● ${STATUS_LABELS[status] || status}</div>
              ${tripBooking ? `
                <div style="margin-top:8px;font-size:12px;background:#eff6ff;padding:6px;border-radius:6px">
                  <div style="color:#1d4ed8;font-weight:600">📍 ${tripBooking.pickup_address || ""}</div>
                  ${tripBooking.dropoff_address ? `<div style="color:#7c3aed">→ ${tripBooking.dropoff_address}</div>` : ""}
                  <div style="color:#888;margin-top:4px">Passenger: ${tripBooking.passenger_name || ""}</div>
                </div>
              ` : ""}
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(googleMapRef.current, marker);
          onSelectDriver(driver || loc);
        });

        markersRef.current[loc.driver_id] = marker;
      }
    });

    if (locations.length > 0) {
      googleMapRef.current.fitBounds(bounds, { padding: 80 });
    }
  }, [locations, drivers, onTripBookings]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 400 }} />;
}

export default function TenantFleetMap() {
  const { tenant, slug } = useOutletContext();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers-map", tenant?.id],
    queryFn: () => base44.entities.Driver.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
    refetchInterval: 15000,
  });

  const { data: locations = [], refetch: refetchLocations } = useQuery({
    queryKey: ["driver-locations-map", slug],
    queryFn: () => base44.entities.DriverLocation.filter({ tenant_slug: slug, is_active: true }),
    enabled: !!slug,
    refetchInterval: 10000,
  });

  const { data: activeBookings = [] } = useQuery({
    queryKey: ["active-bookings-map", tenant?.id],
    queryFn: () => base44.entities.TenantBooking.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
    refetchInterval: 15000,
  });

  const onTripBookings = activeBookings.filter(b => b.status === "in_progress");

  const handleRefresh = () => {
    refetchLocations();
    setLastRefresh(new Date());
  };

  return (
    <div className="h-full flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> Live Fleet Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {locations.length} driver{locations.length !== 1 ? "s" : ""} broadcasting location · Auto-refreshes every 10s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last: {lastRefresh.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-border/50 bg-card overflow-y-auto hidden lg:flex flex-col">
          {/* Status Summary */}
          <div className="p-4 border-b border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fleet Status</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => {
                const count = drivers.filter(d => d.status === status).length;
                return (
                  <div key={status} className="bg-muted/50 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</span>
                    </div>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver List */}
          <div className="flex-1 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">All Drivers</p>
            {drivers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No drivers added yet.</p>
            )}
            {drivers.map(driver => {
              const hasLocation = locations.find(l => l.driver_id === driver.id);
              const tripBooking = onTripBookings.find(b => b.driver_id === driver.id);
              const isSelected = selectedDriver?.id === driver.id;
              return (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(isSelected ? null : driver)}
                  className={cn(
                    "w-full text-left rounded-xl p-3 transition-all border",
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "border-transparent hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: STATUS_COLORS[driver.status] || "#6b7280" }}>
                      {driver.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{driver.full_name}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[driver.status] }} />
                        <span className="text-xs text-muted-foreground">{STATUS_LABELS[driver.status] || driver.status}</span>
                        {hasLocation && <MapPin className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  {tripBooking && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-xs">
                      <p className="font-medium text-blue-700 dark:text-blue-300 truncate">📍 {tripBooking.pickup_address}</p>
                      <p className="text-blue-600 dark:text-blue-400 truncate">→ {tripBooking.dropoff_address}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Map */}
        <div className="flex-1 relative">
          <GoogleFleetMap
            locations={locations}
            drivers={drivers}
            onTripBookings={onTripBookings}
            selectedDriver={selectedDriver}
            onSelectDriver={setSelectedDriver}
          />

          {locations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-card/95 rounded-2xl border border-border shadow-lg p-6 text-center max-w-xs">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No Active Drivers</p>
                <p className="text-sm text-muted-foreground mt-1">Driver locations appear here when they start sharing GPS from the driver app.</p>
              </div>
            </div>
          )}

          {/* Active Trips Overlay */}
          {onTripBookings.length > 0 && (
            <div className="absolute top-4 right-4 z-10 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 max-w-[220px]">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Trips ({onTripBookings.length})</p>
              <div className="space-y-1.5">
                {onTripBookings.slice(0, 4).map(b => (
                  <div key={b.id} className="text-xs">
                    <p className="font-medium truncate">{b.passenger_name}</p>
                    <p className="text-muted-foreground truncate">{b.driver_name || "Unassigned"}</p>
                  </div>
                ))}
                {onTripBookings.length > 4 && (
                  <p className="text-xs text-muted-foreground">+{onTripBookings.length - 4} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}