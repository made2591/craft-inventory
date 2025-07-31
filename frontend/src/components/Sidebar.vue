<template>
  <div class="sidebar" :class="{ 
    'collapsed': isCollapsed, 
    'mobile-open': isMobileMenuOpen,
    'mobile-closed': !isMobileMenuOpen 
  }">
    <div class="sidebar-header">
      <router-link to="/" class="logo" @click="$emit('close-mobile-menu')" v-if="!isCollapsed">
        <div class="logo-text">
          <span class="logo-title">{{ $t('app.title') }}</span>
          <span class="logo-subtitle">Inventory</span>
        </div>
      </router-link>
      
      <!-- Collapsed state: logo becomes expand button -->
      <div class="logo collapsed-logo" @click="toggleSidebar" v-if="isCollapsed" :title="'Expand sidebar'">
        <div class="logo-icon">
          <i class="fas fa-cube"></i>
        </div>
      </div>
      
      <button class="toggle-btn desktop-only" @click="toggleSidebar" :title="'Collapse sidebar'" v-if="!isCollapsed">
        <i class="fas fa-angle-left"></i>
      </button>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-menu">
        <!-- Dashboard -->
        <router-link to="/" class="menu-item dashboard-item" :title="isCollapsed ? $t('navigation.dashboard') : ''" @click="$emit('close-mobile-menu')">
          <div class="menu-icon">
            <i class="fas fa-home"></i>
          </div>
          <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.dashboard') }}</span>
          <div class="menu-indicator"></div>
        </router-link>
        
        <!-- Sezione Inventario -->
        <div class="menu-section">
          <div 
            class="section-header" 
            @click="handleSectionClick('inventory')" 
            :title="isCollapsed ? $t('navigation.inventory') : ''"
            :class="{ 'clickable': !isCollapsed }"
          >
            <div class="section-icon">
              <i class="fas fa-warehouse"></i>
            </div>
            <span class="section-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.inventory') }}</span>
            <i v-if="!isCollapsed || isMobile" class="section-chevron" :class="['fas', sections.inventory ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.inventory || isCollapsed">
            <router-link to="/materials" class="menu-item" :title="isCollapsed ? $t('navigation.materials') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-box"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.materials') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
            
            <router-link to="/components" class="menu-item" :title="isCollapsed ? $t('navigation.components') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-cogs"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.components') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
            
            <router-link to="/models" class="menu-item" :title="isCollapsed ? $t('navigation.models') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-cubes"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.models') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
            
            <router-link to="/inventory" class="menu-item" :title="isCollapsed ? $t('navigation.inventory') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-dolly-flatbed"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.inventory') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Contatti -->
        <div class="menu-section">
          <div 
            class="section-header" 
            @click="handleSectionClick('contacts')" 
            :title="isCollapsed ? $t('navigation.contacts') : ''"
            :class="{ 'clickable': !isCollapsed }"
          >
            <div class="section-icon">
              <i class="fas fa-address-book"></i>
            </div>
            <span class="section-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.contacts') }}</span>
            <i v-if="!isCollapsed || isMobile" class="section-chevron" :class="['fas', sections.contacts ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.contacts || isCollapsed">
            <router-link to="/suppliers" class="menu-item" :title="isCollapsed ? $t('navigation.suppliers') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-truck"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.suppliers') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
            
            <router-link to="/customers" class="menu-item" :title="isCollapsed ? $t('navigation.customers') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-users"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.customers') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Transazioni -->
        <div class="menu-section">
          <div 
            class="section-header" 
            @click="handleSectionClick('transactions')" 
            :title="isCollapsed ? $t('navigation.transactions') : ''"
            :class="{ 'clickable': !isCollapsed }"
          >
            <div class="section-icon">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <span class="section-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.transactions') }}</span>
            <i v-if="!isCollapsed" class="section-chevron" :class="['fas', sections.transactions ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.transactions || isCollapsed">
            <router-link to="/transactions" class="menu-item" :title="isCollapsed ? $t('transactions.allTransactions') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-list"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('transactions.allTransactions') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
            
            <router-link to="/transactions/new" class="menu-item new-transaction" :title="isCollapsed ? $t('transactions.newTransaction') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('transactions.newTransaction') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Sistema -->
        <div class="menu-section">
          <div 
            class="section-header" 
            @click="handleSectionClick('system')" 
            :title="isCollapsed ? $t('navigation.system') : ''"
            :class="{ 'clickable': !isCollapsed }"
          >
            <div class="section-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <span class="section-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.system') }}</span>
            <i v-if="!isCollapsed" class="section-chevron" :class="['fas', sections.system ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.system || isCollapsed">
            <router-link to="/settings" class="menu-item" :title="isCollapsed ? $t('navigation.settings') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-cog"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.settings') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
            <router-link to="/database" class="menu-item" :title="isCollapsed ? $t('navigation.database') : ''" @click="$emit('close-mobile-menu')">
              <div class="menu-icon">
                <i class="fas fa-database"></i>
              </div>
              <span class="menu-text" v-if="!isCollapsed || isMobile">{{ $t('navigation.database') }}</span>
              <div class="menu-indicator"></div>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Sidebar Footer -->
      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="footer-info">
          <div class="app-version">
            <i class="fas fa-info-circle mr-2"></i>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    isMobileMenuOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close-mobile-menu', 'sidebar-toggle'],
  data() {
    return {
      isCollapsed: false,
      isMobile: false,
      sections: {
        inventory: true,
        contacts: true,
        transactions: true,
        system: true
      }
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
      this.$emit('sidebar-toggle', this.isCollapsed);
    },
    
    handleSectionClick(section) {
      // On collapsed desktop mode, don't allow toggling (sections are always visible)
      // On mobile or expanded desktop mode, allow toggling
      if (!this.isCollapsed || this.isMobile) {
        this.toggleSection(section);
      }
    },
    
    toggleSection(section) {
      this.sections[section] = !this.sections[section];
      // Save section states
      localStorage.setItem('sidebarSections', JSON.stringify(this.sections));
    },
    
    checkMobile() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      // Don't auto-collapse on mobile - keep text visible
      if (!this.isMobile && wasMobile) {
        // Restore previous desktop state when switching back to desktop
        const savedState = localStorage.getItem('sidebarCollapsed');
        this.isCollapsed = savedState === 'true';
      }
      
      // Emit sidebar state change
      this.$emit('sidebar-toggle', this.isCollapsed);
    },
    
    handleResize() {
      this.checkMobile();
    }
  },
  
  created() {
    // Recupera lo stato dal localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
    
    // Recupera lo stato delle sezioni
    const savedSections = localStorage.getItem('sidebarSections');
    if (savedSections) {
      try {
        this.sections = { ...this.sections, ...JSON.parse(savedSections) };
      } catch (e) {
        console.warn('Failed to parse saved sidebar sections');
      }
    }
  },
  
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  watch: {
    $route() {
      // Close mobile menu when route changes
      if (this.isMobileMenuOpen) {
        this.$emit('close-mobile-menu');
      }
    }
  }
};
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 70px;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  min-height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
}

.logo:hover {
  opacity: 0.9;
}

.collapsed-logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.collapsed-logo:hover {
  opacity: 0.9;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #42b983 0%, #369970 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1;
}

.logo-subtitle {
  font-size: 0.95rem;
  opacity: 0.7;
  font-weight: 400;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Sidebar Menu */
.sidebar-menu {
  padding: 20px 0;
  flex: 1;
}

/* Menu Sections */
.menu-section {
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.section-header.clickable {
  cursor: pointer;
}

.section-header.clickable:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.section-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.section-text {
  flex: 1;
}

.section-chevron {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.section-items {
  padding-left: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Menu Items */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin: 2px 0;
  position: relative;
  font-weight: 500;
  font-size: 1rem;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.router-link-active {
  background: linear-gradient(135deg, #42b983 0%, #369970 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.menu-item.router-link-active .menu-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.menu-item.dashboard-item.router-link-active {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.menu-item.new-transaction {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.menu-item.new-transaction:hover {
  background: rgba(231, 76, 60, 0.2);
}

.menu-item.new-transaction.router-link-active {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.menu-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.menu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 4px;
  height: 20px;
  background: #fff;
  border-radius: 2px 0 0 2px;
  opacity: 0;
  transition: all 0.3s ease;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-version {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.6;
}

/* Collapsed State */
.collapsed .section-header {
  justify-content: center;
  padding: 12px 0;
}

.collapsed .section-icon {
  margin-right: 0;
}

.collapsed .menu-item {
  justify-content: center;
  padding: 12px 0;
  border-radius: 0;
}

.collapsed .menu-icon {
  margin-right: 0;
}

.collapsed .section-items {
  padding-left: 0;
}

.collapsed .menu-indicator {
  display: none;
}

/* Desktop Only */
.desktop-only {
  display: block;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    width: 280px;
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed.mobile-open {
    transform: translateX(0);
  }
  
  /* Force show text and elements on mobile even when collapsed */
  .sidebar.collapsed .section-text,
  .sidebar.collapsed .menu-text,
  .sidebar.collapsed .section-chevron {
    display: block !important;
  }
  
  .sidebar.collapsed .section-header {
    justify-content: flex-start;
    padding: 16px 20px;
  }
  
  .sidebar.collapsed .section-icon {
    margin-right: 12px;
  }
  
  .sidebar.collapsed .menu-item {
    justify-content: flex-start;
    padding: 16px 20px;
  }
  
  .sidebar.collapsed .menu-icon {
    margin-right: 12px;
  }
  
  .sidebar.collapsed .section-items {
    padding-left: 20px;
  }
  
  .desktop-only {
    display: none;
  }
  
  .section-header {
    padding: 16px 20px;
    cursor: pointer; /* Always clickable on mobile */
  }
  
  .section-header.clickable {
    cursor: pointer;
  }
  
  .section-header:hover,
  .section-header.clickable:hover {
    background: rgba(255, 255, 255, 0.1);
    opacity: 1;
  }
  
  .menu-item {
    padding: 16px 20px;
    border-radius: 0;
  }
  
  .sidebar-header {
    padding: 16px 20px;
    min-height: 70px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
  }
  
  .sidebar-header {
    padding: 16px 20px;
  }
  
  .logo-title {
    font-size: 1.2rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-item {
  animation: slideIn 0.3s ease-out;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>