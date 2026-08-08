/**
 * Scouting Service - Integrates agent system with database storage
 * Stores scanned business and housing data for frontend consumption
 */

import { pool } from '../config/database.pg.js';
import { AgentOrchestrator, createOrchestrator } from '../agents/orchestrator.agent.js';
import type { BusinessData, HousingData } from '../agents/base.agent.js';

export interface ScoutingServiceConfig {
  googleMapsApiKey: string;
  autoStoreResults?: boolean;
}

export class ScoutingService {
  private orchestrator: AgentOrchestrator;
  private config: ScoutingServiceConfig;
  private scanCache: Map<string, { businesses: BusinessData[]; housingListings: HousingData[]; timestamp: number }> = new Map();

  constructor(config: ScoutingServiceConfig) {
    this.config = {
      autoStoreResults: true,
      ...config,
    };
    this.orchestrator = createOrchestrator({ googleMapsApiKey: config.googleMapsApiKey });
  }

  /**
   * Scan a location and optionally store results in database
   */
  async scanLocation(lat: number, lng: number, radiusKm: number = 5): Promise<{
    success: boolean;
    businesses: BusinessData[];
    housingListings: HousingData[];
    errors: string[];
    metadata: any;
  }> {
    const cacheKey = `${lat.toFixed(4)}-${lng.toFixed(4)}-${radiusKm}`;
    
    // Check cache (5 minute TTL)
    const cached = this.scanCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log(`[ScoutingService] Returning cached results for ${cacheKey}`);
      return {
        success: true,
        businesses: cached.businesses,
        housingListings: cached.housingListings,
        errors: [],
        metadata: { fromCache: true },
      };
    }

    // Run agents
    const result = await this.orchestrator.scanArea({ lat, lng, radiusKm });

    // Store in cache
    this.scanCache.set(cacheKey, {
      businesses: result.businesses,
      housingListings: result.housingListings,
      timestamp: Date.now(),
    });

    // Auto-store in database if enabled
    if (this.config.autoStoreResults && result.success) {
      try {
        await this.storeResults(result.businesses, result.housingListings);
      } catch (error) {
        console.error('[ScoutingService] Failed to store results:', error);
        result.errors.push(`Storage error: ${(error as Error).message}`);
      }
    }

    return result;
  }

  /**
   * Store businesses and housing listings in database
   */
  async storeResults(businesses: BusinessData[], housingListings: HousingData[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert businesses
      for (const business of businesses) {
        await this.upsertBusiness(client, business);
      }

      // Insert housing listings
      for (const housing of housingListings) {
        await this.upsertHousing(client, housing);
      }

      await client.query('COMMIT');
      console.log(`[ScoutingService] Stored ${businesses.length} businesses and ${housingListings.length} housing listings`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async upsertBusiness(client: any, business: BusinessData): Promise<void> {
    const query = `
      INSERT INTO businesses (
        id, owner_id, name, slug, description, category, subcategory,
        google_place_id, address, city, state, country, postal_code,
        latitude, longitude, phone, email, website, logo_url, cover_image_url,
        images, rating, review_count, price_level, is_verified, is_approved,
        trust_score, response_time_minutes, tags, opening_hours, amenities,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW(), NOW())
      ON CONFLICT (google_place_id) DO UPDATE SET
        name = EXCLUDED.name,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        images = EXCLUDED.images,
        trust_score = EXCLUDED.trust_score,
        updated_at = NOW()
    `;

    const values = [
      business.id,
      'system_scout', // owner_id for system-scanned businesses
      business.name,
      business.slug,
      business.description || null,
      business.category,
      business.subcategory || null,
      business.google_place_id || null,
      business.address,
      business.city,
      business.state || null,
      business.country,
      business.postal_code || null,
      business.latitude,
      business.longitude,
      business.phone,
      business.email || null,
      business.website || null,
      business.logo_url || null,
      business.cover_image_url || null,
      JSON.stringify(business.images),
      business.rating,
      business.review_count,
      business.price_level,
      business.is_verified ? 1 : 0,
      1, // is_approved for scanned businesses
      business.trust_score,
      business.response_time_minutes,
      JSON.stringify(business.tags),
      business.opening_hours ? JSON.stringify(business.opening_hours) : null,
      JSON.stringify(business.amenities),
    ];

    await client.query(query, values);
  }

  private async upsertHousing(client: any, housing: HousingData): Promise<void> {
    const query = `
      INSERT INTO housing_listings (
        id, host_id, title, description, property_type, room_type,
        address, city, state, country, postal_code,
        latitude, longitude, guests, bedrooms, beds, baths,
        price_per_night, minimum_nights, maximum_nights, cleaning_fee, security_deposit,
        rating, review_count, is_superhost, is_guest_favorite, is_instant_book, self_check_in,
        images, amenities, house_rules, cancellation_policy, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        images = EXCLUDED.images,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `;

    const values = [
      housing.id,
      housing.host_id,
      housing.title,
      housing.description,
      housing.property_type,
      housing.room_type,
      housing.address,
      housing.city,
      housing.state || null,
      housing.country,
      housing.postal_code || null,
      housing.latitude,
      housing.longitude,
      housing.guests,
      housing.bedrooms,
      housing.beds,
      housing.baths,
      housing.price_per_night,
      housing.minimum_nights,
      housing.maximum_nights,
      housing.cleaning_fee,
      housing.security_deposit,
      housing.rating,
      housing.review_count,
      housing.is_superhost ? 1 : 0,
      housing.is_guest_favorite ? 1 : 0,
      housing.is_instant_book ? 1 : 0,
      housing.self_check_in ? 1 : 0,
      JSON.stringify(housing.images),
      JSON.stringify(housing.amenities),
      JSON.stringify(housing.house_rules),
      housing.cancellation_policy,
      housing.is_active ? 1 : 0,
    ];

    await client.query(query, values);
  }

  /**
   * Get nearby businesses from database
   */
  async getNearbyBusinesses(lat: number, lng: number, radiusKm: number = 5, limit: number = 50): Promise<BusinessData[]> {
    const query = `
      SELECT *, 
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
      FROM businesses 
      WHERE is_approved = 1
      HAVING distance <= $3
      ORDER BY distance ASC, rating DESC
      LIMIT $4
    `;

    const result = await pool.query(query, [lat, lng, radiusKm, limit]);
    return result.rows.map(row => ({
      ...row,
      images: JSON.parse(row.images),
      tags: JSON.parse(row.tags),
      amenities: JSON.parse(row.amenities),
      opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : undefined,
    }));
  }

  /**
   * Get nearby housing listings from database
   */
  async getNearbyHousing(lat: number, lng: number, radiusKm: number = 5, limit: number = 50): Promise<HousingData[]> {
    const query = `
      SELECT *, 
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
      FROM housing_listings 
      WHERE is_active = 1
      HAVING distance <= $3
      ORDER BY distance ASC, rating DESC
      LIMIT $4
    `;

    const result = await pool.query(query, [lat, lng, radiusKm, limit]);
    return result.rows.map(row => ({
      ...row,
      images: JSON.parse(row.images),
      amenities: JSON.parse(row.amenities),
      house_rules: JSON.parse(row.house_rules),
    }));
  }

  /**
   * Trigger a scan and return real-time results
   */
  async scanAndReturn(lat: number, lng: number, radiusKm: number = 5): Promise<{
    businesses: BusinessData[];
    housingListings: HousingData[];
    scanDurationMs: number;
  }> {
    const result = await this.scanLocation(lat, lng, radiusKm);
    return {
      businesses: result.businesses,
      housingListings: result.housingListings,
      scanDurationMs: result.metadata?.scanDurationMs || 0,
    };
  }
}

// Export singleton factory
let instance: ScoutingService | undefined;

export function getScoutingService(apiKey?: string): ScoutingService {
  if (!instance) {
    instance = new ScoutingService({
      googleMapsApiKey: apiKey || process.env.GOOGLE_MAPS_API_KEY || '',
      autoStoreResults: true,
    });
  }
  return instance;
}
