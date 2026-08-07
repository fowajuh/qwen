import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/schema.js';
import { businessService } from './services/business.service.js';
import { housingService } from './services/housing.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== BUSINESS ROUTES ====================

// Get all businesses with filters
app.get('/api/businesses', (req, res) => {
  try {
    const { category, city, minRating, limit, offset } = req.query;
    const businesses = businessService.getAll({
      category: category as string,
      city: city as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, data: businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch businesses' });
  }
});

// Get business by slug
app.get('/api/businesses/:slug', (req, res) => {
  try {
    const business = businessService.getBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }
    
    // Get services for this business
    const services = businessService.getServices(business.id);
    
    res.json({ 
      success: true, 
      data: { ...business, services } 
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch business' });
  }
});

// Search businesses
app.get('/api/businesses/search', (req, res) => {
  try {
    const { q, category, lat, lng, radius, limit } = req.query;
    const query = q as string || '';
    
    let results;
    if (lat && lng) {
      results = businessService.getNearby(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseFloat(radius as string) : 10,
        limit ? parseInt(limit as string) : 20
      );
    } else {
      results = businessService.search(query, {
        category: category as string,
        limit: limit ? parseInt(limit as string) : 20,
      });
    }
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// ==================== HOUSING ROUTES ====================

// Get all housing listings
app.get('/api/housing', (req, res) => {
  try {
    const { city, propertyType, minPrice, maxPrice, minBedrooms, minGuests, isSuperhost, isInstantBook, limit, offset } = req.query;
    const listings = housingService.getAll({
      city: city as string,
      propertyType: propertyType as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minBedrooms: minBedrooms ? parseInt(minBedrooms as string) : undefined,
      minGuests: minGuests ? parseInt(minGuests as string) : undefined,
      isSuperhost: isSuperhost === 'true',
      isInstantBook: isInstantBook === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching housing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch housing' });
  }
});

// Get housing listing by ID
app.get('/api/housing/:id', (req, res) => {
  try {
    const listing = housingService.getById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch listing' });
  }
});

// Search housing
app.get('/api/housing/search', (req, res) => {
  try {
    const { q, guests, limit, offset } = req.query;
    const listings = housingService.search({
      query: q as string,
      guests: guests ? parseInt(guests as string) : undefined,
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error searching housing:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// Check availability
app.get('/api/housing/:id/availability', (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, error: 'Check-in and check-out dates required' });
    }
    const available = housingService.checkAvailability(
      req.params.id,
      checkIn as string,
      checkOut as string
    );
    res.json({ success: true, data: { available } });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, error: 'Failed to check availability' });
  }
});

// Create booking
app.post('/api/housing/:id/book', (req, res) => {
  try {
    const { userId, checkIn, checkOut, guestCount, specialRequests, totalPrice } = req.body;
    
    if (!userId || !checkIn || !guestCount || !totalPrice) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Check availability first
    const available = housingService.checkAvailability(req.params.id, checkIn, checkOut);
    if (!available) {
      return res.status(409).json({ success: false, error: 'Dates not available' });
    }
    
    const booking = housingService.createBooking({
      user_id: userId,
      listing_id: req.params.id,
      scheduled_date: checkIn,
      total_price: totalPrice,
      guest_count: guestCount,
      special_requests: specialRequests,
    });
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nexa Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize database
  try {
    initializeDatabase();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
});

export default app;
