<template>
  <div class="app-container">
    <Sidebar />
    
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
      isSidebarCollapsed: false
    };
  },
  created() {
    // Controlla lo stato della sidebar
    window.addEventListener('storage', this.handleStorageChange);
    this.checkSidebarState();
    
    // Imposta la lingua corrente
    document.querySelector('html').setAttribute('lang', this.$i18n.locale);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    checkSidebarState() {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        this.isSidebarCollapsed = savedState === 'true';
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
}

.content-wrapper {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.content-wrapper.sidebar-collapsed {
  margin-left: 60px;
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