<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">{{ $t('components.title') }}</h1>
      <div class="flex flex-md-col gap-4 justify-between items-center">
        <router-link to="/components/new" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ $t('components.newComponent') }}
        </router-link>
        <button @click="recalculateAllCosts" class="btn btn-secondary" :disabled="isRecalculating">
          <div v-if="isRecalculating" class="loading">
            <div class="spinner"></div>
            {{ $t('components.recalculating') }}
          </div>
          <span v-else>
            <i class="fas fa-calculator"></i>
            {{ $t('components.recalculateAllCosts') }}
          </span>
        </button>
      </div>
    </div>
    
    <!-- Controls Card -->
    <div class="card">
      <div class="flex flex-md-col gap-4 justify-between items-center">
        <div class="form-group flex-1" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-search text-muted"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="$t('components.searchPlaceholder')" 
              @input="filterComponents"
              class="form-input"
              style="margin: 0;"
            >
          </div>
        </div>
        <div class="flex items-center gap-2">
          <label for="itemsPerPage" class="form-label text-sm" style="margin: 0;">{{ $t('common.itemsPerPage') }}:</label>
          <select id="itemsPerPage" v-model="itemsPerPage" @change="updatePagination" class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="card text-center">
      <div class="loading">
        <div class="spinner"></div>
        {{ $t('common.loading') }}
      </div>
    </div>
    
    <div v-else-if="error" class="card text-center">
      <div class="text-danger">
        <i class="fas fa-exclamation-triangle"></i>
        {{ error }}
      </div>
    </div>
    
    <div v-else-if="components.length === 0" class="card text-center">
      <div class="text-muted">
        <i class="fas fa-cogs text-2xl"></i>
        <p class="text-lg">{{ $t('components.noComponentsFound') }}</p>
      </div>
    </div>
    <div v-else class="components-content">
      <!-- Desktop Table View -->
      <div class="table-responsive hidden-mobile">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('sku')" class="sortable cursor-pointer">
                {{ $t('components.sku') }}
                <i v-if="sortKey === 'sku'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('name')" class="sortable cursor-pointer">
                {{ $t('components.name') }}
                <i v-if="sortKey === 'name'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('description')" class="sortable cursor-pointer">
                {{ $t('components.description') }}
                <i v-if="sortKey === 'description'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('quantity')" class="sortable cursor-pointer">
                {{ $t('components.quantity') }}
                <i v-if="sortKey === 'quantity'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th>{{ $t('common.totalCost') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in paginatedComponents" :key="component.id">
              <td class="font-medium">
                <router-link :to="`/components/${component.id}/view`" class="text-primary font-medium">
                  {{ component.sku || $t('common.notApplicable') }}
                </router-link>
              </td>
              <td class="font-medium">{{ component.name }}</td>
              <td>{{ component.description || $t('common.notApplicable') }}</td>
              <td>
                <span class="badge badge-info">
                  <i class="fas fa-cubes mr-1"></i>
                  {{ $formatQuantity(component.quantity || 0) }}
                </span>
              </td>
              <td>
                <span v-if="loadingCosts[component.id]" class="text-muted">
                  <i class="fas fa-spinner fa-spin mr-1"></i>
                  {{ $t('common.calculating') }}...
                </span>
                <span v-else-if="componentCosts[component.id] !== undefined" class="font-bold">
                  {{ $formatCost(componentCosts[component.id]) }}
                </span>
                <button v-else @click="loadComponentCost(component.id)" class="btn btn-sm btn-secondary">
                  <i class="fas fa-calculator mr-1"></i>
                  {{ $t('common.calculateCost') }}
                </button>
              </td>
              <td>
                <ActionMenu 
                  :actions="getComponentActions(component)" 
                  @action="handleComponentAction($event, component)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="visible-mobile">
        <div class="grid gap-4">
          <div v-for="component in paginatedComponents" :key="component.id" class="card">
            <div class="flex justify-between items-start mb-3">
              <div>
                <router-link :to="`/components/${component.id}/view`" class="text-lg font-bold text-primary">
                  {{ component.name }}
                </router-link>
                <p class="text-sm text-muted">{{ $t('common.sku') }}: {{ component.sku || $t('common.notApplicable') }}</p>
              </div>
              <div class="text-right">
                <span class="badge badge-info">
                  <i class="fas fa-cubes mr-1"></i>
                  {{ $formatQuantity(component.quantity || 0) }}
                </span>
              </div>
            </div>
            
            <div class="grid gap-3 mb-4">
              <div v-if="component.description">
                <p class="text-xs text-muted font-medium">{{ $t('components.description') }}</p>
                <p class="text-sm">{{ component.description }}</p>
              </div>
              <div>
                <p class="text-xs text-muted font-medium">{{ $t('common.totalCost') }}</p>
                <div v-if="loadingCosts[component.id]" class="text-muted">
                  <i class="fas fa-spinner fa-spin mr-1"></i>
                  {{ $t('common.calculating') }}...
                </div>
                <div v-else-if="componentCosts[component.id] !== undefined" class="font-bold">
                  {{ $formatCost(componentCosts[component.id]) }}
                </div>
                <button v-else @click="loadComponentCost(component.id)" class="btn btn-sm btn-secondary">
                  <i class="fas fa-calculator mr-1"></i>
                  {{ $t('common.calculateCost') }}
                </button>
              </div>
            </div>
            
            <div class="mobile-actions">
              <ActionMenu 
                :actions="getComponentActions(component)" 
                @action="handleComponentAction($event, component)"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="card">
        <div class="flex flex-md-col gap-4 justify-between items-center">
          <div class="flex items-center gap-2">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-secondary btn-sm">
              <i class="fas fa-chevron-left"></i>
              <span class="hidden-mobile">{{ $t('common.previous') }}</span>
            </button>

            <div class="flex gap-1">
              <button 
                v-for="page in visiblePages" 
                :key="page" 
                @click="goToPage(page)"
                :class="['btn', 'btn-sm', currentPage === page ? 'btn-primary' : 'btn-secondary']"
              >
                {{ page }}
              </button>
            </div>

            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-secondary btn-sm">
              <span class="hidden-mobile">{{ $t('common.next') }}</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="text-sm text-muted text-center">
            {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredComponents.length }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import componentService from '../services/componentService';
import ActionMenu from '../components/ActionMenu.vue';

export default {
  name: 'ComponentsView',
  components: {
    ActionMenu
  },
  data() {
    return {
      components: [],
      filteredComponents: [],
      componentCosts: {}, // Memorizza i costi dei componenti
      loadingCosts: {}, // Tiene traccia dello stato di caricamento per ogni componente
      loading: true,
      isRecalculating: false, // Stato di ricalcolo di tutti i costi
      error: null,
      searchQuery: '',
      sortKey: 'name',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredComponents.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredComponents.length ? this.filteredComponents.length : end;
    },
    paginatedComponents() {
      return this.filteredComponents.slice(this.startIndex, this.endIndex);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = window.innerWidth < 768 ? 3 : 7;
      const half = Math.floor(maxVisible / 2);
      
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },
  created() {
    this.fetchComponents();
  },
  methods: {
    async fetchComponents() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await componentService.getAllComponents();
        this.components = response.data;
        this.filterComponents();
        
        // Calcola automaticamente i costi per tutti i componenti
        this.calculateAllComponentCosts();
      } catch (error) {
        console.error('Error fetching components:', error);
        this.error = this.$t('errors.fetchComponents');
      } finally {
        this.loading = false;
      }
    },
    
    async calculateAllComponentCosts() {
      // Calcola i costi per tutti i componenti visualizzati
      for (const component of this.components) {
        await this.loadComponentCost(component.id);
      }
    },
    
    async recalculateAllCosts() {
      if (this.isRecalculating) return;
      
      this.isRecalculating = true;
      
      try {
        // Resetta tutti i costi
        this.componentCosts = {};
        
        // Ricalcola i costi per tutti i componenti visualizzati
        for (const component of this.components) {
          await this.loadComponentCost(component.id);
        }
      } catch (error) {
        console.error('Error recalculating costs:', error);
        alert(this.$t('errors.recalculateCosts'));
      } finally {
        this.isRecalculating = false;
      }
    },
    
    async loadComponentCost(componentId) {
      // Imposta lo stato di caricamento per questo componente
      this.loadingCosts = { 
        ...this.loadingCosts, 
        [componentId]: true 
      };
      
      try {
        const response = await componentService.getComponentCost(componentId);
        // In Vue 3, possiamo usare l'assegnazione diretta per proprietà reattive
        this.componentCosts = { 
          ...this.componentCosts, 
          [componentId]: response.data.totalCost 
        };
      } catch (error) {
        console.error('Error fetching component cost:', error);
        this.componentCosts = { 
          ...this.componentCosts, 
          [componentId]: this.$t('common.error')
        };
      } finally {
        // Rimuovi lo stato di caricamento per questo componente
        this.loadingCosts = { 
          ...this.loadingCosts, 
          [componentId]: false 
        };
      }
    },
    
    filterComponents() {
      if (!this.searchQuery) {
        this.filteredComponents = [...this.components];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredComponents = this.components.filter(component => {
          // Cerca in tutti i campi noti, anche nascosti
          return [
            component.sku,
            component.name,
            component.description,
            component.quantity,
            this.componentCosts[component.id],
            component.id
          ].some(field => {
            if (field === null || field === undefined) return false;
            return String(field).toLowerCase().includes(query);
          });
        });
      }
      this.sortComponents();
      this.currentPage = 1;
    },
    
    sortComponents() {
      const key = this.sortKey;
      const order = this.sortOrder;
      
      this.filteredComponents.sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];
        
        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = '';
        if (valueB === null || valueB === undefined) valueB = '';
        
        // Compare based on type
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return order === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        } else {
          return order === 'asc' 
            ? valueA - valueB 
            : valueB - valueA;
        }
      });
    },
    
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      
      this.sortComponents();
    },
    
    updatePagination() {
      this.currentPage = 1;
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    getComponentActions(component) {
      return [
        {
          key: 'view',
          label: this.$t('common.view'),
          icon: 'fas fa-eye',
          variant: 'default',
          tooltip: 'View component details'
        },
        {
          key: 'edit',
          label: this.$t('common.edit'),
          icon: 'fas fa-edit',
          variant: 'primary',
          tooltip: 'Edit component'
        },
        {
          key: 'duplicate',
          label: this.$t('common.duplicate'),
          icon: 'fas fa-copy',
          variant: 'default',
          tooltip: 'Duplicate component'
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          icon: 'fas fa-trash',
          variant: 'danger',
          tooltip: 'Delete component'
        }
      ];
    },

    handleComponentAction(actionKey, component) {
      switch (actionKey) {
        case 'view':
          this.$router.push(`/components/${component.id}/view`);
          break;
        case 'edit':
          this.$router.push(`/components/${component.id}`);
          break;
        case 'duplicate':
          this.duplicateComponent(component);
          break;
        case 'delete':
          this.deleteComponent(component.id);
          break;
      }
    },

    duplicateComponent(component) {
      // Navigate to create form with pre-filled data
      this.$router.push({
        path: '/components/new',
        query: { duplicate: component.id }
      });
    },
    async deleteComponent(id) {
      if (!confirm(this.$t('confirmations.deleteComponent'))) {
        return;
      }
      try {
        await componentService.deleteComponent(id);
        this.components = this.components.filter(c => c.id !== id);
        this.filterComponents();
      } catch (error) {
        console.error('Error deleting component:', error);
        if (error.response && error.response.status === 400) {
          alert(this.$t('errors.componentInUse'));
        } else {
          alert(this.$t('errors.deleteComponent'));
        }
      }
    }
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f1f3f4;
}

.components-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cursor-pointer {
  cursor: pointer;
}

.sortable:hover {
  background-color: #f8f9fa !important;
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}

/* Mobile specific styles */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  .components-content {
    gap: 16px;
  }
  
  .card {
    padding: 16px;
  }
  
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-group .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

/* Loading animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.3s ease-out;
}

/* Hover effects */
.card:hover {
  transform: translateY(-2px);
}

.btn:hover {
  transform: translateY(-1px);
}

/* Focus states for accessibility */
.btn:focus,
.form-input:focus,
.form-select:focus {
  outline: 2px solid #42b983;
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

/* Print styles */
@media print {
  .btn, .pagination, .page-header .flex, .mobile-actions {
    display: none !important;
  }
  
  .card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

.components {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
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

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px; /* Altezza fissa per i pulsanti */
  line-height: 20px; /* Allineamento verticale del testo */
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}

.btn-active {
  background-color: #42b983;
  color: white;
}

.sku-link {
  color: #3498db;
  text-decoration: none;
}

.sku-link:hover {
  text-decoration: underline;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error {
  color: #dc3545;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-filter input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-controls label {
  margin-right: 8px;
}

.pagination-controls select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  vertical-align: middle; /* Allineamento verticale al centro */
  height: 44px; /* Altezza fissa per tutte le celle */
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

th.sortable {
  cursor: pointer;
  position: relative;
}

th.sortable:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
  margin: 0; /* Reset del margine */
  padding: 0; /* Reset del padding */
  justify-content: center; /* Centra orizzontalmente */
  align-items: center; /* Allineamento verticale */
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 10px;
}

.page-numbers {
  display: flex;
  gap: 5px;
  margin: 0 10px;
}

.pagination-info {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.loading-cost {
  display: flex;
  align-items: center;
  color: #6c757d;
  font-size: 14px;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Stili per il menu azioni a tre puntini */
.actions-menu-row {
  position: absolute;
  right: 12px;
  bottom: 8px;
  display: flex;
  align-items: flex-end;
  z-index: 20;
}
.menu-dropdown {
  position: absolute;
  right: 0;
  bottom: 36px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
  z-index: 30;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 18px 16px;
  gap: 14px;
}
.menu-dropdown .btn {
  margin: 0;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border-radius: 8px;
  background: none;
  color: #222;
  font-size: 16px;
  font-weight: 500;
  box-shadow: none;
  border: none;
  transition: box-shadow 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  min-height: 40px;
}
.menu-dropdown .btn:hover {
  background: #f5f5f5;
  box-shadow: 0 2px 8px rgba(66,185,131,0.12);
  color: #222;
}
.menu-dropdown .btn-danger {
  color: #dc3545;
}
.menu-dropdown .btn-danger:hover {
  background: #fbeaea;
  box-shadow: 0 2px 8px rgba(220,53,69,0.12);
}
.menu-dropdown .btn-view {
  color: #17a2b8;
}
.menu-dropdown .btn-edit {
  color: #3498db;
}
.menu-dropdown .btn-view:hover {
  background: #e6f7fa;
  box-shadow: 0 2px 8px rgba(23,162,184,0.12);
}
.menu-dropdown .btn-edit:hover {
  background: #eaf4fb;
  box-shadow: 0 2px 8px rgba(52,152,219,0.12);
}
</style>