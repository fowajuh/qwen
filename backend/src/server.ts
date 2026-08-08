import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import dotenv from 'dotenv';
import { checkDatabaseHealth, closePool } from './config/database.pg.js';
import { redis, cache } from './config/redis.js';
import { requestIdMiddleware, corsConfig } from './middleware/security.middleware.js';

import authRoutes from './routes/auth.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import { scoutRoutes } from './routes/scout.routes.js';
import { profileRoutes } from './routes/profile.routes.js';

// Validate environment variables BEFORE anything else
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// SECURITY FIRST - Apply before any routes
// ============================================

// Request ID tracking for debugging
app.use(requestIdMiddleware);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.resend.com'],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS with proper allowlist configuration
app.use(cors(corsConfig()));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: { 
    success: false, 
    error: 'Too many requests, please try again later',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000) + ' seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: { 
    success: false, 
    error: 'Too many authentication attempts, please try again in an hour',
  },
});
app.use('/api/auth/', authLimiter);

// Passport middleware
app.use(passport.initialize());

// Body parser with size limit (prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ENHANCED HEALTH CHECK - Verify dependencies
// ============================================
app.get('/health', async (_req, res) => {
  const healthStatus = {
    status: 'ok' as 'ok' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'checking',
      redis: 'checking',
      memory: {} as any
    }
  };
  
  try {
    // Check PostgreSQL connectivity
    const dbHealthy = await checkDatabaseHealth();
    healthStatus.checks.database = dbHealthy ? 'connected' : 'disconnected';
    if (!dbHealthy) healthStatus.status = 'degraded';
  } catch (error) {
    healthStatus.checks.database = 'error';
    healthStatus.status = 'degraded';
  }
  
  // Check Redis connectivity
  try {
    const redisHealthy = await cache.healthCheck();
    healthStatus.checks.redis = redisHealthy ? 'connected' : 'disconnected';
    if (!redisHealthy) healthStatus.status = 'degraded';
  } catch (error) {
    healthStatus.checks.redis = 'not configured';
  }
  
  // Check memory usage
  const memUsage = process.memoryUsage();
  healthStatus.checks.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
  };
  
  // Determine status code
  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// ============================================
// API ROUTES
// ============================================
//
// FIX: this block used to define app.post('/api/scout/scan', ...) and
// app.get('/api/scout/businesses' | '/housing' | '/agents', ...) INLINE,
// hand-rolled, calling the Postgres-backed scouting.service.ts (which talks
// to a database this app never configures — no DATABASE_URL by default) —
// and THEN, a few lines later, also did `app.use('/api/scout', scoutRoutes)`.
// Express resolves routes in registration order, so the inline handlers
// above always won and scoutRoutes (the real, working, SQLite-backed
// implementation) was silent dead code a second time over, even after it
// was created. There is now exactly one implementation of each endpoint.
//
// FIX: `authRoutes` was imported at the top of this file but never mounted
// with `app.use(...)` anywhere. Registration and login had NO route at
// all — every signup/login request 404'd before it method).
app.use('/api/auth', authRoutes);

// Messages API routes
app.use('/api/messages', messagesRoutes);

// Profile API routes
app.use('/api/profile', profileRoutes);

// Scout API routes (real Google Places scan + SQLite-backed reads — see
// scout.routes.ts for why SQLite and not the Postgres path)
app.use('/api/scout', scoutRoutes);

// FIX: these two endpoints previously always returned `[]` — literally
// `const businesses = []; // Replace with actual DB query` — meaning
// /api/businesses and /api/housing could never return real data no matter
// what was in the database. They now read from the same SQLite services
// everything else in the app uses.
import { businessService } from './services/business.service.js';
import { housingService } from './services/housing.service.js';

app.get('/api/businesses', async (req, res) => {
  try {
    const { lat, lng, radiusKm = '10', category, city, q } = req.query;
    const cacheKey = `businesses:${JSON.stringify(req.query)}`;

    const cached = await cache.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    let businesses;
    if (lat && lng) {
      businesses = businessService.getNearby(parseFloat(lat as string), parseFloat(lng as string), parseFloat(radiusKm as string));
    } else if (q) {
      businesses = businessService.search(q as string);
    } else {
      businesses = businessService.getAll({ category: category as string, city: city as string });
    }

    await cache.set(cacheKey, businesses, 300).catch(() => {});
    res.json({ success: true, data: businesses, fromCache: false });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch businesses' });
  }
});

app.get('/api/housing', async (req, res) => {
  try {
    const { lat, lng, radiusKm = '20', city } = req.query;
    const cacheKey = `housing:${JSON.stringify(req.query)}`;

    const cached = await cache.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const listings = lat && lng
      ? housingService.getNearby(parseFloat(lat as string), parseFloat(lng as string), parseFloat(radiusKm as string))
      : housingService.getAll({ city: city as string });

    await cache.set(cacheKey, listings, 300).catch(() => {});
    res.json({ success: true, data: listings, fromCache: false });
  } catch (error) {
    console.error('Error fetching housing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch housing' });
  }
});

// ==================== ERROR HANDLING ====================

// Centralized error handler with proper logging
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = res.locals.requestId || 'unknown';
  
  // Log full error details for debugging
  console.error(`[Error] [${requestId}] ${err.name}: ${err.message}`);
  console.error(err.stack);
  
  // Determine appropriate status code
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorMessage = 'Resource not found';
  }
  
  // Never expose internal errors in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    ...(isDev && { details: err.message }),
    requestId
  });
});

// 404 handler - must be last middleware
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connections
    try {
      await closePool();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
    
    // Close Redis connection
    try {
      await redis.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis:', error);
    }
    
    process.exit(0);
  });
  
  // Force close after timeout
  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Nexa Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Helmet CSP enabled, Rate limiting active`);
  console.log(`💾 Database: PostgreSQL (pool max: ${process.env.PG_POOL_MAX || 20})`);
  console.log(`📦 Cache: Redis ${process.env.REDIS_URL ? 'configured' : 'not configured'}`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  }
  console.error('Server error:', error);
  process.exit(1);
});

export default app;
