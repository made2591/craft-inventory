import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { security } from './utils/security.js';

// Security configuration
const securityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'font-src': ["'self'"],
    'connect-src': ["'self'", "http://localhost:8080"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  
  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Apply security headers if running in browser
if (typeof window !== 'undefined') {
  // Check if running in secure context
  if (!security.isSecureContext() && location.protocol === 'http:' && location.hostname !== 'localhost') {
    console.warn('Application is not running in a secure context. Consider using HTTPS.');
  }

  // Set CSP if not already set by server
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const cspContent = Object.entries(securityConfig.csp)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspContent;
    document.head.appendChild(meta);
  }

  // Disable right-click context menu in production
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    });

    // Basic developer tools detection
    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;
    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.clear();
          console.warn('Developer tools detected. Application security may be compromised.');
        }
      } else {
        devtools.open = false;
      }
    };

    setInterval(checkDevTools, 500);
  }

  // Prevent iframe embedding
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
}

// Create Vue app with security-focused configuration
const app = createApp(App);

// Configure Pinia store
const pinia = createPinia();

// Security plugin for Vue
app.use({
  install(app) {
    // Global properties for security utilities
    app.config.globalProperties.$security = security;
    app.config.globalProperties.$sanitize = security.escapeHtml;
    
    // Global error handler for security
    app.config.errorHandler = (err, instance, info) => {
      // Log error securely without exposing sensitive information
      console.error('Vue Error:', {
        message: err.message,
        component: instance?.$options.name || 'Unknown',
        info: info,
        timestamp: new Date().toISOString()
      });

      // In production, send to error tracking service
      if (import.meta.env.PROD) {
        // Could integrate with error tracking service here
      }
    };

    // Global warning handler
    app.config.warnHandler = (msg, instance, trace) => {
      if (import.meta.env.DEV) {
        console.warn('Vue Warning:', msg);
      }
    };
  }
});

// Use plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Mount the app
app.mount('#app');

// Global unhandled error handling
window.addEventListener('error', (event) => {
  console.error('Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
  
  // Prevent the default behavior (logging to console)
  event.preventDefault();
});

// Security monitoring
if (import.meta.env.PROD) {
  // Monitor for potential security threats
  const securityMonitor = {
    suspiciousActivity: 0,
    lastActivity: Date.now(),
    
    checkActivity() {
      const now = Date.now();
      const timeDiff = now - this.lastActivity;
      
      // Check for rapid requests (potential bot activity)
      if (timeDiff < 100) {
        this.suspiciousActivity++;
        if (this.suspiciousActivity > 10) {
          console.warn('Suspicious activity detected');
          // Could implement rate limiting or user verification here
        }
      } else {
        this.suspiciousActivity = Math.max(0, this.suspiciousActivity - 1);
      }
      
      this.lastActivity = now;
    }
  };

  // Monitor mouse/keyboard activity
  ['click', 'keydown', 'mousemove'].forEach(event => {
    document.addEventListener(event, () => securityMonitor.checkActivity(), { passive: true });
  });
}

export default app;
