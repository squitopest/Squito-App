import { useEffect, useRef } from "react";

interface UsePlacesOptions {
  onSelect: (address: string, coords: { lat: number; lng: number } | null) => void;
}

interface GoogleMapsLocation {
  lat: () => number;
  lng: () => number;
}

interface GoogleMapsPlaceResult {
  formatted_address?: string;
  geometry?: {
    location?: GoogleMapsLocation;
  };
}

interface GoogleMapsAutocomplete {
  addListener: (eventName: string, handler: () => void) => void;
  getPlace: () => GoogleMapsPlaceResult;
}

interface GoogleMapsPlacesNamespace {
  Autocomplete: new (
    input: HTMLInputElement,
    options: {
      componentRestrictions: { country: string };
      fields: string[];
      bounds: unknown;
      strictBounds: boolean;
    },
  ) => GoogleMapsAutocomplete;
}

interface GoogleMapsNamespace {
  places?: GoogleMapsPlacesNamespace;
  LatLngBounds: new (
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ) => unknown;
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace;
    };
    __googleMapsLoaded?: boolean;
  }
}

/**
 * Loads Google Maps Places Autocomplete on the returned inputRef.
 * Biased toward Long Island, NY. Falls back gracefully if no API key is set.
 */
export function usePlacesAutocomplete({ onSelect }: UsePlacesOptions) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const GMAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!GMAP_KEY) return; // graceful fallback — input still works manually

    function attachAutocomplete() {
      const maps = window.google?.maps;
      if (!inputRef.current || !maps?.places) return;

      const autocomplete = new maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: "us" },
          fields: ["formatted_address", "geometry"],
          // Bias results toward Long Island
          bounds: new maps.LatLngBounds(
            { lat: 40.5, lng: -73.9 }, // SW — Nassau/Brooklyn border
            { lat: 41.1, lng: -71.8 }  // NE — Montauk
          ),
          strictBounds: false,
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.formatted_address) return;
        const coords = place.geometry?.location
          ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          : null;
        onSelect(place.formatted_address, coords);
      });
    }

    // Script already loaded
    if (window.__googleMapsLoaded) {
      attachAutocomplete();
      return;
    }

    // Prevent duplicate script tags
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      // Script is loading — poll until ready
      const interval = setInterval(() => {
        if (window.__googleMapsLoaded) {
          clearInterval(interval);
          attachAutocomplete();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAP_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.__googleMapsLoaded = true;
      attachAutocomplete();
    };
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return inputRef;
}
