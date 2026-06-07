import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Compass } from 'lucide-react';

interface AddressAutocompleteProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (address: string, estimatedDistanceKm?: number, estimatedDurationMin?: number) => void;
  countryCode?: string; // GB, PK, CH etc.
}

// Simulated local geocoded points per country code to make it look incredibly real and precise with coordinates!
const LOCAL_SITES_BY_COUNTRY: Record<string, { name: string; distOffset: number; durOffset: number }[]> = {
  GB: [
    { name: 'London Heathrow Airport Terminal 5 (LHR), Hounslow', distOffset: 25, durOffset: 45 },
    { name: 'London Gatwick Airport (LGW), Horley', distOffset: 48, durOffset: 60 },
    { name: 'Mayfair, Central London Hotel District', distOffset: 12, durOffset: 25 },
    { name: 'King\'s Cross St. Pancras Station, Euston Rd', distOffset: 8, durOffset: 15 },
    { name: 'Westminster Abbey & Big Ben Palace Corridor', distOffset: 4, durOffset: 10 },
    { name: 'The Ritz Hotel, Piccadilly, St. James\'s, London', distOffset: 3, durOffset: 8 },
    { name: 'Chelsea FC Stamford Bridge Stadium, Fulham Road', distOffset: 11, durOffset: 20 }
  ],
  PK: [
    { name: 'Sialkot Export Dry Port Complex, Sambrial', distOffset: 135, durOffset: 150 },
    { name: 'Allama Iqbal International Airport (LHE), Lahore', distOffset: 15, durOffset: 30 },
    { name: 'Port Qasim Terminal Sea Harbour, Karachi', distOffset: 38, durOffset: 55 },
    { name: 'Thokar Niaz Baig Dry Terminal, Lahore', distOffset: 20, durOffset: 35 },
    { name: 'Saddar Business Cantonment Bulwark, Karachi', distOffset: 10, durOffset: 25 },
    { name: 'Safdarabad Railway Station Crossing, Sheikhupura', distOffset: 65, durOffset: 90 },
    { name: 'Islamabad Blue Area Commercial Hub, Sector F-7', distOffset: 40, durOffset: 50 }
  ],
  CH: [
    { name: 'Zurich Airport International Terminal (ZRH)', distOffset: 12, durOffset: 18 },
    { name: 'Geneva Harbour Cointrin Airport (GVA)', distOffset: 35, durOffset: 40 },
    { name: 'Banhofstrasse High Fashion Avenue, Zurich', distOffset: 5, durOffset: 10 },
    { name: 'Davos Alpine Congress Center, Grisons', distOffset: 120, durOffset: 140 },
    { name: 'Zermatt Matterhorn Ski Chalet Lift Gate', distOffset: 160, durOffset: 210 }
  ]
};

export default function AddressAutocomplete({ id, label, placeholder, value, onChange, countryCode = 'GB' }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<{ name: string; distOffset: number; durOffset: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (val.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    // Filter relevant locations based on selected tenant's country code
    const database = LOCAL_SITES_BY_COUNTRY[countryCode.toUpperCase()] || LOCAL_SITES_BY_COUNTRY['GB'];
    const filtered = database.filter(site => 
      site.name.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const selectAddress = (name: string, dist: number, dur: number) => {
    setQuery(name);
    setIsOpen(false);
    // Suppress secondary cross contamination flag
    onChange(name, dist, dur);
  };

  const handleFocus = () => {
    const database = LOCAL_SITES_BY_COUNTRY[countryCode.toUpperCase()] || LOCAL_SITES_BY_COUNTRY['GB'];
    setSuggestions(database);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col space-y-1 w-full">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          id={id}
          type="text"
          placeholder={`${placeholder} (${countryCode} Only)`}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
          className="w-full bg-white border border-slate-200/90 hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 transition-all font-medium placeholder:text-slate-400 outline-hidden"
        />

        {query && (
          <button 
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              onChange('');
            }}
            className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 text-[10px] font-bold font-mono"
          >
            CLEAR
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[60px] bg-white border border-slate-100 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto divide-y divide-slate-50">
          {suggestions.map((site, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectAddress(site.name, site.distOffset, site.durOffset)}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-700 block">{site.name}</span>
                <span className="text-[9px] text-slate-400 font-mono inline-block mt-0.5">
                  SIMULATED DIRECTION: {site.distOffset}KM · ~{site.durOffset} MIN
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
