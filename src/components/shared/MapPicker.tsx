'use client';

import { useEffect, useRef, useState } from 'react';
import { Crosshair, MapPin as MapPinIcon } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/lib/googleMaps';
import { parseAddressComponents } from './AddressAutocomplete';

export interface MapPickedLocation {
  lat: number;
  lng: number;
  addressLine1: string;
  city: string;
  area: string;
}

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onLocationChange: (loc: MapPickedLocation) => void;
}

const DEFAULT_CENTER = { lat: 25.2048, lng: 55.2708 }; // Dubai

/**
 * Draggable-pin map used to pinpoint an exact delivery spot. Dragging the
 * pin or tapping the map reverse-geocodes the new position back into the
 * address fields; "Use my current location" does the same from the
 * browser's geolocation API. Renders nothing when Maps isn't configured —
 * same fallback pattern as AddressAutocomplete.
 */
export function MapPicker({ lat, lng, onLocationChange }: MapPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  // Tracks the last position *we* pushed (drag/click/geolocate) so the
  // external lat/lng-sync effect doesn't fight our own update mid-flight.
  const lastAppliedRef = useRef<{ lat: number; lng: number } | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const configured = isGoogleMapsConfigured();

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    loadGoogleMaps().then((ok) => {
      if (!cancelled && ok) setMapsReady(true);
    });
    return () => { cancelled = true; };
  }, [configured]);

  const reverseGeocode = (position: google.maps.LatLng, onDone?: () => void) => {
    if (!geocoderRef.current) geocoderRef.current = new window.google!.maps.Geocoder();
    geocoderRef.current.geocode({ location: position }, (results, status) => {
      const result = status === 'OK' ? results?.[0] : null;
      const parsed = result ? parseAddressComponents(result) : null;
      onLocationChange({
        lat: position.lat(),
        lng: position.lng(),
        addressLine1: parsed?.addressLine1 ?? '',
        city: parsed?.city ?? '',
        area: parsed?.area ?? '',
      });
      onDone?.();
    });
  };

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;
    const center = lat != null && lng != null ? { lat, lng } : DEFAULT_CENTER;
    const map = new window.google!.maps.Map(mapDivRef.current, {
      center,
      zoom: lat != null ? 16 : 11,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });
    const marker = new window.google!.maps.Marker({ position: center, map, draggable: true });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (!pos) return;
      lastAppliedRef.current = { lat: pos.lat(), lng: pos.lng() };
      reverseGeocode(pos);
    });
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      marker.setPosition(e.latLng);
      lastAppliedRef.current = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      reverseGeocode(e.latLng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  // Re-center/move the pin when lat/lng change from outside (e.g. the
  // address-line autocomplete resolved a place) — unless it's an echo of
  // a position we ourselves just applied.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat == null || lng == null) return;
    if (lastAppliedRef.current && lastAppliedRef.current.lat === lat && lastAppliedRef.current.lng === lng) return;
    const pos = { lat, lng };
    mapRef.current.setCenter(pos);
    mapRef.current.setZoom(16);
    markerRef.current.setPosition(pos);
  }, [lat, lng]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Location is not supported on this device.');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latLng = new window.google!.maps.LatLng(latitude, longitude);
        lastAppliedRef.current = { lat: latitude, lng: longitude };
        if (mapRef.current && markerRef.current) {
          mapRef.current.setCenter(latLng);
          mapRef.current.setZoom(16);
          markerRef.current.setPosition(latLng);
        }
        reverseGeocode(latLng, () => setLocating(false));
      },
      () => {
        setLocateError("Couldn't get your location — please place the pin manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!configured) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
        <label className="block text-sm font-medium text-foreground">Pin your location on the map</label>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={!mapsReady || locating}
          className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-action)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Crosshair className="h-3.5 w-3.5" /> {locating ? 'Locating…' : 'Use my current location'}
        </button>
      </div>
      <div ref={mapDivRef} className="w-full h-56 rounded-md border border-border overflow-hidden bg-background-secondary" />
      {!mapsReady && <p className="mt-1 text-xs text-foreground-subtle">Loading map…</p>}
      {locateError && <p className="mt-1 text-xs text-error">{locateError}</p>}
      <p className="mt-1.5 text-xs text-foreground-subtle flex items-center gap-1">
        <MapPinIcon className="h-3 w-3 shrink-0" /> Drag the pin or tap the map to set your exact delivery spot.
      </p>
    </div>
  );
}
