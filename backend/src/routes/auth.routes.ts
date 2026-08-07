import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { userService } from '../services/user.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// ============================================
// REGISTER NEW USER
// ============================================
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name required (1-100 chars)'),
    validate,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Check for existing user first (before any expensive operations)
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered',
        });
      }

      // Create user
      const user = await userService.create({ email, password, name });

      // Generate email verification token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const verificationToken = jwt.sign(
        { userId: user.id, type: 'email_verification' },
        jwtSecret,
        { expiresIn: '24h' } as SignOptions
      );

      // Send verification email (non-blocking, don't wait for response)
      emailService.sendVerificationEmail(user.email, user.id, verificationToken)
        .catch(err => console.error('Failed to send verification email:', err));

      // Generate JWT token for immediate login
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRATION || '7d' } as SignOptions
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isVerified: user.is_verified,
          },
          token,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          success: false,
          error: 'Email already registered',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to register user',
      });
    }
  }
);

// ============================================
// LOGIN
// ============================================
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .notEmpty()
      .withMessage('Password required'),
    validate,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Verify password
      const isValid = await userService.verifyPassword(user, password);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRATION || '7d' } as SignOptions
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.is_verified,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login',
      });
    }
  }
);

// ============================================
// GET CURRENT USER PROFILE
// ============================================
router.get('/me', requireAuth, async (req: any, res) => {
  try {
    const user = await userService.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
});

// ============================================
// VERIFY EMAIL
// ============================================
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded: any = jwt.verify(token, jwtSecret);

    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token',
      });
    }

    // Mark email as verified
    await userService.markEmailVerified(decoded.userId);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: 'Verification token expired',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
    });
  }
});

// ============================================
// REQUEST PASSWORD RESET
// ============================================
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    validate,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Find user (don't reveal if email exists for security)
      const user = await userService.findByEmail(email);

      if (user) {
        // Generate reset token
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const resetToken = jwt.sign(
          { userId: user.id, type: 'password_reset' },
          jwtSecret,
          { expiresIn: '1h' } as SignOptions
        );

        // Send reset email (non-blocking)
        emailService.sendPasswordResetEmail(user.email, resetToken)
          .catch(err => console.error('Failed to send password reset email:', err));
      }

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process request',
      });
    }
  }
);

// ============================================
// RESET PASSWORD
// ============================================
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    validate,
  ],
  async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      // Verify token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const decoded: any = jwt.verify(token, jwtSecret);

      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          error: 'Invalid reset token',
        });
      }

      // Update password
      await userService.updatePassword(decoded.userId, password);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          error: 'Reset token expired',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to reset password',
      });
    }
  }
);

export default router;
