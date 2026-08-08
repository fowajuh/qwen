import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import dotenv from 'dotenv';
import { pool, checkDatabaseHealth, closePool } from './config/database.pg.js';
import { redis, cache } from './config/redis.js';
import { requestIdMiddleware, securityHeaders, corsConfig } from './middleware/security.middleware.js';
import { validate } from './middleware/validation.middleware.js';
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
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ENHANCED HEALTH CHECK - Verify dependencies
// ============================================
app.get('/health', async (req, res) => {
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
// API ROUTES - SCOUTING SYSTEM
// ============================================

import { getScoutingService } from './services/scouting.service.js';

// Scouting endpoint - scan area and return real businesses/housing
app.post('/api/scout/scan', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5 } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude and longitude are required' 
      });
    }

    const scoutingService = getScoutingService();
    const result = await scoutingService.scanAndReturn(parseFloat(lat), parseFloat(lng), parseFloat(radiusKm));

    res.json({
      success: true,
      data: {
        businesses: result.businesses,
        housingListings: result.housingListings,
        metadata: {
          scanDurationMs: result.scanDurationMs,
          location: { lat, lng },
          radiusKm,
        }
      }
    });
  } catch (error) {
    console.error('Error in scout scan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scan location',
      details: (error as Error).message 
    });
  }
});

// Get nearby businesses from database
app.get('/api/scout/businesses', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5, limit = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude and longitude are required' 
      });
    }

    const scoutingService = getScoutingService();
    const businesses = await scoutingService.getNearbyBusinesses(
      parseFloat(lat as string), 
      parseFloat(lng as string), 
      parseFloat(radiusKm as string),
      parseInt(limit as string)
    );

    res.json({ success: true, data: businesses });
  } catch (error) {
    console.error('Error fetching nearby businesses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch businesses' 
    });
  }
});

// Get nearby housing from database
app.get('/api/scout/housing', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5, limit = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude and longitude are required' 
      });
    }

    const scoutingService = getScoutingService();
    const housing = await scoutingService.getNearbyHousing(
      parseFloat(lat as string), 
      parseFloat(lng as string), 
      parseFloat(radiusKm as string),
      parseInt(limit as string)
    );

    res.json({ success: true, data: housing });
  } catch (error) {
    console.error('Error fetching nearby housing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch housing' 
    });
  }
});

// Agent status endpoint
app.get('/api/scout/agents', async (req, res) => {
  try {
    const scoutingService = getScoutingService();
    const orchestrator = (scoutingService as any).orchestrator;
    
    res.json({
      success: true,
      data: {
        agents: orchestrator.getAgentNames(),
        status: orchestrator.getAgentStatus(),
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get agent status' 
    });
  }
});

// Business routes with caching
app.get('/api/businesses', async (req, res) => {
  try {
    const cacheKey = `businesses:${JSON.stringify(req.query)}`;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }
    
    // Fetch from database (placeholder - implement with your business service)
    const businesses = []; // Replace with actual DB query
    
    // Cache for 5 minutes
    await cache.set(cacheKey, businesses, 300);
    
    res.json({ success: true, data: businesses, fromCache: false });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch businesses' });
  }
});

// Housing routes with caching
app.get('/api/housing', async (req, res) => {
  try {
    const cacheKey = `housing:${JSON.stringify(req.query)}`;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }
    
    // Fetch from database (placeholder - implement with your housing service)
    const listings = []; // Replace with actual DB query
    
    // Cache for 5 minutes
    await cache.set(cacheKey, listings, 300);
    
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching housing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch housing' });
  }
});

// Messages API routes
app.use('/api/messages', messagesRoutes);

// Profile API routes
app.use('/api/profile', profileRoutes);

// Scout API routes
app.use('/api/scout', scoutRoutes);

// ==================== ERROR HANDLING ====================

// Centralized error handler with proper logging
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
