import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

// Check if kiosk mode is enabled
const isKioskMode = process.env.KIOSK_MODE === 'true'
console.log('🏪 Build-time Kiosk Mode:', isKioskMode, '(from KIOSK_MODE env var:', process.env.KIOSK_MODE, ')')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Bundle analyzer for production builds
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  define: {
    // Make kiosk mode available to the frontend at build time
    __KIOSK_MODE__: JSON.stringify(isKioskMode),
    // Also provide it as a standard environment variable accessible in frontend
    __VITE_KIOSK_MODE__: JSON.stringify(isKioskMode ? 'true' : 'false'),
    // Define global constants for security
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: process.env.NODE_ENV === 'development'
  },

  // Security-focused build configuration
  build: {
    // Enable source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minification settings for security
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        // Remove dead code
        dead_code: true,
        // Remove unused variables
        unused: true
      },
      mangle: {
        // Obfuscate variable names
        properties: {
          regex: /^_private/
        }
      },
      format: {
        // Remove comments
        comments: false
      }
    },

    // Rollup options for additional security
    rollupOptions: {
      output: {
        // Obfuscate chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        // Obfuscate asset names
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
        
        // Manual chunk splitting for better caching and security
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['axios', 'lodash.debounce', 'lodash.throttle'],
          'security': ['dompurify', 'zod', 'js-cookie']
        }
      }
    },

    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    
    // Enable tree shaking
    target: 'esnext'
  },

  // Security headers for dev server
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Add security headers to proxied requests
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-Forwarded-Proto', 'http');
            proxyReq.setHeader('X-Real-IP', req.ip);
          });
        }
      }
    },
    
    // Security headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:8080"
    }
  },

  // CSS configuration
  css: {
    preprocessorOptions: {
      // Add security-focused CSS settings if using SCSS/LESS
    }
  }
})