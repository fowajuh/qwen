/**
 * NEXA Geolocation Hook - Production Ready
 * Provides real-time location tracking with fallbacks
 */

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt';
}

export interface GeolocationOptions extends PositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes cache
};

export function useGeolocation(options: GeolocationOptions = defaultOptions) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: true,
    permission: 'prompt',
  });

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!('permissions' in navigator)) {
      return 'prompt' as const;
    }
    
    try {
      const result = await (navigator.permissions as any).query({ name: 'geolocation' });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt' as const;
    }
  }, []);

  // Get location once
  const getCurrentLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!('geolocation' in navigator)) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            error: null,
            loading: false,
            permission: 'granted',
          });
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            permission: 'denied',
          }));
        },
        options
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, [options]);

  // Watch position continuously
  useEffect(() => {
    let watchId: number | undefined;

    const startWatching = async () => {
      const permission = await checkPermission();
      
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'denied') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Location permission denied',
        }));
        return;
      }

      if (!('geolocation' in navigator)) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Geolocation is not supported',
        }));
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            error: null,
            loading: false,
            permission: 'granted',
          });
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        },
        options
      );
    };

    startWatching();

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [checkPermission, options]);

  return {
    ...state,
    getCurrentLocation,
    checkPermission,
  };
}

// Utility functions
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<{ city: string; state: string; country: string; address: string }> {
  // Use OpenStreetMap Nominatim (free, no API key needed for low usage)
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NexaApp/1.0',
      },
    });
    
    if (!response.ok) throw new Error('Reverse geocoding failed');
    
    const data = await response.json();
    
    return {
      city: data.address.city || data.address.town || data.address.village || 'Unknown',
      state: data.address.state || data.address.region || '',
      country: data.address.country || 'Unknown',
      address: data.display_name || '',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: 'Unknown',
      state: '',
      country: 'Unknown',
      address: '',
    };
  }
}