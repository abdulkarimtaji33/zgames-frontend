'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/lib/googleMaps';

export interface ParsedAddress {
  addressLine1: string;
  city: string;
  area: string;
  state: string;
  countryCode: string;
  zipCode: string;
  formatted: string;
  lat: number | null;
  lng: number | null;
}

interface GeocodedResult {
  address_components?: google.maps.GeocoderAddressComponent[];
  formatted_address?: string;
  geometry?: { location?: google.maps.LatLng };
  name?: string;
}

/** Shared by the Places Autocomplete result and the map pin's reverse-geocode result — both share this shape. */
export function parseAddressComponents(place: GeocodedResult): ParsedAddress {
  const get = (type: string, useShort = false) =>
    place.address_components?.find((c) => c.types.includes(type))?.[useShort ? 'short_name' : 'long_name'] ?? '';

  const streetNumber = get('street_number');
  const route = get('route');
  const addressLine1 = [streetNumber, route].filter(Boolean).join(' ') || place.name || '';

  return {
    addressLine1,
    city: get('locality') || get('postal_town') || get('administrative_area_level_2') || '',
    area: get('sublocality') || get('sublocality_level_1') || get('neighborhood') || '',
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
  const inputId = useId();
  const errorId = `${inputId}-error`;

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
      onPlaceSelected(parseAddressComponents(place));
    });
    autocompleteRef.current = ac;
  }, [mapsReady, onPlaceSelected]);

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        ref={inputRef}
        id={inputId}
        // Chrome ignores autocomplete="off" on address-shaped fields and shows its
        // own "powered by Google" address suggestions on top of the real Places
        // dropdown. A `name` it can't pattern-match against the field (randomized
        // per mount, nothing address-like) combined with autocomplete="off" is the
        // documented workaround — Chrome's heuristic keys heavily off `name`.
        name={`loc-${inputId}`}
        type="text"
        defaultValue={defaultValue}
        placeholder={configured ? placeholder : placeholder.replace('…', ' (manual entry)')}
        onChange={(e) => onTextChange?.(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded border border-border bg-background-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        role="presentation"
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
      {!configured && (
        <p className="mt-1 text-xs text-foreground-subtle">Address suggestions will appear here once Google Maps is configured.</p>
      )}
    </div>
  );
}
