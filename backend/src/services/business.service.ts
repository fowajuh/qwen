import { db } from '../config/database.js';
import type { Business, HousingListing, Service, User } from '../models/types.js';

/**
 * Business Service - handles all business-related database operations
 */
export class BusinessService {
  /**
   * Get all businesses with optional filters
   */
  getAll(filters?: {
    category?: string;
    city?: string;
    minRating?: number;
    limit?: number;
    offset?: number;
  }): Business[] {
    let query = 'SELECT * FROM businesses WHERE is_approved = 1';
    const params: (string | number)[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }

    if (filters?.minRating) {
      query += ' AND rating >= ?';
      params.push(filters.minRating);
    }

    query += ' ORDER BY rating DESC, trust_score DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as unknown as Business[];

    return rows.map(row => ({
      ...row,
      images: JSON.parse(row.images as unknown as string),
      tags: JSON.parse(row.tags as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : undefined,
    }));
  }

  /**
   * Get a single business by ID
   */
  getById(id: string): Business | undefined {
    const stmt = db.prepare('SELECT * FROM businesses WHERE id = ?');
    const row = stmt.get(id) as unknown as Business | undefined;

    if (!row) return undefined;

    return {
      ...row,
      images: JSON.parse(row.images as unknown as string),
      tags: JSON.parse(row.tags as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : undefined,
    };
  }

  /**
   * Get a business by slug
   */
  getBySlug(slug: string): Business | undefined {
    const stmt = db.prepare('SELECT * FROM businesses WHERE slug = ? AND is_approved = 1');
    const row = stmt.get(slug) as unknown as Business | undefined;

    if (!row) return undefined;

    return {
      ...row,
      images: JSON.parse(row.images as unknown as string),
      tags: JSON.parse(row.tags as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : undefined,
    };
  }

  /**
   * Search businesses by query
   */
  search(query: string, options?: {
    latitude?: number;
    longitude?: number;
    radius?: number; // in km
    category?: string;
    limit?: number;
  }): Business[] {
    const searchTerm = `%${query}%`;
    let sql = `
      SELECT *, 
        CASE 
          WHEN name LIKE ? THEN 3
          WHEN description LIKE ? THEN 2
          WHEN tags LIKE ? THEN 1
          ELSE 0
        END AS relevance
      FROM businesses 
      WHERE is_approved = 1 
        AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)
    `;
    const params: (string | number)[] = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

    if (options?.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }

    sql += ' ORDER BY relevance DESC, rating DESC';

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as unknown as Business[];

    return rows.map(row => ({
      ...row,
      images: JSON.parse(row.images as unknown as string),
      tags: JSON.parse(row.tags as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : undefined,
    }));
  }

  /**
   * Get businesses near a location (simple distance calculation)
   */
  getNearby(latitude: number, longitude: number, radiusKm: number = 10, limit: number = 20): Business[] {
    // Using Haversine formula approximation for SQLite
    const stmt = db.prepare(`
      SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM businesses 
      WHERE is_approved = 1
      HAVING distance <= ?
      ORDER BY distance ASC, rating DESC
      LIMIT ?
    `);

    const rows = stmt.all(latitude, longitude, latitude, radiusKm, limit) as unknown as (Business & { distance: number })[];

    return rows.map(row => ({
      ...row,
      images: JSON.parse(row.images as unknown as string),
      tags: JSON.parse(row.tags as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : undefined,
    }));
  }

  /**
   * Get services for a business
   */
  getServices(businessId: string): Service[] {
    const stmt = db.prepare('SELECT * FROM services WHERE business_id = ? AND is_available = 1 ORDER BY price ASC');
    return stmt.all(businessId) as unknown as Service[];
  }

  /**
   * Create a new business
   */
  create(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Business {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO businesses (
        id, owner_id, name, slug, description, category, subcategory,
        google_place_id, address, city, state, country, postal_code,
        latitude, longitude, phone, email, website, logo_url, cover_image_url,
        images, rating, review_count, price_level, is_verified, is_approved,
        trust_score, response_time_minutes, jobs_completed, retention_rate,
        tags, opening_hours, amenities, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 0, 0, 50, ?, 0, 0, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      business.owner_id,
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
      business.email,
      business.website || null,
      business.logo_url || null,
      business.cover_image_url || null,
      JSON.stringify(business.images || []),
      business.price_level || 2,
      business.response_time_minutes || 60,
      JSON.stringify(business.tags || []),
      business.opening_hours ? JSON.stringify(business.opening_hours) : null,
      JSON.stringify(business.amenities || []),
      now,
      now
    );

    return { ...business, id, created_at: now, updated_at: now } as Business;
  }

  /**
   * Update a business
   */
  update(id: string, updates: Partial<Business>): Business | undefined {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'images' || key === 'tags' || key === 'amenities' || key === 'opening_hours') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`);
        values.push(value as string | number);
      }
    }

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = ?');
    values.push(now);

    const stmt = db.prepare(`UPDATE businesses SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getById(id);
  }

  /**
   * Delete a business
   */
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM businesses WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Increment job count for a business
   */
  incrementJobCount(businessId: string): void {
    const stmt = db.prepare('UPDATE businesses SET jobs_completed = jobs_completed + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(businessId);
  }

  /**
   * Update business rating
   */
  updateRating(businessId: string): void {
    const stmt = db.prepare(`
      UPDATE businesses 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = ?
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews WHERE business_id = ?
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(businessId, businessId, businessId);
  }
}

export const businessService = new BusinessService();
