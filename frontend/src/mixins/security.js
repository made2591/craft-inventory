import { validation, validators, performanceUtils } from '@/utils/security.js';

/**
 * Security mixin for Vue components
 * Provides common security functionality across components
 */
export const securityMixin = {
  data() {
    return {
      // Form validation errors
      validationErrors: {},
      // Loading states for security
      isSecureLoading: false,
      // Rate limiting states
      rateLimitInfo: {
        remaining: 100,
        resetTime: null
      }
    };
  },

  computed: {
    /**
     * Check if form has validation errors
     */
    hasValidationErrors() {
      return Object.keys(this.validationErrors).length > 0;
    },

    /**
     * Get validation error message for a field
     */
    getValidationError() {
      return (field) => {
        const errors = this.validationErrors[field];
        return errors && errors.length > 0 ? errors[0].message : '';
      };
    },

    /**
     * Check if rate limited
     */
    isRateLimited() {
      return this.rateLimitInfo.remaining <= 0;
    }
  },

  methods: {
    /**
     * Validate form data against schema
     */
    validateForm(schema, data) {
      const result = validation.validate(schema, data);
      
      if (result.success) {
        this.validationErrors = {};
        return result.data;
      } else {
        // Group errors by field
        this.validationErrors = result.errors.reduce((acc, error) => {
          const field = error.field || 'general';
          if (!acc[field]) acc[field] = [];
          acc[field].push(error);
          return acc;
        }, {});
        
        return null;
      }
    },

    /**
     * Clear validation errors
     */
    clearValidationErrors(field = null) {
      if (field) {
        delete this.validationErrors[field];
      } else {
        this.validationErrors = {};
      }
    },

    /**
     * Secure form submission
     */
    async secureSubmit(schema, formData, submitFn) {
      try {
        this.isSecureLoading = true;
        this.clearValidationErrors();

        // Validate form data
        const validatedData = this.validateForm(schema, formData);
        if (!validatedData) {
          return { success: false, errors: this.validationErrors };
        }

        // Submit form
        const result = await submitFn(validatedData);
        
        return { success: true, data: result };
      } catch (error) {
        // Handle rate limiting
        if (error.code === 'RATE_LIMIT') {
          this.rateLimitInfo.remaining = error.remainingRequests || 0;
          this.rateLimitInfo.resetTime = new Date(Date.now() + 60000);
        }

        // Handle validation errors from server
        if (error.validationErrors) {
          this.validationErrors = error.validationErrors.reduce((acc, err) => {
            const field = err.field || 'general';
            if (!acc[field]) acc[field] = [];
            acc[field].push({ message: err.message });
            return acc;
          }, {});
        }

        return { success: false, error: error.message || 'Submission failed' };
      } finally {
        this.isSecureLoading = false;
      }
    },

    /**
     * Secure file upload
     */
    async secureFileUpload(file, uploadFn, options = {}) {
      const {
        maxSize = 5 * 1024 * 1024, // 5MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      } = options;

      try {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
        }

        // Upload file
        const result = await uploadFn(file);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Create debounced search function
     */
    createSecureSearch(searchFn, delay = 300) {
      return performanceUtils.createDebouncedSearch(async (query) => {
        try {
          // Validate search query
          const validatedQuery = validation.validateAndThrow(
            validators.name, // Use name validator for search queries
            query
          );

          return await searchFn(validatedQuery);
        } catch (error) {
          console.error('Search error:', error);
          return [];
        }
      }, delay);
    },

    /**
     * Format data for display (with XSS protection)
     */
    secureDisplay(value, type = 'text') {
      if (value === null || value === undefined) return '';

      switch (type) {
        case 'html':
          return this.$security.sanitizer.sanitizeHtml(value);
        case 'url':
          try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol) ? value : '';
          } catch {
            return '';
          }
        case 'email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '';
        default:
          return this.$security.escapeHtml(String(value));
      }
    },

    /**
     * Check component permissions
     */
    hasPermission(permission) {
      // This would integrate with your authentication system
      // For now, return true as a placeholder
      return true;
    },

    /**
     * Log security event
     */
    logSecurityEvent(event, data = {}) {
      const logData = {
        event,
        timestamp: new Date().toISOString(),
        component: this.$options.name || 'Unknown',
        route: this.$route?.path,
        ...data
      };

      if (import.meta.env.DEV) {
        console.log('Security Event:', logData);
      }

      // In production, send to security monitoring service
      if (import.meta.env.PROD) {
        // Could integrate with security monitoring service here
      }
    }
  },

  created() {
    // Initialize rate limit info
    this.rateLimitInfo.resetTime = new Date(Date.now() + 60000);
  },

  beforeUnmount() {
    // Clean up any security-related resources
    this.clearValidationErrors();
  }
};

/**
 * Input sanitization directive
 */
export const vSanitize = {
  mounted(el, binding) {
    const sanitizeInput = (event) => {
      const value = event.target.value;
      const sanitized = binding.value?.html 
        ? DOMPurify.sanitize(value)
        : value.replace(/<[^>]*>/g, '');
      
      if (sanitized !== value) {
        event.target.value = sanitized;
        event.target.dispatchEvent(new Event('input'));
      }
    };

    el.addEventListener('input', sanitizeInput);
    el.addEventListener('paste', (event) => {
      setTimeout(() => sanitizeInput(event), 0);
    });
  }
};

/**
 * Rate limiting directive
 */
export const vRateLimit = {
  mounted(el, binding) {
    const { requests = 5, window = 60000 } = binding.value || {};
    let requestCount = 0;
    let windowStart = Date.now();

    const checkRateLimit = () => {
      const now = Date.now();
      if (now - windowStart > window) {
        requestCount = 0;
        windowStart = now;
      }

      if (requestCount >= requests) {
        el.disabled = true;
        el.title = 'Rate limit exceeded. Please wait.';
        return false;
      }

      requestCount++;
      return true;
    };

    el.addEventListener('click', (event) => {
      if (!checkRateLimit()) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }
};

export default {
  securityMixin,
  vSanitize,
  vRateLimit
};
