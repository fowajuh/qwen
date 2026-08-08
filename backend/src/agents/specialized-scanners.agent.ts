/**
 * Agents 5-10: Specialized Scanners (Compact Versions)
 */

import { BaseAgent, AgentConfig, BusinessData, ScoutingResult } from './base.agent.js';

// Agent 5: Healthcare Scanner
export class HealthcareScannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, name: 'HealthcareScannerAgent', rateLimitPerMinute: 100, retryAttempts: 3, timeoutMs: 10000 });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const errors: string[] = [];
    const types = ['hospital', 'doctor', 'dentist', 'pharmacy', 'physiotherapist', 'clinic'];

    for (const type of types) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${location.lat},${location.lng}`);
        url.searchParams.set('radius', String(location.radiusKm * 1000));
        url.searchParams.set('type', type);
        url.searchParams.set('key', this.config.apiKey || '');
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        for (const place of data.results || []) {
          businesses.push(await this.processPlace(place.place_id, type));
        }
      } catch (e) { errors.push(`Failed ${type}: ${(e as Error).message}`); }
    }

    return { success: true, businesses: businesses.filter(Boolean) as BusinessData[], housingListings: [], errors, metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: businesses.length }};
  }

  private async processPlace(placeId: string, type: string): Promise<BusinessData | null> {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', 'name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,photos,business_status');
      url.searchParams.set('key', this.config.apiKey || '');
      
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!data.result) return null;
      const r = data.result;

      return {
        id: `hlth_${placeId}`, name: r.name, slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: '', category: 'Healthcare', subcategory: type, google_place_id: placeId,
        address: r.formatted_address, city: r.formatted_address.split(',')[1] || '', country: 'Unknown',
        latitude: r.geometry.location.lat, longitude: r.geometry.location.lng,
        phone: r.formatted_phone_number || '', email: '', website: r.website || '',
        images: r.photos?.slice(0, 5).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
        rating: r.rating || 0, review_count: r.user_ratings_total || 0, price_level: 2 as const,
        is_verified: true, trust_score: 70, response_time_minutes: 30, tags: [type], opening_hours: undefined, amenities: []
      };
    } catch { return null; }
  }
}

// Agent 6: Education Scanner
export class EducationScannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, name: 'EducationScannerAgent', rateLimitPerMinute: 100, retryAttempts: 3, timeoutMs: 10000 });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const types = ['school', 'university', 'library', 'tutoring_service'];

    for (const type of types) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${location.lat},${location.lng}`);
        url.searchParams.set('radius', String(location.radiusKm * 2000));
        url.searchParams.set('type', type);
        url.searchParams.set('key', this.config.apiKey || '');
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        for (const place of data.results || []) {
          businesses.push(this.createEducationRecord(place, type));
        }
      } catch {}
    }

    return { success: true, businesses, housingListings: [], errors: [], metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: businesses.length }};
  }

  private createEducationRecord(place: any, type: string): BusinessData {
    return {
      id: `edu_${place.place_id}`, name: place.name, slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: '', category: 'Education', subcategory: type, google_place_id: place.place_id,
      address: place.vicinity || '', city: '', country: 'Unknown',
      latitude: place.geometry.location.lat, longitude: place.geometry.location.lng,
      phone: '', email: '', website: '',
      images: place.photos?.slice(0, 3).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
      rating: place.rating || 0, review_count: place.user_ratings_total || 0, price_level: 1 as const,
      is_verified: true, trust_score: 60, response_time_minutes: 120, tags: [type], opening_hours: undefined, amenities: []
    };
  }
}

// Agent 7: Entertainment Scanner
export class EntertainmentScannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, name: 'EntertainmentScannerAgent', rateLimitPerMinute: 100, retryAttempts: 3, timeoutMs: 10000 });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const types = ['movie_theater', 'night_club', 'bar', 'casino', 'bowling_alley', 'amusement_park', 'zoo', 'aquarium', 'museum'];

    for (const type of types) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${location.lat},${location.lng}`);
        url.searchParams.set('radius', String(location.radiusKm * 1000));
        url.searchParams.set('type', type);
        url.searchParams.set('key', this.config.apiKey || '');
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        for (const place of data.results || []) {
          businesses.push(this.createEntertainmentRecord(place, type));
        }
      } catch {}
    }

    return { success: true, businesses, housingListings: [], errors: [], metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: businesses.length }};
  }

  private createEntertainmentRecord(place: any, type: string): BusinessData {
    return {
      id: `ent_${place.place_id}`, name: place.name, slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: '', category: 'Entertainment', subcategory: type, google_place_id: place.place_id,
      address: place.vicinity || '', city: '', country: 'Unknown',
      latitude: place.geometry.location.lat, longitude: place.geometry.location.lng,
      phone: place.formatted_phone_number || '', email: '', website: place.website || '',
      images: place.photos?.slice(0, 8).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
      rating: place.rating || 0, review_count: place.user_ratings_total || 0, price_level: (place.price_level || 2) as 1|2|3|4,
      is_verified: true, trust_score: 65, response_time_minutes: 60, tags: [type], opening_hours: undefined, amenities: []
    };
  }
}

// Agent 8: Finance Scanner
export class FinanceScannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, name: 'FinanceScannerAgent', rateLimitPerMinute: 100, retryAttempts: 3, timeoutMs: 10000 });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const types = ['bank', 'atm', 'insurance_agency', 'accounting'];

    for (const type of types) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${location.lat},${location.lng}`);
        url.searchParams.set('radius', String(location.radiusKm * 500));
        url.searchParams.set('type', type);
        url.searchParams.set('key', this.config.apiKey || '');
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        for (const place of data.results || []) {
          businesses.push(this.createFinanceRecord(place, type));
        }
      } catch {}
    }

    return { success: true, businesses, housingListings: [], errors: [], metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: businesses.length }};
  }

  private createFinanceRecord(place: any, type: string): BusinessData {
    return {
      id: `fin_${place.place_id}`, name: place.name, slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: '', category: 'Finance', subcategory: type, google_place_id: place.place_id,
      address: place.vicinity || '', city: '', country: 'Unknown',
      latitude: place.geometry.location.lat, longitude: place.geometry.location.lng,
      phone: place.formatted_phone_number || '', email: '', website: place.website || '',
      images: place.photos?.slice(0, 4).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
      rating: place.rating || 0, review_count: place.user_ratings_total || 0, price_level: 2 as const,
      is_verified: true, trust_score: 75, response_time_minutes: 60, tags: [type], opening_hours: undefined, amenities: []
    };
  }
}

// Agent 9: Transportation Scanner
export class TransportationScannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, name: 'TransportationScannerAgent', rateLimitPerMinute: 100, retryAttempts: 3, timeoutMs: 10000 });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const types = ['gas_station', 'car_repair', 'car_wash', 'parking', 'transit_station'];

    for (const type of types) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${location.lat},${location.lng}`);
        url.searchParams.set('radius', String(location.radiusKm * 1000));
        url.searchParams.set('type', type);
        url.searchParams.set('key', this.config.apiKey || '');
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        for (const place of data.results || []) {
          businesses.push(this.createTransportRecord(place, type));
        }
      } catch {}
    }

    return { success: true, businesses, housingListings: [], errors: [], metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: businesses.length }};
  }

  private createTransportRecord(place: any, type: string): BusinessData {
    return {
      id: `trn_${place.place_id}`, name: place.name, slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: '', category: 'Transportation', subcategory: type, google_place_id: place.place_id,
      address: place.vicinity || '', city: '', country: 'Unknown',
      latitude: place.geometry.location.lat, longitude: place.geometry.location.lng,
      phone: place.formatted_phone_number || '', email: '', website: place.website || '',
      images: place.photos?.slice(0, 4).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
      rating: place.rating || 0, review_count: place.user_ratings_total || 0, price_level: 2 as const,
      is_verified: true, trust_score: 60, response_time_minutes: 30, tags: [type], opening_hours: undefined, amenities: []
    };
  }
}

// Agent 10: Points of Interest Scanner
export class POIScannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, name: 'POIScannerAgent', rateLimitPerMinute: 100, retryAttempts: 3, timeoutMs: 10000 });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const types = ['park', 'tourist_attraction', 'landmark', 'place_of_worship', 'stadium', 'gym'];

    for (const type of types) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${location.lat},${location.lng}`);
        url.searchParams.set('radius', String(location.radiusKm * 2000));
        url.searchParams.set('type', type);
        url.searchParams.set('key', this.config.apiKey || '');
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        for (const place of data.results || []) {
          businesses.push(this.createPOIRecord(place, type));
        }
      } catch {}
    }

    return { success: true, businesses, housingListings: [], errors: [], metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: businesses.length }};
  }

  private createPOIRecord(place: any, type: string): BusinessData {
    return {
      id: `poi_${place.place_id}`, name: place.name, slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: '', category: 'Points of Interest', subcategory: type, google_place_id: place.place_id,
      address: place.vicinity || '', city: '', country: 'Unknown',
      latitude: place.geometry.location.lat, longitude: place.geometry.location.lng,
      phone: place.formatted_phone_number || '', email: '', website: place.website || '',
      images: place.photos?.slice(0, 10).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
      rating: place.rating || 0, review_count: place.user_ratings_total || 0, price_level: 1 as const,
      is_verified: true, trust_score: 70, response_time_minutes: 60, tags: [type], opening_hours: undefined, amenities: []
    };
  }
}
