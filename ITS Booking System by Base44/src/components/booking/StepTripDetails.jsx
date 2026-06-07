import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MapPin, Calendar, Clock, ArrowRight, Loader2, Navigation, Plus, X,
  RefreshCw, Plane, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";
import { cn } from "@/lib/utils";

const ALL_BOOKING_TYPES = [
  { value: "distance", label: "🚗 Standard", desc: "Metered by distance & time", icon: "🚗" },
  { value: "hourly", label: "⏱ Hourly", desc: "As directed by the hour", icon: "⏱" },
  { value: "flat_rate", label: "📋 Fixed Price", desc: "Pre-agreed flat rate", icon: "📋" },
  { value: "on_demand", label: "⚡ On Demand", desc: "Driver quotes on arrival", icon: "⚡" },
];

function waitForGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google?.maps) return resolve();
    const iv = setInterval(() => { if (window.google?.maps) { clearInterval(iv); resolve(); } }, 200);
  });
}

function RouteMapPreview({ pickup, stops = [], dropoff, onRouteCalculated, countryCode }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const rendererRef = useRef(null);
  const [calculating, setCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const allPoints = [pickup, ...stops.filter(Boolean), dropoff].filter(Boolean);

  useEffect(() => {
    if (allPoints.length < 2) return;
    let mounted = true;
    setCalculating(true);

    waitForGoogleMaps().then(() => {
      if (!mounted || !mapRef.current) return;

      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 11,
          center: { lat: 51.5074, lng: -0.1278 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
        });
        rendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: { strokeColor: "#1d4ed8", strokeWeight: 5, strokeOpacity: 0.9 },
        });
        rendererRef.current.setMap(googleMapRef.current);
      }

      const waypoints = stops.filter(Boolean).map(s => ({ location: s, stopover: true }));
      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: pickup,
          destination: dropoff,
          waypoints,
          optimizeWaypoints: false,
          travelMode: window.google.maps.TravelMode.DRIVING,
          region: countryCode?.toLowerCase(),
        },
        (result, status) => {
          if (!mounted) return;
          setCalculating(false);
          if (status === "OK") {
            rendererRef.current.setDirections(result);
            // Sum all legs for distance + duration
            const legs = result.routes[0].legs;
            const totalDist = legs.reduce((s, l) => s + l.distance.value, 0);
            const totalDur = legs.reduce((s, l) => s + l.duration.value, 0);
            const distKm = parseFloat((totalDist / 1000).toFixed(1));
            const durMin = Math.ceil(totalDur / 60);
            setRouteInfo({ distKm, durMin, distText: `${distKm} km`, durText: `${durMin} min` });
            if (onRouteCalculated) onRouteCalculated({ distKm, durMin });
          }
        }
      );
    });

    return () => { mounted = false; };
  }, [pickup, dropoff, stops.join(",")]);

  if (allPoints.length < 2) return null;

  return (
    <div className="space-y-2">
      <div ref={mapRef} style={{ height: 260, borderRadius: 12, border: "1px solid hsl(var(--border))", overflow: "hidden" }} />
      {calculating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating route...
        </div>
      )}
      {routeInfo && !calculating && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-2.5 text-sm">
          <Navigation className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-blue-700 dark:text-blue-300">{routeInfo.distText}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{routeInfo.durText} drive</span>
        </div>
      )}
    </div>
  );
}

export default function StepTripDetails({ data, onChange, routes, onNext, enabledBookingTypes, primaryColor, countryCode }) {
  const update = (k, v) => onChange(prev => ({ ...prev, [k]: v }));

  const visibleTypes = enabledBookingTypes
    ? ALL_BOOKING_TYPES.filter(t => enabledBookingTypes.includes(t.value))
    : ALL_BOOKING_TYPES;

  const activeType = data.booking_type || visibleTypes[0]?.value || "distance";
  const [stops, setStops] = useState(() => {
    if (!data.via_stops) return [];
    return typeof data.via_stops === "string" ? JSON.parse(data.via_stops) : data.via_stops;
  });

  const returnTrip = data.return_trip || false;

  const addStop = () => setStops(prev => [...prev, ""]);
  const removeStop = (i) => setStops(prev => prev.filter((_, idx) => idx !== i));
  const updateStop = (i, v) => setStops(prev => prev.map((s, idx) => idx === i ? v : s));

  // Sync stops to data
  useEffect(() => {
    onChange(prev => ({ ...prev, via_stops: JSON.stringify(stops) }));
  }, [stops]);

  const isValid = data.pickup_address && data.pickup_date && data.pickup_time &&
    (activeType === "flat_rate" ? data.route_id :
     activeType === "on_demand" ? true :
     !!data.dropoff_address);

  const handleTypeChange = (val) => {
    onChange(prev => ({ ...prev, booking_type: val, route_id: undefined }));
  };

  const handleRouteCalculated = ({ distKm, durMin }) => {
    onChange(prev => ({ ...prev, estimated_distance_km: distKm, estimated_duration_min: durMin }));
  };

  const showMap = (activeType === "distance" || activeType === "hourly") && data.pickup_address && data.dropoff_address;

  // Today as min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">

      {/* Booking Type */}
      {visibleTypes.length > 1 && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">Service Type</Label>
          <div className={`grid gap-2 ${visibleTypes.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
            {visibleTypes.map(t => (
              <button
                key={t.value}
                onClick={() => handleTypeChange(t.value)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                  activeType === t.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <div className="text-base mb-0.5">{t.icon}</div>
                <div className="font-semibold text-xs">{t.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flat Rate — Route selector */}
      {activeType === "flat_rate" && (
        <div>
          <Label>Select Route</Label>
          {routes.filter(r => r.is_active !== false).length === 0 ? (
            <div className="mt-2 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground text-center">
              No fixed routes available. Please select a different service type.
            </div>
          ) : (
            <Select value={data.route_id || ""} onValueChange={v => {
              const route = routes.find(r => r.id === v);
              if (route) {
                onChange(prev => ({ ...prev, booking_type: activeType, route_id: v, pickup_address: route.pickup_area, dropoff_address: route.dropoff_area, estimated_distance_km: route.distance_km }));
              }
            }}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a route" /></SelectTrigger>
              <SelectContent>
                {routes.filter(r => r.is_active !== false).map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} — {r.pickup_area} → {r.dropoff_area} · £{r.flat_rate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Pickup + Stops + Dropoff */}
      {activeType !== "flat_rate" && (
        <div className="space-y-3">
          {/* Pickup */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
            </div>
            <AddressAutocomplete
              key="pickup"
              value={data.pickup_address || ""}
              onChange={v => update("pickup_address", v)}
              placeholder="Pickup address or postcode"
              countryCode={countryCode}
              className="pl-8"
            />
          </div>

          {/* Via Stops */}
          <AnimatePresence>
            {stops.map((stop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow" />
                </div>
                <AddressAutocomplete
                  key={`stop-${i}`}
                  value={stop}
                  onChange={v => updateStop(i, v)}
                  placeholder={`Via stop ${i + 1}`}
                  countryCode={countryCode}
                  className="pl-8 pr-10"
                />
                <button
                  type="button"
                  onClick={() => removeStop(i)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Dropoff */}
          {activeType !== "on_demand" && (
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
              </div>
              <AddressAutocomplete
                key="dropoff"
                value={data.dropoff_address || ""}
                onChange={v => update("dropoff_address", v)}
                placeholder="Dropoff address or postcode"
                countryCode={countryCode}
                className="pl-8"
              />
            </div>
          )}

          {/* Add Stop button */}
          {activeType !== "on_demand" && stops.length < 4 && (
            <button
              type="button"
              onClick={addStop}
              className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1 py-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add a stop
            </button>
          )}
        </div>
      )}

      {/* Map Route Preview */}
      {showMap && (
        <RouteMapPreview
          pickup={data.pickup_address}
          stops={stops}
          dropoff={data.dropoff_address}
          onRouteCalculated={handleRouteCalculated}
          countryCode={countryCode}
        />
      )}

      {/* Hourly — hours */}
      {activeType === "hourly" && (
        <div>
          <Label>Number of Hours <span className="text-muted-foreground text-xs">(as directed)</span></Label>
          <div className="flex items-center gap-3 mt-1">
            <Button type="button" variant="outline" size="icon" onClick={() => update("hours_booked", Math.max(1, (data.hours_booked || 1) - 1))}>-</Button>
            <span className="text-2xl font-bold w-10 text-center">{data.hours_booked || 1}</span>
            <Button type="button" variant="outline" size="icon" onClick={() => update("hours_booked", Math.min(24, (data.hours_booked || 1) + 1))}>+</Button>
            <span className="text-sm text-muted-foreground">hours</span>
          </div>
        </div>
      )}

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5" /> Date
          </Label>
          <Input type="date" min={today} value={data.pickup_date || ""} onChange={e => update("pickup_date", e.target.value)} />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" /> Time
          </Label>
          <Input type="time" value={data.pickup_time || ""} onChange={e => update("pickup_time", e.target.value)} />
        </div>
      </div>

      {/* Return Trip Toggle */}
      {activeType === "distance" && data.dropoff_address && (
        <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/50">
          <div className="flex items-center gap-2.5">
            <RefreshCw className={cn("w-4 h-4", returnTrip ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className="text-sm font-medium">Return Trip</p>
              <p className="text-xs text-muted-foreground">Add a return journey (same route back)</p>
            </div>
          </div>
          <Switch checked={returnTrip} onCheckedChange={v => update("return_trip", v)} />
        </div>
      )}

      {/* Flight Number */}
      <div>
        <Label className="flex items-center gap-1.5 mb-1">
          <Plane className="w-3.5 h-3.5 text-muted-foreground" />
          Flight Number <span className="text-muted-foreground text-xs ml-1">(optional — for airport transfers)</span>
        </Label>
        <Input
          value={data.flight_number || ""}
          onChange={e => update("flight_number", e.target.value)}
          placeholder="e.g. BA245 or EK501"
        />
      </div>

      {/* Special Notes / Instructions */}
      <div>
        <Label className="flex items-center gap-1.5 mb-1">
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
          Special Instructions <span className="text-muted-foreground text-xs ml-1">(optional)</span>
        </Label>
        <Input
          value={data.notes || ""}
          onChange={e => update("notes", e.target.value)}
          placeholder="e.g. Meet at Terminal 2 arrivals, ring doorbell, etc."
        />
      </div>

      <Button
        onClick={() => { onChange(prev => ({ ...prev, booking_type: activeType })); onNext(); }}
        disabled={!isValid}
        className="w-full gap-2 h-12 text-base font-semibold"
        style={primaryColor ? { background: primaryColor, color: "#fff" } : {}}
      >
        Choose Vehicle <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}