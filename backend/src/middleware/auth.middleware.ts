import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import dotenv from 'dotenv';
import { userService } from '../services/user.service.js';

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
  algorithms: ['HS256'] as ('HS256')[],
};

passport.use(
  // SECURITY FIX: this strategy used to trust the JWT payload blindly and
  // fabricate a full user object from it without ever touching the
  // database. That means ANY validly-*signed* token authenticated as a
  // real user forever, even for a user that had since been deleted,
  // banned, or de-verified, because nothing was ever re-checked against
  // the users table. It now re-loads the user by id on every request and
  // rejects the request if that user no longer exists.
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done: VerifiedCallback) => {
    try {
      const dbUser = await userService.findById(payload.id);

      if (!dbUser) {
        return done(null, false);
      }

      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role || 'user',
      };

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
      passReqToCallback: false,
    },
    async (email: string, password: string, done: (err: any, user?: any, options?: any) => void) => {
      try {
        // SECURITY FIX: this strategy used to hardcode a fake user with a
        // bcrypt hash of the literal string "testpassword" for *any* email
        // address submitted — meaning the password "testpassword" logged
        // in as anyone, on every account, in production. It now looks the
        // user up for real and checks their actual stored hash.
        const dbUser = await userService.findByEmail(email);

        if (!dbUser) {
          return done(null, false, { message: 'User not found' });
        }

        const isValid = await userService.verifyPassword(dbUser, password);

        if (!isValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        const { password_hash, ...userWithoutPassword } = dbUser as any;
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

// FIX: messages.routes.ts and profile.routes.ts imported `{ authMiddleware }`
// from this file, but no such export existed here (only `requireAuth`,
// `authenticate`, `requireRole`). That is a compile-time `Cannot find name`
// error today, and would have been a silent `router.use(undefined)` crash
// at boot if it had ever been loosely typed enough to compile. Both route
// files now import this alias instead of a name that never existed.
export const authMiddleware = requireAuth;

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
