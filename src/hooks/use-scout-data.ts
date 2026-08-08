/**
 * NEXA Scout Data Hook - Real-time Business & Housing Discovery
 * Connects frontend to the agentic scouting system backend
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGeolocation } from './use-geolocation';

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  images: string[];
  rating: number;
  review_count: number;
  price_level: number;
  is_verified: boolean;
  trust_score: number;
  response_time_minutes?: number;
  tags: string[];
  opening_hours?: any;
  amenities: string[];
  distance_km?: number;
}

export interface HousingListing {
  id: string;
  title: string;
  images: string[];
  price: number;
  rating: number;
  reviewCount: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  host: string;
  hostImage?: string;
  superhost: boolean;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: any[];
  description: string;
  instantBook: boolean;
  coordinates?: { top: string; left: string };
  distance_km?: number;
}

export interface ScoutResult {
  businesses: Business[];
  housingListings: HousingListing[];
  metadata: {
    scannedArea: { centerLat: number; centerLng: number; radiusKm: number };
    timestamp: string;
    totalRecordsFound: number;
    agentsUsed: string[];
    scanDurationMs: number;
  };
}

export interface AgentStatus {
  name: string;
  status: 'idle' | 'scanning' | 'completed' | 'error';
  lastScan?: string;
  recordsFound?: number;
}

const API_BASE = '/api/scout';

// API functions
async function triggerScan(lat: number, lng: number, radiusKm: number = 5): Promise<ScoutResult> {
  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, radiusKm }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Scan failed' }));
    throw new Error(error.error || 'Failed to trigger scan');
  }
  
  return response.json();
}

async function getBusinesses(lat: number, lng: number, radiusKm: number = 5): Promise<Business[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
  });
  
  const response = await fetch(`${API_BASE}/businesses?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch businesses');
  }
  
  return response.json();
}

async function getHousing(lat: number, lng: number, radiusKm: number = 5): Promise<HousingListing[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
  });
  
  const response = await fetch(`${API_BASE}/housing?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch housing');
  }
  
  return response.json();
}

async function getAgentStatus(): Promise<AgentStatus[]> {
  const response = await fetch(`${API_BASE}/agents`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch agent status');
  }
  
  return response.json();
}

// Main hook
export function useScoutData(options?: {
  autoScan?: boolean;
  radiusKm?: number;
  enabled?: boolean;
}) {
  const { autoScan = true, radiusKm = 5, enabled = true } = options || {};
  const queryClient = useQueryClient();
  const geolocation = useGeolocation();
  
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Use manual location or geolocation
  const location = manualLocation || {
    lat: geolocation.latitude || 40.6782, // Default to Brooklyn
    lng: geolocation.longitude || -73.9442,
  };
  
  const hasValidLocation = !!(geolocation.latitude || manualLocation);
  
  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) =>
      triggerScan(lat, lng, radius),
    onSuccess: () => {
      // Invalidate queries after scan
      queryClient.invalidateQueries({ queryKey: ['scout-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['scout-housing'] });
    },
  });
  
  // Fetch businesses
  const businessesQuery = useQuery({
    queryKey: ['scout-businesses', location.lat, location.lng, radiusKm],
    queryFn: () => getBusinesses(location.lat!, location.lng!, radiusKm),
    enabled: enabled && hasValidLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
  
  // Fetch housing
  const housingQuery = useQuery({
    queryKey: ['scout-housing', location.lat, location.lng, radiusKm],
    queryFn: () => getHousing(location.lat!, location.lng!, radiusKm),
    enabled: enabled && hasValidLocation,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
  
  // Agent status
  const agentsQuery = useQuery({
    queryKey: ['scout-agents'],
    queryFn: getAgentStatus,
    enabled: enabled,
    refetchInterval: 10000, // Update every 10 seconds
  });
  
  // Auto-scan on location change
  useEffect(() => {
    if (autoScan && hasValidLocation && enabled) {
      scanMutation.mutate({ lat: location.lat!, lng: location.lng!, radius: radiusKm });
    }
  }, [location.lat, location.lng]);
  
  const triggerManualScan = useCallback((lat?: number, lng?: number, radius?: number) => {
    const targetLat = lat ?? location.lat!;
    const targetLng = lng ?? location.lng!;
    const targetRadius = radius ?? radiusKm;
    return scanMutation.mutateAsync({ lat: targetLat, lng: targetLng, radius: targetRadius });
  }, [location, radiusKm, scanMutation]);
  
  const setCustomLocation = useCallback((lat: number, lng: number) => {
    setManualLocation({ lat, lng });
  }, []);
  
  const resetToCurrentLocation = useCallback(() => {
    setManualLocation(null);
  }, []);
  
  return {
    // Data
    businesses: businessesQuery.data || [],
    housing: housingQuery.data || [],
    agents: agentsQuery.data || [],
    
    // Location
    location: { lat: location.lat, lng: location.lng },
    geolocation,
    hasValidLocation,
    setCustomLocation,
    resetToCurrentLocation,
    
    // Actions
    triggerScan: triggerManualScan,
    
    // Loading states
    isLoading: businessesQuery.isLoading || housingQuery.isLoading,
    isScanning: scanMutation.isPending,
    isFetching: businessesQuery.isFetching || housingQuery.isFetching,
    
    // Error states
    error: businessesQuery.error || housingQuery.error || scanMutation.error,
    
    // Query metadata
    hasBusinesses: businessesQuery.isSuccess && businessesQuery.data.length > 0,
    hasHousing: housingQuery.isSuccess && housingQuery.data.length > 0,
    refetch: businessesQuery.refetch,
  };
}

// Hook for nearby businesses only
export function useNearbyBusinesses(lat: number, lng: number, radiusKm: number = 5) {
  return useQuery({
    queryKey: ['nearby-businesses', lat, lng, radiusKm],
    queryFn: () => getBusinesses(lat, lng, radiusKm),
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for nearby housing only
export function useNearbyHousing(lat: number, lng: number, radiusKm: number = 5) {
  return useQuery({
    queryKey: ['nearby-housing', lat, lng, radiusKm],
    queryFn: () => getHousing(lat, lng, radiusKm),
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  });
}

// Utility to calculate distance between two points
export function getDistanceFromLocation(
  itemLat: number,
  itemLng: number,
  userLat: number,
  userLng: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((itemLat - userLat) * Math.PI) / 180;
  const dLon = ((itemLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((itemLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
