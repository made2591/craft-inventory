<template>
  <div class="app-container">
    <!-- Mobile Menu Button - moved outside sidebar so it's always visible -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }" v-if="isMobile">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Mobile Overlay -->
    <div v-if="isMobileMenuOpen && isMobile" class="mobile-overlay" @click="closeMobileMenu"></div>
    
    <Sidebar 
      ref="sidebar"
      :is-mobile-menu-open="isMobileMenuOpen"
      @close-mobile-menu="closeMobileMenu"
      @sidebar-toggle="handleSidebarToggle"
    />
    
    <div class="content-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <main>
        <router-view />
      </main>
      
      <footer>
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
      isMobileMenuOpen: false,
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
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      // Prevent body scroll when mobile menu is open
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    },
    handleSidebarToggle(isCollapsed) {
      this.isSidebarCollapsed = isCollapsed;
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
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1100;
  background: linear-gradient(135deg, #42b983 0%, #369970 100%);
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
}

.mobile-menu-btn.active {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
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
}

.content-wrapper {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.content-wrapper.sidebar-collapsed {
  margin-left: 70px;
}

main {
  flex: 1;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

footer {
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 0.9em;
  color: #666;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  
  .content-wrapper {
    margin-left: 0;
  }
  
  .content-wrapper.sidebar-collapsed {
    margin-left: 0;
  }
  
  main {
    padding: 80px 15px 15px 15px; /* Top padding to avoid overlap with mobile menu button */
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
  border: 1px solid #ddd;
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
  background-color: #42b983;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .content-wrapper, .content-wrapper.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>