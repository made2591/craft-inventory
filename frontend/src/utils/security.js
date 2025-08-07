import DOMPurify from 'dompurify';
import { z } from 'zod';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';

/**
 * Security utility functions for frontend protection
 */

// Request rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;

/**
 * Rate limiter for API calls
 */
export const rateLimiter = {
  canMakeRequest(endpoint) {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / RATE_LIMIT_WINDOW)}`;
    
    const count = requestCounts.get(key) || 0;
    if (count >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    requestCounts.set(key, count + 1);
    
    // Cleanup old entries
    for (const [mapKey] of requestCounts) {
      const keyTime = parseInt(mapKey.split('_').pop()) * RATE_LIMIT_WINDOW;
      if (now - keyTime > RATE_LIMIT_WINDOW) {
        requestCounts.delete(mapKey);
      }
    }
    
    return true;
  },

  getRemainingRequests(endpoint) {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / RATE_LIMIT_WINDOW)}`;
    const count = requestCounts.get(key) || 0;
    return Math.max(0, MAX_REQUESTS_PER_MINUTE - count);
  }
};

/**
 * Input sanitization
 */
export const sanitizer = {
  sanitizeHtml(dirty) {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:(?!image\/(png|jpe?g|gif|svg))/gi, '');
  },

  sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? this.sanitizeInput(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = this.sanitizeInput(key);
      sanitized[cleanKey] = this.sanitizeObject(value);
    }
    return sanitized;
  }
};

/**
 * Input validation schemas
 */
export const validators = {
  // Common field validators
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_\.]+$/),
  description: z.string().max(500),
  price: z.number().min(0).max(999999.99),
  quantity: z.number().int().min(0),
  email: z.string().email(),
  url: z.string().url().optional().or(z.literal('')),
  sku: z.string().min(1).max(50).regex(/^[A-Z0-9\-]+$/),

  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).max(1000).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    sortBy: z.string().max(50).default('id'),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
  }),

  // Component validation
  component: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    sku: z.string().min(1).max(50).regex(/^[A-Z0-9\-]+$/),
    price: z.number().min(0).max(999999.99),
    supplier_id: z.number().int().positive().optional(),
    category: z.string().max(50).optional()
  }),

  // Material validation
  material: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.string().max(50),
    price: z.number().min(0).max(999999.99),
    supplier_id: z.number().int().positive().optional(),
    link: z.string().url().optional().or(z.literal(''))
  }),

  // Inventory validation
  inventory: z.object({
    component_id: z.number().int().positive(),
    quantity: z.number().int().min(0),
    location: z.string().max(100).optional(),
    notes: z.string().max(500).optional()
  }),

  // Supplier validation
  supplier: z.object({
    name: z.string().min(1).max(100),
    contact_email: z.string().email().optional().or(z.literal('')),
    contact_phone: z.string().max(20).optional(),
    address: z.string().max(200).optional(),
    website: z.string().url().optional().or(z.literal(''))
  }),

  // Customer validation
  customer: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(20).optional(),
    address: z.string().max(200).optional()
  })
};

/**
 * Validation helper functions
 */
export const validation = {
  validate(schema, data) {
    try {
      return {
        success: true,
        data: schema.parse(sanitizer.sanitizeObject(data))
      };
    } catch (error) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
  },

  validateAndThrow(schema, data) {
    const result = this.validate(schema, data);
    if (!result.success) {
      const error = new Error('Validation failed');
      error.validationErrors = result.errors;
      throw error;
    }
    return result.data;
  }
};

/**
 * Debounced and throttled functions for performance
 */
export const performanceUtils = {
  createDebouncedSearch: (searchFn, delay = 300) => 
    debounce(searchFn, delay),
  
  createThrottledApiCall: (apiFn, delay = 1000) =>
    throttle(apiFn, delay, { leading: true, trailing: false }),
    
  createThrottledScroll: (scrollFn, delay = 100) =>
    throttle(scrollFn, delay)
};

/**
 * Security headers and CSP utilities
 */
export const security = {
  // Generate nonce for inline scripts/styles
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  // Validate file upload types
  validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
    return allowedTypes.includes(file.type);
  },

  // Validate file size
  validateFileSize(file, maxSizeBytes = 5 * 1024 * 1024) { // 5MB default
    return file.size <= maxSizeBytes;
  },

  // Check if running in secure context
  isSecureContext() {
    return window.isSecureContext;
  },

  // Simple XSS protection for user input display
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

/**
 * Error handling utilities
 */
export const errorHandler = {
  // Sanitize error messages to prevent information disclosure
  sanitizeError(error) {
    const safeError = {
      message: 'An error occurred',
      code: 'UNKNOWN_ERROR'
    };

    // Only expose specific safe error types
    if (error.response?.status === 400) {
      safeError.message = 'Invalid request data';
      safeError.code = 'VALIDATION_ERROR';
    } else if (error.response?.status === 401) {
      safeError.message = 'Authentication required';
      safeError.code = 'AUTH_ERROR';
    } else if (error.response?.status === 403) {
      safeError.message = 'Access denied';
      safeError.code = 'PERMISSION_ERROR';
    } else if (error.response?.status === 404) {
      safeError.message = 'Resource not found';
      safeError.code = 'NOT_FOUND';
    } else if (error.response?.status === 429) {
      safeError.message = 'Too many requests';
      safeError.code = 'RATE_LIMIT';
    } else if (error.response?.status >= 500) {
      safeError.message = 'Server error';
      safeError.code = 'SERVER_ERROR';
    }

    return safeError;
  },

  // Log errors securely (without sensitive data)
  logError(error, context = {}) {
    const sanitizedError = this.sanitizeError(error);
    const logData = {
      ...sanitizedError,
      timestamp: new Date().toISOString(),
      context: sanitizer.sanitizeObject(context)
    };

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      console.error('Error logged:', logData);
      // Could integrate with services like Sentry here
    } else {
      console.error('Development error:', error, context);
    }
  }
};

export default {
  rateLimiter,
  sanitizer,
  validators,
  validation,
  performanceUtils,
  security,
  errorHandler
};
