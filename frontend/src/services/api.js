import axios from 'axios';
import Cookies from 'js-cookie';
import { rateLimiter, errorHandler, sanitizer } from '../utils/security.js';

// Create axios instance with secure defaults
const api = axios.create({
  baseURL: '',  // Usa URL relativo per funzionare con il proxy di Vite
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Request interceptor for authentication and security
api.interceptors.request.use(
  (config) => {
    // Rate limiting check
    const endpoint = config.url?.split('?')[0] || '';
    if (!rateLimiter.canMakeRequest(endpoint)) {
      const error = new Error('Rate limit exceeded');
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.remainingRequests = rateLimiter.getRemainingRequests(endpoint);
      return Promise.reject(error);
    }

    // Add auth token if available
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = Cookies.get('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Sanitize request data
    if (config.data) {
      config.data = sanitizer.sanitizeObject(config.data);
    }

    // Add request timestamp for monitoring
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    errorHandler.logError(error, { stage: 'request_interceptor' });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (import.meta.env.DEV) {
      const duration = Date.now() - response.config.metadata?.startTime;
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  (error) => {
    // Handle different error types
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error';
    }

    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        Cookies.remove('auth_token');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Handle CSRF token errors
      if (status === 403 && data?.message?.includes('CSRF')) {
        // Try to refresh CSRF token
        Cookies.remove('csrf_token');
      }

      // Add response data to error
      error.data = data;
    }

    // Log error securely
    errorHandler.logError(error, { 
      endpoint: error.config?.url,
      method: error.config?.method 
    });

    console.error('API Error:', error.response);
    return Promise.reject(errorHandler.sanitizeError(error));
  }
);

// Secure API helper functions
export const apiHelpers = {
  // GET request with optional caching
  async get(url, params = {}, options = {}) {
    try {
      const response = await api.get(url, { 
        params: sanitizer.sanitizeObject(params),
        ...options 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // POST request with validation
  async post(url, data = {}, options = {}) {
    try {
      const response = await api.post(url, sanitizer.sanitizeObject(data), options);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // PUT request with validation
  async put(url, data = {}, options = {}) {
    try {
      const response = await api.put(url, sanitizer.sanitizeObject(data), options);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // DELETE request
  async delete(url, options = {}) {
    try {
      const response = await api.delete(url, options);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // File upload with validation
  async uploadFile(url, file, options = {}) {
    // Validate file before upload
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only images and PDFs are allowed.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Handle errors consistently
  handleError(error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return {
        success: false,
        message: `Rate limit exceeded. Try again in a minute. Remaining requests: ${error.remainingRequests}`,
        code: 'RATE_LIMIT'
      };
    }

    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR'
    };
  },

  // Check API health
  async healthCheck() {
    try {
      const response = await api.get('/health', {}, { timeout: 5000 });
      return { healthy: true, ...response.data };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
};

export default api;