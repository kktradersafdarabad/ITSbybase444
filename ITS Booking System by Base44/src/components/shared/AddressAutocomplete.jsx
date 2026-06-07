import { useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

function waitForGooglePlaces() {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) return resolve();
    const iv = setInterval(() => {
      if (window.google?.maps?.places) { clearInterval(iv); resolve(); }
    }, 200);
  });
}

/**
 * AddressAutocomplete — completely isolated instances.
 * Each component owns its own DOM input and Autocomplete instance.
 * Uses refs for callbacks so the place_changed listener always has latest props.
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
  countryCode,
}) {
  const inputRef = useRef(null);
  const acRef = useRef(null);
  const suppressNextSync = useRef(false);

  // Always-fresh refs for callbacks — fixes stale closure bug where
  // dropoff selection used old onChange that had stale data (clearing pickup).
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect; }, [onPlaceSelect]);

  // Mount autocomplete ONCE — never re-runs (stable ref approach)
  useEffect(() => {
    let cancelled = false;

    waitForGooglePlaces().then(() => {
      if (cancelled || !inputRef.current || acRef.current) return;

      const options = {
        types: ["geocode", "establishment"],
        fields: ["formatted_address", "geometry", "name"],
      };
      if (countryCode) {
        options.componentRestrictions = { country: countryCode.toLowerCase() };
      }

      const ac = new window.google.maps.places.Autocomplete(inputRef.current, options);
      acRef.current = ac;

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        const address = place?.formatted_address || place?.name || inputRef.current?.value || "";

        // Prevent the value useEffect from overwriting the input
        suppressNextSync.current = true;

        // Always use latest onChange via ref — prevents stale closure
        onChangeRef.current(address);

        // Ensure DOM reflects the chosen address
        if (inputRef.current) inputRef.current.value = address;

        if (onPlaceSelectRef.current && place?.geometry?.location) {
          onPlaceSelectRef.current({
            address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }

        setTimeout(() => { suppressNextSync.current = false; }, 150);
      });
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — mount once

  // Sync DOM input when parent resets/clears the value
  useEffect(() => {
    if (!inputRef.current) return;
    if (suppressNextSync.current) return;
    const current = inputRef.current.value;
    const next = value || "";
    if (current !== next) {
      inputRef.current.value = next;
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder={placeholder || "Enter address"}
        defaultValue={value || ""}
        onChange={(e) => {
          if (!suppressNextSync.current) onChange(e.target.value);
        }}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-base shadow-sm transition-colors",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "md:text-sm"
        )}
      />
    </div>
  );
}