import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// ============================================
// VALIDATION RULES
// ============================================

export const validateBusinessId: ValidationChain = param('id')
  .isInt({ min: 1 })
  .withMessage('Invalid business ID');

export const validateBusinessSlug: ValidationChain = param('slug')
  .isString()
  .trim()
  .notEmpty()
  .withMessage('Business slug is required');

export const validateSearchQuery: ValidationChain = query('q')
  .optional()
  .isString()
  .trim()
  .isLength({ max: 200 })
  .withMessage('Search query too long (max 200 chars)');

export const validatePagination: ValidationChain[] = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
];

export const validateLocationQuery: ValidationChain[] = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Radius must be between 0.1 and 50 km'),
];

export const validateBookingRequest: ValidationChain[] = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date format'),
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-out date format'),
  body('guestCount')
    .notEmpty()
    .withMessage('Guest count is required')
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1'),
  body('totalPrice')
    .notEmpty()
    .withMessage('Total price is required')
    .isFloat({ min: 0 })
    .withMessage('Total price must be non-negative'),
  body('specialRequests')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Special requests too long (max 1000 chars)'),
];

export const validateRegistration: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters'),
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path as string,
        message: err.msg,
        value: 'value' in err ? err.value : undefined,
      })),
    });
    return;
  }
  
  next();
};

// ============================================
// SANITIZATION HELPERS
// ============================================

export const sanitizeString = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Max length
};

export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .slice(0, 5000);
};

export default validate;
