<template>
  <div class="sidebar" :class="{ 
    'collapsed': isCollapsed && !isMobile,
    'mobile-open': isMobileMenuOpen && isMobile,
    'mobile-closed': !isMobileMenuOpen && isMobile
  }">
    <div class="sidebar-header">
      <router-link to="/" class="logo" @click="handleLogoClick">
        <span v-if="!isCollapsed || isMobile">{{ $t('app.title') }}</span>
        <span v-else>CI</span>
      </router-link>
      <button 
        v-if="!isMobile" 
        class="toggle-btn" 
        @click="toggleSidebar"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
      </button>
      <button 
        v-if="isMobile" 
        class="close-btn" 
        @click="closeMobileMenu"
        aria-label="Close menu"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-menu">
        <router-link to="/" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.dashboard') : ''" @click="handleMenuItemClick">
          <i class="fas fa-home"></i>
          <span v-if="!isCollapsed || isMobile">{{ $t('navigation.dashboard') }}</span>
        </router-link>
        
        <!-- Sezione Inventario -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('inventory')" :title="isCollapsed && !isMobile ? $t('navigation.inventory') : ''">
            <i class="fas fa-warehouse"></i>
            <span v-if="!isCollapsed || isMobile">{{ $t('navigation.inventory') }}</span>
            <i v-if="!isCollapsed || isMobile" :class="['fas', sections.inventory ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.inventory || (isCollapsed && !isMobile)">
            <router-link to="/materials" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.materials') : ''" @click="handleMenuItemClick">
              <i class="fas fa-box"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.materials') }}</span>
            </router-link>
            
            <router-link to="/components" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.components') : ''" @click="handleMenuItemClick">
              <i class="fas fa-cogs"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.components') }}</span>
            </router-link>
            
            <router-link to="/models" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.products') : ''" @click="handleMenuItemClick">
              <i class="fas fa-cubes"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.products') }}</span>
            </router-link>
            
            <router-link to="/inventory" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.inventory') : ''" @click="handleMenuItemClick">
              <i class="fas fa-dolly-flatbed"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.inventory') }}</span>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Contatti -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('contacts')" :title="isCollapsed && !isMobile ? $t('navigation.contacts') : ''">
            <i class="fas fa-address-book"></i>
            <span v-if="!isCollapsed || isMobile">{{ $t('navigation.contacts') }}</span>
            <i v-if="!isCollapsed || isMobile" :class="['fas', sections.contacts ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.contacts || (isCollapsed && !isMobile)">
            <router-link to="/suppliers" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.suppliers') : ''" @click="handleMenuItemClick">
              <i class="fas fa-truck"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.suppliers') }}</span>
            </router-link>
            
            <router-link to="/customers" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.customers') : ''" @click="handleMenuItemClick">
              <i class="fas fa-users"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.customers') }}</span>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Transazioni -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('transactions')" :title="isCollapsed && !isMobile ? $t('navigation.transactions') : ''">
            <i class="fas fa-exchange-alt"></i>
            <span v-if="!isCollapsed || isMobile">{{ $t('navigation.transactions') }}</span>
            <i v-if="!isCollapsed || isMobile" :class="['fas', sections.transactions ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.transactions || (isCollapsed && !isMobile)">
            <router-link to="/transactions" class="menu-item" :title="isCollapsed && !isMobile ? $t('transactions.allTransactions') : ''" @click="handleMenuItemClick">
              <i class="fas fa-list"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('transactions.allTransactions') }}</span>
            </router-link>
            
            <router-link to="/transactions/new" class="menu-item" :title="isCollapsed && !isMobile ? $t('transactions.newTransaction') : ''" @click="handleMenuItemClick">
              <i class="fas fa-plus-circle"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('transactions.newTransaction') }}</span>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Sistema -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('system')" :title="isCollapsed && !isMobile ? $t('navigation.system') : ''">
            <i class="fas fa-cogs"></i>
            <span v-if="!isCollapsed || isMobile">{{ $t('navigation.system') }}</span>
            <i v-if="!isCollapsed || isMobile" :class="['fas', sections.system ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.system || (isCollapsed && !isMobile)">
            <router-link to="/settings" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.settings') : ''" @click="handleMenuItemClick">
              <i class="fas fa-cog"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.settings') }}</span>
            </router-link>
            <router-link to="/database" class="menu-item" :title="isCollapsed && !isMobile ? $t('navigation.database') : ''" @click="handleMenuItemClick">
              <i class="fas fa-database"></i>
              <span v-if="!isCollapsed || isMobile">{{ $t('navigation.database') }}</span>
            </router-link>
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
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: false,
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
      if (this.isMobile) return;
      
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
      this.$emit('sidebar-toggle', this.isCollapsed);
    },
    toggleSection(section) {
      if (!this.isCollapsed || this.isMobile) {
        this.sections[section] = !this.sections[section];
      }
    },
    closeMobileMenu() {
      this.$emit('close-mobile-menu');
    },
    handleLogoClick() {
      if (this.isMobile) {
        this.closeMobileMenu();
      }
    },
    handleMenuItemClick() {
      if (this.isMobile) {
        this.closeMobileMenu();
      }
    }
  },
  created() {
    // Recupera lo stato dal localStorage solo per desktop
    if (!this.isMobile) {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        this.isCollapsed = savedState === 'true';
      }
    }
  },
  watch: {
    isMobile(newVal) {
      if (newVal) {
        // Reset collapsed state on mobile
        this.isCollapsed = false;
      } else {
        // Restore saved state on desktop
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
          this.isCollapsed = savedState === 'true';
        }
      }
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: var(--oxford-blue);
  color: var(--snow);
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar.mobile-closed {
  transform: translateX(-100%);
  width: 280px;
}

.sidebar.mobile-open {
  transform: translateX(0);
  width: 280px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--oxford-blue-light);
  min-height: 60px;
}

.logo {
  color: var(--fulvous);
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.toggle-btn,
.close-btn {
  background: none;
  border: none;
  color: var(--snow);
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.toggle-btn:hover,
.close-btn:hover {
  background-color: var(--oxford-blue-light);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu {
  padding: 10px 0;
}

.menu-section {
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.section-header:hover {
  background-color: var(--oxford-blue-light);
}

.section-header i:first-child {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.section-header span {
  flex: 1;
}

.section-items {
  padding-left: 15px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: var(--snow);
  text-decoration: none;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 2px 0;
}

.menu-item:hover {
  background-color: var(--oxford-blue-light);
}

.menu-item.router-link-active {
  background-color: var(--fulvous);
  color: var(--oxford-blue);
}

.menu-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.collapsed .menu-item {
  justify-content: center;
  padding: 10px 0;
}

.collapsed .menu-item i {
  margin-right: 0;
}

.collapsed .section-header {
  justify-content: center;
  padding: 10px 0;
}

.collapsed .section-header i:first-child {
  margin-right: 0;
}

.collapsed .section-items {
  padding-left: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    height: 100vh;
    position: fixed;
    z-index: 1001;
  }
  
  .sidebar.collapsed {
    width: 280px;
  }
  
  .sidebar.mobile-closed {
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar-header {
    justify-content: space-between;
    padding: 15px 20px;
  }
  
  .logo {
    font-size: 1.3rem;
  }
  
  .toggle-btn {
    display: none;
  }
  
  .close-btn {
    display: flex;
  }
  
  .menu-item, .section-header {
    padding: 12px 20px;
    font-size: 16px;
  }
  
  .section-items {
    padding-left: 20px;
  }
  
  .section-items .menu-item {
    padding: 10px 20px;
  }
}
</style>