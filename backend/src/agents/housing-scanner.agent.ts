/**
 * Agent 2: Housing & Accommodation Scanner
 * Specialized in finding hotels, vacation rentals, and lodging options
 */

import { BaseAgent, AgentConfig, BusinessData, HousingData, ScoutingResult } from './base.agent.js';

export class HousingScannerAgent extends BaseAgent {
  private readonly GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  private readonly PLACE_DETAILS_API = 'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(config: AgentConfig) {
    super({
      ...config,
      name: 'HousingScannerAgent',
      rateLimitPerMinute: config.rateLimitPerMinute || 100,
      retryAttempts: config.retryAttempts || 3,
      timeoutMs: config.timeoutMs || 10000,
    });
  }

  async scan(location: { lat: number; lng: number; radiusKm: number }): Promise<ScoutingResult> {
    const housingListings: HousingData[] = [];
    const businesses: BusinessData[] = [];
    const errors: string[] = [];

    try {
      await this.rateLimit();

      // Search for accommodation types
      const accommodationTypes = [
        'lodging', 'hotel', 'resort', 'motel',
        'rv_park', 'campground', 'vacation_rental_agency'
      ];

      for (const type of accommodationTypes) {
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
            const [business, housing] = await this.processAccommodation(place.place_id);
            if (business) businesses.push(business);
            if (housing) housingListings.push(housing);
          }
        } catch (error) {
          errors.push(`Failed to scan ${type}: ${(error as Error).message}`);
        }
      }

      return {
        success: housingListings.length > 0 || businesses.length > 0,
        businesses,
        housingListings,
        errors,
        metadata: {
          scannedArea: {
            centerLat: location.lat,
            centerLng: location.lng,
            radiusKm: location.radiusKm,
          },
          timestamp: new Date().toISOString(),
          agentName: this.getName(),
          recordsFound: housingListings.length + businesses.length,
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

  private async processAccommodation(placeId: string): Promise<[BusinessData | null, HousingData | null]> {
    try {
      await this.rateLimit();

      const url = new URL(this.PLACE_DETAILS_API);
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', [
        'name', 'formatted_address', 'geometry', 'formatted_phone_number',
        'international_phone_number', 'website', 'rating', 'user_ratings_total',
        'price_level', 'opening_hours', 'types', 'photos', 'business_status',
        'vicinity', 'editorial_summary', 'reviews'
      ].join(','));
      url.searchParams.set('key', this.config.apiKey || '');

      const response = await fetch(url.toString());
      if (!response.ok) return [null, null];

      const data = await response.json();
      if (!data.result || data.result.business_status !== 'OPERATIONAL') return [null, null];

      const result = data.result;
      
      // Create business record
      const business: BusinessData = {
        id: `hsg_b_${placeId}`,
        name: result.name,
        slug: this.generateSlug(result.name),
        description: result.editorial_summary?.overview || '',
        category: 'Accommodation',
        subcategory: this.determineAccommodationType(result.types),
        google_place_id: placeId,
        address: result.formatted_address,
        city: this.extractCity(result.formatted_address),
        country: this.extractCountry(result.formatted_address),
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        phone: result.formatted_phone_number || result.international_phone_number || '',
        email: '',
        website: result.website || '',
        images: result.photos?.slice(0, 10).map((p: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`
        ) || [],
        rating: result.rating || 0,
        review_count: result.user_ratings_total || 0,
        price_level: (result.price_level || 2) as 1 | 2 | 3 | 4,
        is_verified: result.business_status === 'OPERATIONAL',
        trust_score: this.calculateTrustScore(result),
        response_time_minutes: 30,
        tags: result.types || [],
        opening_hours: this.parseOpeningHours(result.opening_hours),
        amenities: this.extractAmenities(result),
      };

      // Create housing listing record
      const housing: HousingData = {
        id: `hsg_${placeId}`,
        host_id: 'system_generated',
        title: result.name,
        description: result.editorial_summary?.overview || result.vicinity || '',
        property_type: this.mapPropertyType(result.types),
        room_type: 'Entire place',
        address: result.formatted_address,
        city: this.extractCity(result.formatted_address),
        country: this.extractCountry(result.formatted_address),
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        guests: this.estimateGuests(result.types),
        bedrooms: this.estimateBedrooms(result.types),
        beds: this.estimateBeds(result.types),
        baths: 1,
        price_per_night: this.estimatePrice(result.price_level),
        minimum_nights: 1,
        maximum_nights: 30,
        cleaning_fee: 50,
        security_deposit: 100,
        rating: result.rating || 0,
        review_count: result.user_ratings_total || 0,
        is_superhost: result.rating >= 4.8 && result.user_ratings_total > 100,
        is_guest_favorite: result.rating >= 4.7,
        is_instant_book: true,
        self_check_in: true,
        images: result.photos?.slice(0, 15).map((p: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${this.config.apiKey}`
        ) || [],
        amenities: this.extractHousingAmenities(result),
        house_rules: this.generateHouseRules(result.types),
        cancellation_policy: 'moderate',
        is_active: result.business_status === 'OPERATIONAL',
      };

      return [business, housing];
    } catch (error) {
      console.error(`Error processing accommodation ${placeId}:`, error);
      return [null, null];
    }
  }

  private determineAccommodationType(types: string[]): string {
    if (types.includes('resort')) return 'Resort';
    if (types.includes('hotel')) return 'Hotel';
    if (types.includes('motel')) return 'Motel';
    if (types.includes('rv_park')) return 'RV Park';
    if (types.includes('campground')) return 'Campground';
    if (types.includes('lodging')) return 'Lodging';
    return 'Accommodation';
  }

  private mapPropertyType(types: string[]): string {
    const mapping: Record<string, string> = {
      hotel: 'Hotel',
      resort: 'Resort',
      motel: 'Motel',
      rv_park: 'RV Park',
      campground: 'Campsite',
      lodging: 'Guesthouse',
    };

    for (const type of types) {
      if (mapping[type]) return mapping[type];
    }

    return 'Apartment';
  }

  private estimateGuests(types: string[]): number {
    if (types.includes('resort')) return 4;
    if (types.includes('hotel')) return 2;
    return 2;
  }

  private estimateBedrooms(types: string[]): number {
    if (types.includes('resort')) return 2;
    return 1;
  }

  private estimateBeds(types: string[]): number {
    if (types.includes('resort')) return 2;
    return 1;
  }

  private estimatePrice(priceLevel: number | undefined): number {
    const prices: Record<number, number> = {
      1: 50,
      2: 100,
      3: 200,
      4: 400,
    };
    return prices[priceLevel || 2] || 100;
  }

  private extractHousingAmenities(place: any): string[] {
    const amenities: string[] = [];
    
    if (place.wheelchair_accessible_entrance) amenities.push('Wheelchair accessible');
    if (place.free_wifi) amenities.push('Wifi');
    if (place.parking) amenities.push('Free parking');
    if (place.pool) amenities.push('Pool');
    if (place.fitness_center) amenities.push('Gym');
    if (place.restaurant) amenities.push('Restaurant');
    if (place.bar) amenities.push('Bar');
    if (place.room_service) amenities.push('Room service');
    if (place.air_conditioning) amenities.push('Air conditioning');
    if (place.elevator) amenities.push('Elevator');
    if (place.hot_tub) amenities.push('Hot tub');
    if (place.sauna) amenities.push('Sauna');
    if (place.spa) amenities.push('Spa');
    if (place.beach_access) amenities.push('Beach access');
    if (place.pet_friendly) amenities.push('Pets allowed');
    if (place.breakfast_included) amenities.push('Breakfast included');
    if (place.kitchen) amenities.push('Kitchen');
    if (place.washer) amenities.push('Washer');
    if (place.dryer) amenities.push('Dryer');
    if (place.tv) amenities.push('TV');
    if (place.balcony) amenities.push('Balcony');

    return amenities;
  }

  private generateHouseRules(types: string[]): string[] {
    const rules: string[] = [
      'No smoking',
      'No parties or events',
      'Check-in time is 3PM - 10PM',
      'Checkout before 11AM',
    ];

    if (types.includes('pet_friendly')) {
      rules.push('Pets allowed with prior approval');
    } else {
      rules.push('No pets allowed');
    }

    return rules;
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
    if (place.photos?.length > 10) score += 10;

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
    if (!match) return '15:00';

    let [_, hours, minutes, period] = match;
    let h = parseInt(hours);

    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${minutes}`;
  }

  private extractAmenities(place: any): string[] {
    return this.extractHousingAmenities(place);
  }
}
