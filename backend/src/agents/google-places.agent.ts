/**
 * Agent 1: Google Places Business Scanner
 * Specialized in finding restaurants, cafes, and food establishments
 */

import { BaseAgent, AgentConfig, BusinessData, ScoutingResult } from './base.agent.js';

export class GooglePlacesAgent extends BaseAgent {
  private readonly GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  private readonly PLACE_DETAILS_API = 'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(config: AgentConfig) {
    super({
      ...config,
      name: 'GooglePlacesAgent',
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

      // Search for various business types
      const businessTypes = [
        'restaurant', 'cafe', 'bar', 'bakery', 'food',
        'lodging', 'gym', 'spa', 'beauty_salon',
        'store', 'shopping_mall', 'supermarket',
        'hospital', 'doctor', 'dentist', 'pharmacy',
        'bank', 'atm', 'post_office',
        'gas_station', 'car_repair', 'car_wash',
        'school', 'university', 'library',
        'park', 'museum', 'zoo', 'aquarium',
        'movie_theater', 'night_club', 'casino'
      ];

      for (const type of businessTypes) {
        try {
          const results = await this.withTimeout(() =>
            this.retry(async () => {
              const url = new URL(this.GOOGLE_PLACES_API);
              url.searchParams.set('location', `${location.lat},${location.lng}`);
              url.searchParams.set('radius', String(location.radiusKm * 1000));
              url.searchParams.set('type', type);
              url.searchParams.set('key', this.config.apiKey || '');

              const response = await fetch(url.toString());
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              
              const data = await response.json();
              return data.results || [];
            })
          );

          for (const place of results) {
            const business = await this.fetchPlaceDetails(place.place_id);
            if (business) {
              businesses.push(business);
            }
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
          scannedArea: {
            centerLat: location.lat,
            centerLng: location.lng,
            radiusKm: location.radiusKm,
          },
          timestamp: new Date().toISOString(),
          agentName: this.getName(),
          recordsFound: businesses.length,
        },
      };
    } catch (error) {
      errors.push(`Critical error: ${(error as Error).message}`);
      return {
        success: false,
        businesses: [],
        housingListings: [],
        errors,
        metadata: {
          scannedArea: {
            centerLat: location.lat,
            centerLng: location.lng,
            radiusKm: location.radiusKm,
          },
          timestamp: new Date().toISOString(),
          agentName: this.getName(),
          recordsFound: 0,
        },
      };
    }
  }

  private async fetchPlaceDetails(placeId: string): Promise<BusinessData | null> {
    try {
      await this.rateLimit();

      const url = new URL(this.PLACE_DETAILS_API);
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', [
        'name', 'formatted_address', 'geometry', 'formatted_phone_number',
        'international_phone_number', 'website', 'rating', 'user_ratings_total',
        'price_level', 'opening_hours', 'types', 'photos', 'business_status',
        'vicinity', 'editorial_summary'
      ].join(','));
      url.searchParams.set('key', this.config.apiKey || '');

      const response = await fetch(url.toString());
      if (!response.ok) return null;

      const data = await response.json();
      if (!data.result || data.result.business_status !== 'OPERATIONAL') return null;

      const result = data.result;
      const category = this.categorizeBusiness(result.types);

      return {
        id: `gp_${placeId}`,
        name: result.name,
        slug: this.generateSlug(result.name),
        description: result.editorial_summary?.overview || '',
        category: category.main,
        subcategory: category.sub,
        google_place_id: placeId,
        address: result.formatted_address,
        city: this.extractCity(result.formatted_address),
        country: this.extractCountry(result.formatted_address),
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        phone: result.formatted_phone_number || result.international_phone_number || '',
        email: '',
        website: result.website || '',
        images: result.photos?.slice(0, 5).map((p: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`
        ) || [],
        rating: result.rating || 0,
        review_count: result.user_ratings_total || 0,
        price_level: (result.price_level || 2) as 1 | 2 | 3 | 4,
        is_verified: result.business_status === 'OPERATIONAL',
        trust_score: this.calculateTrustScore(result),
        response_time_minutes: 60,
        tags: result.types || [],
        opening_hours: this.parseOpeningHours(result.opening_hours),
        amenities: this.extractAmenities(result),
      };
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      return null;
    }
  }

  private categorizeBusiness(types: string[]): { main: string; sub?: string } {
    const mapping: Record<string, { main: string; sub?: string }> = {
      restaurant: { main: 'Food & Dining', sub: 'Restaurant' },
      cafe: { main: 'Food & Dining', sub: 'Cafe' },
      bar: { main: 'Food & Dining', sub: 'Bar' },
      bakery: { main: 'Food & Dining', sub: 'Bakery' },
      lodging: { main: 'Accommodation', sub: 'Hotel' },
      gym: { main: 'Health & Fitness', sub: 'Gym' },
      spa: { main: 'Health & Fitness', sub: 'Spa' },
      beauty_salon: { main: 'Beauty', sub: 'Salon' },
      store: { main: 'Retail', sub: 'Store' },
      supermarket: { main: 'Retail', sub: 'Supermarket' },
      hospital: { main: 'Healthcare', sub: 'Hospital' },
      doctor: { main: 'Healthcare', sub: 'Medical Practice' },
      bank: { main: 'Finance', sub: 'Bank' },
      school: { main: 'Education', sub: 'School' },
    };

    for (const type of types) {
      if (mapping[type]) return mapping[type];
    }

    return { main: 'Other', sub: types[0] };
  }

  private generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private extractCity(address: string): string {
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 2]?.trim() || parts[0] : parts[0];
  }

  private extractCountry(address: string): string {
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Unknown';
  }

  private calculateTrustScore(place: any): number {
    let score = 50;
    
    if (place.rating >= 4.5) score += 30;
    else if (place.rating >= 4.0) score += 20;
    else if (place.rating >= 3.5) score += 10;

    if (place.user_ratings_total > 1000) score += 15;
    else if (place.user_ratings_total > 100) score += 10;
    else if (place.user_ratings_total > 10) score += 5;

    if (place.website) score += 5;
    if (place.photos?.length > 5) score += 5;
    if (place.opening_hours?.open_now) score += 5;

    return Math.min(score, 100);
  }

  private parseOpeningHours(openingHours: any) {
    if (!openingHours?.weekday_text) return undefined;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hours: any = {};

    openingHours.weekday_text.forEach((day: string) => {
      const dayName = days.find(d => day.toLowerCase().includes(d));
      if (dayName) {
        const times = day.split(': ').slice(1).join(': ');
        if (times.includes('Open 24 hours')) {
          hours[dayName] = { open: '00:00', close: '23:59' };
        } else if (times.includes('Closed')) {
          hours[dayName] = null;
        } else {
          // Parse time ranges like "8:00 AM – 5:00 PM"
          const match = times.match(/(\d+:\d+\s*[AP]M)\s*[–-]\s*(\d+:\d+\s*[AP]M)/);
          if (match) {
            hours[dayName] = {
              open: this.normalizeTime(match[1]),
              close: this.normalizeTime(match[2])
            };
          }
        }
      }
    });

    return Object.keys(hours).length > 0 ? hours : undefined;
  }

  private normalizeTime(time: string): string {
    const match = time.match(/(\d+):(\d+)\s*([AP])M/i);
    if (!match) return '09:00';

    let [_, hours, minutes, period] = match;
    let h = parseInt(hours);

    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${minutes}`;
  }

  private extractAmenities(place: any): string[] {
    const amenities: string[] = [];
    
    if (place.wheelchair_accessible_entrance) amenities.push('Wheelchair accessible');
    if (place.serves_beer) amenities.push('Serves beer');
    if (place.serves_wine) amenities.push('Serves wine');
    if (place.takeout) amenities.push('Takeout');
    if (place.delivery) amenities.push('Delivery');
    if (place.dine_in) amenities.push('Dine-in');
    if (place.outdoor_seating) amenities.push('Outdoor seating');
    if (place.free_wifi) amenities.push('Free Wi-Fi');
    if (place.parking) amenities.push('Parking available');

    return amenities;
  }
}
