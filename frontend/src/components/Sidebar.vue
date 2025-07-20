<template>
  <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <router-link to="/" class="logo">
        <span v-if="!isCollapsed">Craft Inventory</span>
        <span v-else>CI</span>
      </router-link>
      <button class="toggle-btn" @click="toggleSidebar">
        <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
      </button>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-menu">
        <router-link to="/" class="menu-item" :title="isCollapsed ? 'Home' : ''">
          <i class="fas fa-home"></i>
          <span v-if="!isCollapsed">Home</span>
        </router-link>
        
        <!-- Sezione Inventario -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('inventory')" :title="isCollapsed ? 'Inventario' : ''">
            <i class="fas fa-warehouse"></i>
            <span v-if="!isCollapsed">Inventario</span>
            <i v-if="!isCollapsed" :class="['fas', sections.inventory ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.inventory || isCollapsed">
            <router-link to="/materials" class="menu-item" :title="isCollapsed ? 'Materiali' : ''">
              <i class="fas fa-box"></i>
              <span v-if="!isCollapsed">Materiali</span>
            </router-link>
            
            <router-link to="/models" class="menu-item" :title="isCollapsed ? 'Modelli' : ''">
              <i class="fas fa-cubes"></i>
              <span v-if="!isCollapsed">Modelli</span>
            </router-link>
            
            <router-link to="/inventory" class="menu-item" :title="isCollapsed ? 'Magazzino' : ''">
              <i class="fas fa-dolly-flatbed"></i>
              <span v-if="!isCollapsed">Magazzino</span>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Contatti -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('contacts')" :title="isCollapsed ? 'Contatti' : ''">
            <i class="fas fa-address-book"></i>
            <span v-if="!isCollapsed">Contatti</span>
            <i v-if="!isCollapsed" :class="['fas', sections.contacts ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.contacts || isCollapsed">
            <router-link to="/suppliers" class="menu-item" :title="isCollapsed ? 'Fornitori' : ''">
              <i class="fas fa-truck"></i>
              <span v-if="!isCollapsed">Fornitori</span>
            </router-link>
            
            <router-link to="/customers" class="menu-item" :title="isCollapsed ? 'Clienti' : ''">
              <i class="fas fa-users"></i>
              <span v-if="!isCollapsed">Clienti</span>
            </router-link>
          </div>
        </div>
        
        <!-- Sezione Transazioni -->
        <div class="menu-section">
          <div class="section-header" @click="toggleSection('transactions')" :title="isCollapsed ? 'Transazioni' : ''">
            <i class="fas fa-exchange-alt"></i>
            <span v-if="!isCollapsed">Transazioni</span>
            <i v-if="!isCollapsed" :class="['fas', sections.transactions ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
          </div>
          
          <div class="section-items" v-if="sections.transactions || isCollapsed">
            <router-link to="/transactions" class="menu-item" :title="isCollapsed ? 'Tutte le Transazioni' : ''">
              <i class="fas fa-list"></i>
              <span v-if="!isCollapsed">Tutte le Transazioni</span>
            </router-link>
            
            <router-link to="/transactions/new" class="menu-item" :title="isCollapsed ? 'Nuova Transazione' : ''">
              <i class="fas fa-plus-circle"></i>
              <span v-if="!isCollapsed">Nuova Transazione</span>
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
  data() {
    return {
      isCollapsed: false,
      sections: {
        inventory: true,
        contacts: true,
        transactions: true
      }
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // Salva lo stato nel localStorage
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    },
    toggleSection(section) {
      if (!this.isCollapsed) {
        this.sections[section] = !this.sections[section];
      }
    }
  },
  created() {
    // Recupera lo stato dal localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #2c3e50;
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #3c546c;
}

.logo {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
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
  background-color: #3c546c;
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
  color: #fff;
  text-decoration: none;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 2px 0;
}

.menu-item:hover {
  background-color: #3c546c;
}

.menu-item.router-link-active {
  background-color: #42b983;
  color: #fff;
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
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .sidebar.collapsed {
    width: 100%;
  }
  
  .sidebar-header {
    justify-content: center;
  }
  
  .toggle-btn {
    display: none;
  }
  
  .menu-item, .section-header {
    padding: 10px;
  }
  
  .section-items {
    padding-left: 10px;
  }
}
</style>