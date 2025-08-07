<template>
  <div class="app-container">
    <!-- Mobile Menu Button - only visible when sidebar is closed on mobile -->
    <button 
      class="mobile-menu-btn" 
      @click="toggleMobileMenu" 
      v-if="isMobile && !isMobileMenuOpen"
      aria-label="Open menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen && isMobile" 
      class="mobile-overlay" 
      @click="closeMobileMenu"
      @touchstart="closeMobileMenu"
    ></div>
    
    <Sidebar 
      ref="sidebar"
      :is-mobile-menu-open="isMobileMenuOpen"
      :is-mobile="isMobile"
      @close-mobile-menu="closeMobileMenu"
      @sidebar-toggle="handleSidebarToggle"
    />
    
    <div class="content-wrapper" :class="{ 
      'sidebar-collapsed': isSidebarCollapsed && !isMobile,
      'mobile-mode': isMobile 
    }">
      <main class="main-content">
        <router-view />
      </main>
      
      <footer class="app-footer">
        <p>&copy; {{ new Date().getFullYear() }} - {{ $t('app.title') }}</p>
      </footer>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';

export default {
  name: 'App',
  components: {
    Sidebar
  },
  data() {
    return {
      isSidebarCollapsed: false,
      isMobileMenuOpen: false, // Start closed on mobile so hamburger is visible
      isMobile: false
    };
  },
  created() {
    // Controlla lo stato della sidebar
    window.addEventListener('storage', this.handleStorageChange);
    this.checkSidebarState();
    this.checkMobile();
    
    // Imposta la lingua corrente
    document.querySelector('html').setAttribute('lang', this.$i18n.locale);
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('resize', this.handleResize);
    document.body.style.overflow = '';
  },
  methods: {
    checkSidebarState() {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        this.isSidebarCollapsed = savedState === 'true';
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    handleResize() {
      const wasMobile = this.isMobile;
      this.checkMobile();
      
      // Close mobile menu when switching to desktop
      if (!this.isMobile && wasMobile && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
      
      // Reset sidebar state on desktop
      if (!this.isMobile && wasMobile) {
        this.checkSidebarState();
      }
    },
    toggleMobileMenu() {
      if (!this.isMobile) return;
      
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      
      // Prevent body scroll when mobile menu is open
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    },
    closeMobileMenu() {
      if (!this.isMobile) return;
      
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    },
    handleSidebarToggle(isCollapsed) {
      if (!this.isMobile) {
        this.isSidebarCollapsed = isCollapsed;
      }
    },
    handleStorageChange(event) {
      // Gestisce i cambiamenti nel localStorage
      if (event.key === 'sidebarCollapsed') {
        this.checkSidebarState();
      } else if (event.key === 'locale') {
        // Aggiorna la lingua quando cambia nel localStorage
        const newLocale = localStorage.getItem('locale') || 'it';
        this.$i18n.locale = newLocale;
        document.querySelector('html').setAttribute('lang', newLocale);
      }
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f8f9fa;
}

.app-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: flex;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1100;
  background: var(--secondary);
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(226, 132, 19, 0.3);
  transition: all 0.3s ease;
  touch-action: manipulation;
}

.mobile-menu-btn:hover {
  box-shadow: 0 6px 20px rgba(226, 132, 19, 0.4);
  background: var(--fulvous-dark);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: var(--surface);
  border-radius: 1px;
  transition: all 0.3s ease;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
  touch-action: none;
}

.content-wrapper {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 280px);
}

.content-wrapper.sidebar-collapsed {
  margin-left: 70px;
  width: calc(100% - 70px);
}

.content-wrapper.mobile-mode {
  margin-left: 0;
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 20px;
  min-height: calc(100vh - 120px);
  max-width: 100%;
  overflow-x: hidden;
}

.app-footer {
  padding: 20px;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.9em;
  color: var(--text-muted);
  margin-top: auto;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .content-wrapper,
  .content-wrapper.sidebar-collapsed {
    margin-left: 0;
    width: 100%;
  }
  
  .main-content {
    padding: 20px 15px 15px 15px;
  }
  
  .app-container {
    overflow-x: hidden;
  }
}

/* Stili comuni per i form */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background-color: var(--secondary);
  color: var(--surface);
}

.btn-secondary {
  background-color: var(--oxford-blue-muted);
  color: var(--surface);
}

.btn-danger {
  background-color: var(--danger);
  color: var(--surface);
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
  background-color: var(--snow-dark);
  border-radius: 4px;
  margin-bottom: 20px;
}

.error {
  color: var(--danger);
}

@media (max-width: 768px) {
  .content-wrapper, .content-wrapper.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>