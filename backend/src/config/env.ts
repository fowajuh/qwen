import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || '4000',
  databasePath: process.env.DATABASE_PATH || './data/nexa.db',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'nexa-dev-secret-change-in-production',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  nodeEnv: process.env.NODE_ENV || 'development',
};
