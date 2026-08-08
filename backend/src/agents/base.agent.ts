/**
 * NEXA Agentic Scouting System - Base Agent Interface
 * Billion-dollar startup grade architecture for systematic business discovery
 */

export interface AgentConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  rateLimitPerMinute: number;
  retryAttempts: number;
  timeoutMs: number;
}

export interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  google_place_id?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  images: string[];
  rating: number;
  review_count: number;
  price_level: 1 | 2 | 3 | 4;
  is_verified: boolean;
  trust_score: number;
  response_time_minutes: number;
  tags: string[];
  opening_hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  amenities: string[];
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HousingData {
  id: string;
  host_id: string;
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  price_per_night: number;
  minimum_nights: number;
  maximum_nights: number;
  cleaning_fee: number;
  security_deposit: number;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  is_guest_favorite: boolean;
  is_instant_book: boolean;
  self_check_in: boolean;
  images: string[];
  amenities: string[];
  house_rules: string[];
  cancellation_policy: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScoutingResult {
  success: boolean;
  businesses: BusinessData[];
  housingListings: HousingData[];
  errors: string[];
  metadata: {
    scannedArea: {
      centerLat: number;
      centerLng: number;
      radiusKm: number;
    };
    timestamp: string;
    agentName: string;
    recordsFound: number;
  };
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected requestCount: number = 0;
  protected lastResetTime: number = Date.now();

  constructor(config: AgentConfig) {
    this.config = config;
  }

  protected async rateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.config.rateLimitPerMinute) {
      const waitTime = 60000 - (now - this.lastResetTime);
      console.log(`[${this.config.name}] Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  protected async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[${this.config.name}] Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.config.retryAttempts - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  protected async withTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${this.config.timeoutMs}ms`)), this.config.timeoutMs)
      )
    ]);
  }

  abstract scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult>;
  
  getName(): string {
    return this.config.name;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}
