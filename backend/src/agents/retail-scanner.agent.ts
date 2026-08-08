/**
 * Agent 4: Retail & Shopping Scanner
 * Specialized in finding stores, malls, and retail businesses
 */

import { BaseAgent, AgentConfig, BusinessData, ScoutingResult } from './base.agent.js';

export class RetailScannerAgent extends BaseAgent {
  private readonly GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  private readonly PLACE_DETAILS_API = 'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(config: AgentConfig) {
    super({
      ...config,
      name: 'RetailScannerAgent',
      rateLimitPerMinute: config.rateLimitPerMinute || 100,
      retryAttempts: config.retryAttempts || 3,
      timeoutMs: config.timeoutMs || 10000,
    });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const businesses: BusinessData[] = [];
    const errors: string[] = [];

    try {
      await this.rateLimit();

      const retailTypes = [
        'store', 'shopping_mall', 'supermarket', 'convenience_store',
        'clothing_store', 'shoe_store', 'jewelry_store', 'furniture_store',
        'electronics_store', 'book_store', 'toy_store', 'sporting_goods_store',
        'hardware_store', 'home_goods_store', 'department_store',
        'grocery_or_supermarket', 'liquor_store', 'bakery', 'butcher'
      ];

      for (const type of retailTypes) {
        try {
          const results = await this.withTimeout(() =>
            this.retry(async () => {
              const url = new URL(this.GOOGLE_PLACES_API);
              url.searchParams.set('location', `${location.lat},${location.lng}`);
              url.searchParams.set('radius', String(location.radiusKm * 500)); // Smaller radius for retail
              url.searchParams.set('type', type);
              url.searchParams.set('key', this.config.apiKey || '');

              const response = await fetch(url.toString());
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              
              return (await response.json()).results || [];
            })
          );

          for (const place of results) {
            const business = await this.fetchRetailDetails(place.place_id);
            if (business) businesses.push(business);
          }
        } catch (error) {
          errors.push(`Failed to scan ${type}: ${(error as Error).message}`);
        }
      }

      return {
        success: businesses.length > 0,
        businesses,
        housingListings: [],
        errors,
        metadata: {
          scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm },
          timestamp: new Date().toISOString(),
          agentName: this.getName(),
          recordsFound: businesses.length,
        },
      };
    } catch (error) {
      errors.push(`Critical error: ${(error as Error).message}`);
      return { success: false, businesses: [], housingListings: [], errors, metadata: { scannedArea: { centerLat: location.lat, centerLng: location.lng, radiusKm: location.radiusKm }, timestamp: new Date().toISOString(), agentName: this.getName(), recordsFound: 0 }};
    }
  }

  private async fetchRetailDetails(placeId: string): Promise<BusinessData | null> {
    try {
      await this.rateLimit();
      const url = new URL(this.PLACE_DETAILS_API);
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', 'name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,price_level,opening_hours,types,photos,business_status,vicinity');
      url.searchParams.set('key', this.config.apiKey || '');

      const response = await fetch(url.toString());
      if (!response.ok) return null;

      const data = await response.json();
      if (!data.result || data.result.business_status !== 'OPERATIONAL') return null;

      const result = data.result;
      return {
        id: `ret_${placeId}`,
        name: result.name,
        slug: result.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: '',
        category: 'Retail',
        subcategory: result.types[0],
        google_place_id: placeId,
        address: result.formatted_address,
        city: result.formatted_address.split(',')[1]?.trim() || result.formatted_address.split(',')[0],
        country: result.formatted_address.split(',').pop()?.trim() || 'Unknown',
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        phone: result.formatted_phone_number || '',
        email: '',
        website: result.website || '',
        images: result.photos?.slice(0, 6).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`) || [],
        rating: result.rating || 0,
        review_count: result.user_ratings_total || 0,
        price_level: (result.price_level || 2) as 1 | 2 | 3 | 4,
        is_verified: true,
        trust_score: Math.min(50 + (result.rating || 0) * 10 + (result.user_ratings_total > 100 ? 20 : 10), 100),
        response_time_minutes: 60,
        tags: result.types || [],
        opening_hours: undefined,
        amenities: [],
      };
    } catch { return null; }
  }
}
