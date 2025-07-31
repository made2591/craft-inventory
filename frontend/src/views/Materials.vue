<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">{{ $t('materials.title') }}</h1>
      <div class="flex flex-md-col gap-4 justify-between items-center">
        <router-link to="/materials/new" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ $t('materials.newMaterial') }}
        </router-link>
        <button @click="refreshMaterials" class="btn btn-secondary" :disabled="loading">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            {{ $t('common.updating') }}
          </div>
          <span v-else>
            <i class="fas fa-sync-alt"></i>
            {{ $t('materials.refreshMaterials') }}
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
              :placeholder="$t('materials.searchPlaceholder')" 
              @input="filterMaterials"
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
    
    <div v-else-if="materials.length === 0" class="card text-center">
      <div class="text-muted">
        <i class="fas fa-cube text-2xl"></i>
        <p class="text-lg">{{ $t('materials.noMaterialsFound') }}</p>
      </div>
    </div>
    <div v-else class="materials-content">
      <!-- Desktop Table View -->
      <div class="table-responsive hidden-mobile">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('sku')" class="sortable cursor-pointer">
                {{ $t('materials.sku') }}
                <i v-if="sortKey === 'sku'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('name')" class="sortable cursor-pointer">
                {{ $t('materials.name') }}
                <i v-if="sortKey === 'name'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('description')" class="sortable cursor-pointer">
                {{ $t('materials.description') }}
                <i v-if="sortKey === 'description'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('quantity')" class="sortable cursor-pointer">
                {{ $t('materials.quantity') }}
                <i v-if="sortKey === 'quantity'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('unitCost')" class="sortable cursor-pointer">
                {{ $t('materials.unitCost') }}
                <i v-if="sortKey === 'unitCost'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th>{{ $t('common.totalValue') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in paginatedMaterials" :key="material.id" :class="{ 'low-stock': material.quantity <= material.minStock }">
              <td class="font-medium">
                <router-link :to="`/materials/${material.id}/view`" class="text-primary font-medium">
                  {{ material.sku }}
                </router-link>
              </td>
              <td class="font-medium">{{ material.name || '-' }}</td>
              <td class="text-muted">{{ material.description || '-' }}</td>
              <td>
                <span class="quantity-badge" :class="{ 'low-stock': material.quantity <= material.minStock }">
                  {{ material.quantity || 0 }}
                </span>
                <span v-if="material.minStock" class="text-sm text-muted ml-2">
                  (min: {{ material.minStock }})
                </span>
              </td>
              <td class="font-medium">{{ formatCurrency(material.unitCost) }}</td>
              <td class="font-medium text-accent">{{ formatCurrency((material.quantity || 0) * (material.unitCost || 0)) }}</td>
              <td>
                <ActionMenu 
                  :actions="getMaterialActions(material)" 
                  @action="handleMaterialAction($event, material)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="mobile-cards visible-mobile">
        <div v-for="material in paginatedMaterials" :key="material.id" class="material-card" :class="{ 'low-stock': material.quantity <= material.minStock }">
          <div class="card-header">
            <div class="card-title">
              <router-link :to="`/materials/${material.id}/view`" class="text-primary font-bold">
                {{ material.sku }}
              </router-link>
              <span v-if="material.quantity <= material.minStock" class="low-stock-indicator">
                <i class="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <div class="card-actions">
              <ActionMenu 
                :actions="getMaterialActions(material)" 
                @action="handleMaterialAction($event, material)"
              />
            </div>
          </div>
          <div class="card-body">
            <div class="card-info">
              <div class="info-item">
                <strong>{{ $t('materials.name') }}:</strong>
                <span>{{ material.name || '-' }}</span>
              </div>
              <div class="info-item" v-if="material.description">
                <strong>{{ $t('materials.description') }}:</strong>
                <span>{{ material.description }}</span>
              </div>
              <div class="info-item">
                <strong>{{ $t('materials.quantity') }}:</strong>
                <span class="quantity-badge" :class="{ 'low-stock': material.quantity <= material.minStock }">
                  {{ material.quantity || 0 }}
                </span>
                <span v-if="material.minStock" class="text-sm text-muted ml-2">
                  (min: {{ material.minStock }})
                </span>
              </div>
              <div class="info-item">
                <strong>{{ $t('materials.unitCost') }}:</strong>
                <span class="font-medium">{{ formatCurrency(material.unitCost) }}</span>
              </div>
              <div class="info-item">
                <strong>{{ $t('common.totalValue') }}:</strong>
                <span class="font-medium text-accent">{{ formatCurrency((material.quantity || 0) * (material.unitCost || 0)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <div class="pagination">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="btn btn-sm btn-outline"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <template v-for="page in visiblePages" :key="page">
            <button 
              v-if="page !== '...'"
              @click="goToPage(page)" 
              :class="['btn', 'btn-sm', page === currentPage ? 'btn-primary' : 'btn-outline']"
            >
              {{ page }}
            </button>
            <span v-else class="pagination-dots">...</span>
          </template>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="btn btn-sm btn-outline"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="pagination-info">
          {{ $t('common.showing') }} {{ startItem }} - {{ endItem }} {{ $t('common.of') }} {{ filteredMaterials.length }} {{ $t('common.items') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import materialService from '../services/materialService';
import ActionMenu from '../components/ActionMenu.vue';

export default {
  name: 'MaterialsView',
  components: {
    ActionMenu
  },
  data() {
    return {
      materials: [],
      filteredMaterials: [],
      loading: true,
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
      return Math.ceil(this.filteredMaterials.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredMaterials.length ? this.filteredMaterials.length : end;
    },
    paginatedMaterials() {
      return this.filteredMaterials.slice(this.startIndex, this.endIndex);
    },
    startItem() {
      return this.startIndex + 1;
    },
    endItem() {
      return this.endIndex;
    },
    visiblePages() {
      const pages = [];
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    }
  },
  created() {
    this.fetchMaterials();
  },
  methods: {
    async fetchMaterials() {
      this.loading = true;
      this.error = null;

      try {
        const response = await materialService.getAllMaterials();
        this.materials = response.data;

        // Compatibilità con i nomi dei campi
        this.materials = this.materials.map(material => {
          return {
            ...material,
            unitOfMeasure: material.unitOfMeasure || material.unit_of_measure || '',
            unitCost: material.unitCost || material.unit_cost || material.costPerUnit || material.cost_per_unit || 0,
            quantity: material.quantity || material.currentStock || material.current_stock || 0,
            minStock: material.minStock || material.minStockLevel || material.min_stock_level || null
          };
        });

        this.filterMaterials();
      } catch (error) {
        console.error('Error fetching materials:', error);
        this.error = 'Si è verificato un errore durante il recupero dei materiali. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },

    filterMaterials() {
      if (!this.searchQuery) {
        this.filteredMaterials = [...this.materials];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredMaterials = this.materials.filter(material =>
          (material.name && material.name.toLowerCase().includes(query)) ||
          (material.sku && material.sku.toLowerCase().includes(query)) ||
          (material.description && material.description.toLowerCase().includes(query)) ||
          (material.unitOfMeasure && material.unitOfMeasure.toLowerCase().includes(query))
        );
      }

      this.sortMaterials();
      this.currentPage = 1;
    },

    sortMaterials() {
      const key = this.sortKey;
      const order = this.sortOrder;

      this.filteredMaterials.sort((a, b) => {
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

      this.sortMaterials();
    },

    updatePagination() {
      this.currentPage = 1;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    async refreshMaterials() {
      await this.fetchMaterials();
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '-';
      const num = parseFloat(value);
      if (isNaN(num)) return '-';
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(num);
    },

    deleteMaterial(material) {
      if (!confirm(`Sei sicuro di voler eliminare il materiale "${material.name}"?`)) {
        return;
      }
      
      this.deleteMaterialById(material.id);
    },

    async deleteMaterialById(id) {
      try {
        await materialService.deleteMaterial(id);
        this.materials = this.materials.filter(m => m.id !== id);
        this.filterMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Si è verificato un errore durante l\'eliminazione del materiale.');
      }
    },

    getMaterialActions(material) {
      return [
        {
          key: 'view',
          label: this.$t('common.view'),
          icon: 'fas fa-eye',
          variant: 'default',
          tooltip: 'View material details'
        },
        {
          key: 'edit',
          label: this.$t('common.edit'),
          icon: 'fas fa-edit',
          variant: 'primary',
          tooltip: 'Edit material'
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          icon: 'fas fa-trash',
          variant: 'danger',
          tooltip: 'Delete material'
        }
      ];
    },

    handleMaterialAction(actionKey, material) {
      switch (actionKey) {
        case 'view':
          this.$router.push(`/materials/${material.id}/view`);
          break;
        case 'edit':
          this.$router.push(`/materials/${material.id}/edit`);
          break;
        case 'delete':
          this.deleteMaterial(material);
          break;
      }
    }
  }
};
</script>

<style scoped>
/* Page Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* Controls and Layout */
.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
}

/* Cards and Forms */
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-light);
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--secondary);
  box-shadow: 0 0 0 3px rgba(226, 132, 19, 0.1);
}

.text-muted {
  color: var(--text-muted);
}

.btn-primary {
  background: var(--secondary);
  color: white;
}

.btn-primary:hover {
  background: var(--fulvous-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(226, 132, 19, 0.3);
}

.btn-secondary {
  background: var(--oxford-blue-muted);
  color: white;
}

.btn-secondary:hover {
  background: var(--oxford-blue-light);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text-primary);
}

.btn-outline:hover {
  background: var(--secondary);
  border-color: var(--secondary);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: var(--cardinal);
  transform: translateY(-1px);
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table thead {
  background: linear-gradient(135deg, var(--snow-dark) 0%, var(--border-light) 100%);
}

.table th {
  padding: 1rem;
  font-weight: 600;
  text-align: left;
  color: var(--text-primary);
  border: none;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.table th.sortable:hover {
  background: var(--border);
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.95rem;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background: var(--snow-dark);
}

/* Low Stock Styling - Now highlighting normal stock instead */
.table tbody tr {
  background: transparent;
}

.table tbody tr:not(.low-stock) {
  background: var(--fulvous-lighter);
}

.table tbody tr:not(.low-stock):hover {
  background: rgba(253, 244, 230, 0.7);
}

.quantity-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  background: rgba(226, 132, 19, 0.1);
  color: var(--secondary);
  border: 1px solid rgba(226, 132, 19, 0.2);
}

.quantity-badge.low-stock {
  background: rgba(222, 60, 75, 0.1);
  color: var(--danger);
  border: 1px solid rgba(222, 60, 75, 0.3);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
}

.material-card {
  background: var(--surface);
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-light);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.material-card:not(.low-stock) {
  border-left: 4px solid var(--fulvous-lighter);
  background: var(--fulvous-lighter);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.low-stock-indicator {
  color: var(--danger);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-body {
  padding: 1.5rem;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
}

.info-item:last-child {
  border-bottom: none;
}

/* Text Utilities */
.text-primary {
  color: var(--secondary) !important;
  font-weight: 600;
}

.text-accent {
  color: var(--accent) !important;
}

.text-danger {
  color: var(--danger) !important;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.875rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-3xl {
  font-size: 1.875rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.ml-1 {
  margin-left: 0.25rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

/* Loading and Spinner */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--border);
  border-top: 2px solid var(--secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-dots {
  padding: 0.5rem;
  color: var(--text-muted);
}

.pagination-info {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 992px) {
  .flex-md-col {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .hidden-mobile {
    display: none !important;
  }
  
  .visible-mobile {
    display: block !important;
  }
  
  .mobile-cards {
    display: block !important;
  }

  .page-header {
    gap: 1rem;
  }
  
  .flex-md-col {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
}
</style>
