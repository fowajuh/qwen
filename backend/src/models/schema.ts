import { db } from '../config/database.js';

/**
 * Initialize database schema with all tables
 */
export function initializeDatabase(): void {
  console.log('Initializing database schema...');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'business_owner', 'host', 'admin')),
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create businesses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      google_place_id TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      country TEXT NOT NULL DEFAULT 'US',
      postal_code TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      website TEXT,
      logo_url TEXT,
      cover_image_url TEXT,
      images TEXT DEFAULT '[]',
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      price_level INTEGER DEFAULT 2 CHECK(price_level BETWEEN 1 AND 4),
      is_verified INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0,
      trust_score INTEGER DEFAULT 50,
      response_time_minutes INTEGER DEFAULT 60,
      jobs_completed INTEGER DEFAULT 0,
      retention_rate INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      opening_hours TEXT,
      amenities TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      price_display TEXT,
      duration_minutes INTEGER NOT NULL,
      category TEXT,
      is_available INTEGER DEFAULT 1,
      requires_booking INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create housing_listings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS housing_listings (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      property_type TEXT NOT NULL,
      room_type TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      country TEXT NOT NULL DEFAULT 'US',
      postal_code TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      guests INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      beds INTEGER NOT NULL,
      baths REAL NOT NULL,
      price_per_night REAL NOT NULL,
      minimum_nights INTEGER DEFAULT 1,
      maximum_nights INTEGER DEFAULT 30,
      cleaning_fee REAL DEFAULT 0,
      security_deposit REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      is_superhost INTEGER DEFAULT 0,
      is_guest_favorite INTEGER DEFAULT 0,
      is_instant_book INTEGER DEFAULT 0,
      self_check_in INTEGER DEFAULT 0,
      images TEXT DEFAULT '[]',
      amenities TEXT DEFAULT '[]',
      house_rules TEXT DEFAULT '[]',
      cancellation_policy TEXT DEFAULT 'moderate',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
      listing_id TEXT REFERENCES housing_listings(id) ON DELETE CASCADE,
      service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
      booking_type TEXT NOT NULL CHECK(booking_type IN ('service', 'housing', 'experience')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT,
      duration_minutes INTEGER,
      total_price REAL NOT NULL,
      guest_count INTEGER DEFAULT 1,
      special_requests TEXT,
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
      payment_intent_id TEXT,
      confirmed_at DATETIME,
      completed_at DATETIME,
      cancelled_at DATETIME,
      cancellation_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
      listing_id TEXT REFERENCES housing_listings(id) ON DELETE CASCADE,
      booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      title TEXT,
      comment TEXT NOT NULL,
      response TEXT,
      response_at DATETIME,
      is_verified_stay INTEGER DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participant_1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      participant_2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
      listing_id TEXT REFERENCES housing_listings(id) ON DELETE CASCADE,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(participant_1_id, participant_2_id, business_id, listing_id)
    )
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'booking_request', 'booking_confirmation')),
      is_read INTEGER DEFAULT 0,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      is_read INTEGER DEFAULT 0,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method TEXT DEFAULT 'card' CHECK(payment_method IN ('card', 'bank_transfer', 'wallet')),
      stripe_payment_intent_id TEXT,
      stripe_charge_id TEXT,
      refund_reason TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create wishlists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create wishlist_items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
      business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
      listing_id TEXT REFERENCES housing_listings(id) ON DELETE CASCADE,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create experiences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_per_person REAL NOT NULL,
      min_participants INTEGER DEFAULT 1,
      max_participants INTEGER DEFAULT 10,
      images TEXT DEFAULT '[]',
      what_included TEXT DEFAULT '[]',
      requirements TEXT DEFAULT '[]',
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
    CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
    CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);
    CREATE INDEX IF NOT EXISTS idx_housing_city ON housing_listings(city);
    CREATE INDEX IF NOT EXISTS idx_housing_location ON housing_listings(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_housing_price ON housing_listings(price_per_night);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_business ON bookings(business_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  `);

  console.log('Database schema initialized successfully!');
}
