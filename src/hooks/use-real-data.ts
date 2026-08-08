/**
 * NEXA Custom Hooks - Real Data Integration
 * Replace all mock data with actual backend API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { api, Business, HousingListing, ContentItem, Conversation, Message, Contact } from './api';
import { useGeolocation } from './use-geolocation';

// ============ SCOUT HOOKS ============

export function useScoutData(options?: {
  autoScan?: boolean;
  radiusKm?: number;
  enabled?: boolean;
}) {
  const { autoScan = false, radiusKm = 5, enabled = true } = options || {};
  const geolocation = useGeolocation();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [housing, setHousing] = useState<HousingListing[]>([]);
  const [agents, setAgents] = useState<{ name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  const scan = useCallback(async () => {
    if (!enabled || !geolocation.latitude || !geolocation.longitude) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.scanArea(geolocation.latitude, geolocation.longitude, radiusKm);
      
      if (result.success) {
        setBusinesses(result.businesses || []);
        setHousing(result.housing || []);
        setScanned(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }, [enabled, geolocation.latitude, geolocation.longitude, radiusKm]);

  const fetchBusinesses = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) return;
    
    try {
      const data = await api.getNearbyBusinesses(geolocation.latitude, geolocation.longitude, radiusKm);
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses');
    }
  }, [geolocation.latitude, geolocation.longitude, radiusKm]);

  const fetchHousing = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) return;
    
    try {
      const data = await api.getNearbyHousing(geolocation.latitude, geolocation.longitude, radiusKm);
      setHousing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load housing');
    }
  }, [geolocation.latitude, geolocation.longitude, radiusKm]);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await api.getScoutAgents();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  }, []);

  useEffect(() => {
    if (autoScan && enabled) {
      scan();
    } else if (enabled) {
      fetchBusinesses();
      fetchHousing();
    }
    fetchAgents();
  }, [autoScan, enabled, scan, fetchBusinesses, fetchHousing, fetchAgents]);

  return {
    businesses,
    housing,
    agents,
    loading,
    error,
    scanned,
    hasLocation: !!geolocation.latitude && !!geolocation.longitude,
    latitude: geolocation.latitude,
    longitude: geolocation.longitude,
    scan,
    refetch: () => {
      fetchBusinesses();
      fetchHousing();
    },
  };
}

// ============ FEED HOOK ============

export function useFeed(limit: number = 20) {
  const geolocation = useGeolocation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.getFeed(geolocation.latitude, geolocation.longitude, limit);
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [geolocation.latitude, geolocation.longitude, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Local interaction state (persisted to localStorage)
  const [liked, setLiked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nexa-liked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [saved, setSaved] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nexa-saved');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleLike = useCallback((id: string) => {
    setLiked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('nexa-liked', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('nexa-saved', JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    content,
    loading,
    error,
    hasLocation: !!geolocation.latitude && !!geolocation.longitude,
    liked,
    saved,
    toggleLike,
    toggleSave,
    refresh,
  };
}

// ============ MESSAGES HOOKS ============

export function useContacts() {
  const geolocation = useGeolocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.getContacts(geolocation.latitude, geolocation.longitude, 5);
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [geolocation.latitude, geolocation.longitude]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contacts, loading, error, hasLocation: !!geolocation.latitude, refresh };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { conversations, loading, error, refresh };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!conversationId) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const send = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return null;

    try {
      const message = await api.sendMessage(conversationId, content);
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      return null;
    }
  }, [conversationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { messages, loading, error, send, refresh };
}

export function useStartConversation() {
  const [starting, setStarting] = useState(false);

  const start = useCallback(async (businessId: string) => {
    setStarting(true);
    try {
      const result = await api.startConversation(businessId);
      return result.conversation_id;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      throw err;
    } finally {
      setStarting(false);
    }
  }, []);

  return { start, starting };
}

// ============ HOUSING HOOKS ============

export function useHousingListings(filters?: {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
  type?: string;
}) {
  const geolocation = useGeolocation();
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.getHousingListings({
        location: { lat: geolocation.latitude, lng: geolocation.longitude },
        ...filters,
      });
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [geolocation.latitude, geolocation.longitude, filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { listings, loading, error, hasLocation: !!geolocation.latitude, refresh };
}

export function useHousingListing(id: string) {
  const [listing, setListing] = useState<HousingListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.getHousingListing(id);
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, loading, error };
}
