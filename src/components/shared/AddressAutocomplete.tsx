'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/lib/googleMaps';

export interface ParsedAddress {
  addressLine1: string;
  city: string;
  state: string;
  countryCode: string;
  zipCode: string;
  formatted: string;
  lat: number | null;
  lng: number | null;
}

function parsePlace(place: google.maps.places.PlaceResult): ParsedAddress {
  const get = (type: string, useShort = false) =>
    place.address_components?.find((c) => c.types.includes(type))?.[useShort ? 'short_name' : 'long_name'] ?? '';

  const streetNumber = get('street_number');
  const route = get('route');
  const addressLine1 = [streetNumber, route].filter(Boolean).join(' ') || place.name || '';

  return {
    addressLine1,
    city: get('locality') || get('postal_town') || get('sublocality') || '',
    state: get('administrative_area_level_1'),
    countryCode: get('country', true),
    zipCode: get('postal_code'),
    formatted: place.formatted_address ?? '',
    lat: place.geometry?.location?.lat() ?? null,
    lng: place.geometry?.location?.lng() ?? null,
  };
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onPlaceSelected: (address: ParsedAddress) => void;
  onTextChange?: (value: string) => void;
  error?: string;
}

export function AddressAutocomplete({
  label = 'Address',
  placeholder = 'Start typing your address…',
  defaultValue = '',
  onPlaceSelected,
  onTextChange,
  error,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const configured = isGoogleMapsConfigured();

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    loadGoogleMaps().then((ok) => {
      if (!cancelled && ok) setMapsReady(true);
    });
    return () => { cancelled = true; };
  }, [configured]);

  useEffect(() => {
    if (!mapsReady || !inputRef.current || autocompleteRef.current) return;
    const ac = new window.google!.maps.places.Autocomplete(inputRef.current, {
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place?.address_components) return;
      onPlaceSelected(parsePlace(place));
    });
    autocompleteRef.current = ac;
  }, [mapsReady, onPlaceSelected]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder={configured ? placeholder : placeholder.replace('…', ' (manual entry)')}
        onChange={(e) => onTextChange?.(e.target.value)}
        className="w-full rounded border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
        autoComplete="off"
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {!configured && (
        <p className="mt-1 text-xs text-foreground-subtle">Address suggestions will appear here once Google Maps is configured.</p>
      )}
    </div>
  );
}
