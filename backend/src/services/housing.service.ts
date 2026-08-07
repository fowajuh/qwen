import { db } from '../config/database.js';
import type { HousingListing, Booking } from '../models/types.js';

/**
 * Housing Service - handles all housing listing-related database operations
 */
export class HousingService {
  /**
   * Get all housing listings with optional filters
   */
  getAll(filters?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    minGuests?: number;
    isSuperhost?: boolean;
    isInstantBook?: boolean;
    limit?: number;
    offset?: number;
  }): HousingListing[] {
    let query = 'SELECT * FROM housing_listings WHERE is_active = 1';
    const params: (string | number)[] = [];

    if (filters?.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }

    if (filters?.propertyType) {
      query += ' AND property_type = ?';
      params.push(filters.propertyType);
    }

    if (filters?.minPrice !== undefined) {
      query += ' AND price_per_night >= ?';
      params.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query += ' AND price_per_night <= ?';
      params.push(filters.maxPrice);
    }

    if (filters?.minBedrooms) {
      query += ' AND bedrooms >= ?';
      params.push(filters.minBedrooms);
    }

    if (filters?.minGuests) {
      query += ' AND guests >= ?';
      params.push(filters.minGuests);
    }

    if (filters?.isSuperhost) {
      query += ' AND is_superhost = 1';
    }

    if (filters?.isInstantBook) {
      query += ' AND is_instant_book = 1';
    }

    query += ' ORDER BY rating DESC, review_count DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as unknown as HousingListing[];

    return rows.map(row => ({
      ...row,
      images: JSON.parse(row.images as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      house_rules: JSON.parse(row.house_rules as unknown as string),
    }));
  }

  /**
   * Get a single housing listing by ID
   */
  getById(id: string): HousingListing | undefined {
    const stmt = db.prepare('SELECT * FROM housing_listings WHERE id = ? AND is_active = 1');
    const row = stmt.get(id) as unknown as HousingListing | undefined;

    if (!row) return undefined;

    return {
      ...row,
      images: JSON.parse(row.images as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      house_rules: JSON.parse(row.house_rules as unknown as string),
    };
  }

  /**
   * Search housing listings
   */
  search(options: {
    query?: string;
    latitude?: number;
    longitude?: number;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    limit?: number;
    offset?: number;
  }): HousingListing[] {
    let query = 'SELECT * FROM housing_listings WHERE is_active = 1';
    const params: (string | number)[] = [];

    if (options?.query) {
      const searchTerm = `%${options.query}%`;
      query += ' AND (title LIKE ? OR description LIKE ? OR city LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (options?.guests) {
      query += ' AND guests >= ?';
      params.push(options.guests);
    }

    query += ' ORDER BY rating DESC, review_count DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as unknown as HousingListing[];

    return rows.map(row => ({
      ...row,
      images: JSON.parse(row.images as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      house_rules: JSON.parse(row.house_rules as unknown as string),
    }));
  }

  /**
   * Get housing listings near a location
   */
  getNearby(latitude: number, longitude: number, radiusKm: number = 20, limit: number = 20): HousingListing[] {
    const stmt = db.prepare(`
      SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM housing_listings 
      WHERE is_active = 1
      HAVING distance <= ?
      ORDER BY distance ASC, rating DESC
      LIMIT ?
    `);

    const rows = stmt.all(latitude, longitude, latitude, radiusKm, limit) as unknown as (HousingListing & { distance: number })[];

    return rows.map(row => ({
      ...row,
      images: JSON.parse(row.images as unknown as string),
      amenities: JSON.parse(row.amenities as unknown as string),
      house_rules: JSON.parse(row.house_rules as unknown as string),
    }));
  }

  /**
   * Create a new housing listing
   */
  create(listing: Omit<HousingListing, 'id' | 'created_at' | 'updated_at'>): HousingListing {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO housing_listings (
        id, host_id, title, description, property_type, room_type,
        address, city, state, country, postal_code, latitude, longitude,
        guests, bedrooms, beds, baths, price_per_night, minimum_nights, maximum_nights,
        cleaning_fee, security_deposit, rating, review_count, is_superhost,
        is_guest_favorite, is_instant_book, self_check_in, images, amenities,
        house_rules, cancellation_policy, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    stmt.run(
      id,
      listing.host_id,
      listing.title,
      listing.description || null,
      listing.property_type,
      listing.room_type,
      listing.address,
      listing.city,
      listing.state || null,
      listing.country,
      listing.postal_code || null,
      listing.latitude,
      listing.longitude,
      listing.guests,
      listing.bedrooms,
      listing.beds,
      listing.baths,
      listing.price_per_night,
      listing.minimum_nights || 1,
      listing.maximum_nights || 30,
      listing.cleaning_fee || 0,
      listing.security_deposit || 0,
      listing.is_superhost ? 1 : 0,
      listing.is_guest_favorite ? 1 : 0,
      listing.is_instant_book ? 1 : 0,
      listing.self_check_in ? 1 : 0,
      JSON.stringify(listing.images || []),
      JSON.stringify(listing.amenities || []),
      JSON.stringify(listing.house_rules || []),
      listing.cancellation_policy || 'moderate',
      now,
      now
    );

    return { ...listing, id, created_at: now, updated_at: now } as HousingListing;
  }

  /**
   * Update a housing listing
   */
  update(id: string, updates: Partial<HousingListing>): HousingListing | undefined {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'images' || key === 'amenities' || key === 'house_rules') {
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

    const stmt = db.prepare(`UPDATE housing_listings SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getById(id);
  }

  /**
   * Delete a housing listing (soft delete)
   */
  delete(id: string): boolean {
    const stmt = db.prepare('UPDATE housing_listings SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Update listing rating
   */
  updateRating(listingId: string): void {
    const stmt = db.prepare(`
      UPDATE housing_listings 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE listing_id = ?
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews WHERE listing_id = ?
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(listingId, listingId, listingId);
  }

  /**
   * Check availability for dates
   */
  checkAvailability(listingId: string, checkIn: string, checkOut: string): boolean {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE listing_id = ? 
        AND status IN ('pending', 'confirmed')
        AND (
          (scheduled_date BETWEEN ? AND ?)
          OR (scheduled_date <= ? AND datetime(scheduled_date, '+' || duration_minutes || ' minutes') >= ?)
        )
    `);
    
    const result = stmt.get(listingId, checkIn, checkOut, checkIn, checkOut) as { count: number };
    return result.count === 0;
  }

  /**
   * Create a booking for a housing listing
   */
  createBooking(booking: {
    user_id: string;
    listing_id: string;
    scheduled_date: string;
    total_price: number;
    guest_count: number;
    special_requests?: string;
  }): Booking {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO bookings (
        id, user_id, listing_id, booking_type, status, scheduled_date,
        total_price, guest_count, special_requests, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, 'housing', 'pending', ?, ?, ?, ?, 'pending', ?, ?)
    `);

    stmt.run(
      id,
      booking.user_id,
      booking.listing_id,
      booking.scheduled_date,
      booking.total_price,
      booking.guest_count,
      booking.special_requests || null,
      now,
      now
    );

    return {
      id,
      user_id: booking.user_id,
      listing_id: booking.listing_id,
      booking_type: 'housing',
      status: 'pending',
      scheduled_date: booking.scheduled_date,
      total_price: booking.total_price,
      guest_count: booking.guest_count,
      special_requests: booking.special_requests,
      payment_status: 'pending',
      created_at: now,
      updated_at: now,
    } as Booking;
  }
}

export const housingService = new HousingService();
