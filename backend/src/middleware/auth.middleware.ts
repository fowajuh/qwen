import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User type (in production, import from your user model)
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

// ============================================
// JWT STRATEGY
// ============================================

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  algorithms: ['HS256'],
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done: VerifiedCallback) => {
    try {
      // In production, fetch user from database
      // This is a placeholder - replace with actual DB query
      const user: User = {
        id: payload.id,
        email: payload.email,
        name: 'User',
        role: payload.role || 'user',
      };

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// ============================================
// LOCAL STRATEGY (for email/password login)
// ============================================

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: VerifiedCallback) => {
      try {
        // In production, fetch user from database by email
        // This is a placeholder - replace with actual DB query
        const user: User & { passwordHash?: string } = {
          id: '1',
          email: email,
          name: 'Test User',
          passwordHash: await bcrypt.hash('testpassword', 12),
        };

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash || '');
        
        if (!isValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        // Remove password from returned user
        const { passwordHash, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// ============================================
// SERIALIZE/DESERIALIZE
// ============================================

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  // In production, fetch user from database
  const user: User = {
    id,
    email: `${id}@example.com`,
    name: 'User',
  };
  done(null, user);
});

// ============================================
// AUTH MIDDLEWARE
// ============================================

export const authenticate = (options?: any) => {
  return passport.authenticate('jwt', { session: false, ...options });
};

export const authenticateLocal = () => {
  return passport.authenticate('local', { session: false });
};

export const requireAuth = (req: any, res: any, next: any) => {
  authenticate()(req, res, (err: any) => {
    if (err || !req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    next();
  });
};

export const requireRole = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

export default passport;
