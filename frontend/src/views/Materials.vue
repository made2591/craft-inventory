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
        <i class="fas fa-box-open text-2xl"></i>
        <p class="text-lg">{{ $t('materials.noMaterialsFound') }}</p>
      </div>
    </div>

    <div v-else class="materials-content">
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
              <th @click="sortBy('unitOfMeasure')" class="sortable cursor-pointer">
                {{ $t('materials.unitOfMeasure') }}
                <i v-if="sortKey === 'unitOfMeasure'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('costPerUnit')" class="sortable cursor-pointer">
                {{ $t('materials.costPerUnit') }}
                <i v-if="sortKey === 'costPerUnit'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('currentStock')" class="sortable cursor-pointer">
                {{ $t('materials.currentStock') }}
                <i v-if="sortKey === 'currentStock'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('minStockLevel')" class="sortable cursor-pointer">
                {{ $t('materials.minStockLevel') }}
                <i v-if="sortKey === 'minStockLevel'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in paginatedMaterials" :key="material.id" :class="{ 'low-stock-row': isLowStock(material) }">
              <td>
                <router-link :to="`/materials/${material.id}/view`" class="text-primary font-medium">
                  {{ material.sku || 'N/A' }}
                </router-link>
              </td>
              <td class="font-medium">{{ material.name }}</td>
              <td>{{ material.unitOfMeasure }}</td>
              <td class="font-medium">{{ $formatCost(material.costPerUnit) }}</td>
              <td>
                <span :class="{ 'text-warning': isLowStock(material) }">
                  {{ $formatQuantity(material.currentStock !== undefined && material.currentStock !== null ? material.currentStock : 0) }} {{ material.unitOfMeasure }}
                </span>
                <span v-if="isLowStock(material)" class="badge badge-warning ml-2">
                  <i class="fas fa-exclamation-triangle"></i>
                  Low Stock
                </span>
              </td>
              <td>{{ material.minStockLevel ? $formatQuantity(material.minStockLevel) : 'N/A' }}</td>
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
      <div class="visible-mobile">
        <div class="grid gap-4">
          <div v-for="material in paginatedMaterials" :key="material.id" class="card" :class="{ 'low-stock-card': isLowStock(material) }">
            <div class="flex justify-between items-start mb-3">
              <div>
                <router-link :to="`/materials/${material.id}/view`" class="text-lg font-bold text-primary">
                  {{ material.name }}
                </router-link>
                <p class="text-sm text-muted">SKU: {{ material.sku || 'N/A' }}</p>
              </div>
              <div v-if="isLowStock(material)" class="badge badge-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Low Stock
              </div>
            </div>
            
            <div class="grid grid-2 gap-3 mb-4">
              <div>
                <p class="text-xs text-muted font-medium">{{ $t('materials.unitOfMeasure') }}</p>
                <p class="font-medium">{{ material.unitOfMeasure }}</p>
              </div>
              <div>
                <p class="text-xs text-muted font-medium">{{ $t('materials.costPerUnit') }}</p>
                <p class="font-medium">{{ $formatCost(material.costPerUnit) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted font-medium">{{ $t('materials.currentStock') }}</p>
                <p class="font-medium" :class="{ 'text-warning': isLowStock(material) }">
                  {{ $formatQuantity(material.currentStock !== undefined && material.currentStock !== null ? material.currentStock : 0) }} {{ material.unitOfMeasure }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted font-medium">{{ $t('materials.minStockLevel') }}</p>
                <p class="font-medium">{{ material.minStockLevel ? $formatQuantity(material.minStockLevel) : 'N/A' }}</p>
              </div>
            </div>
            
            <div class="mobile-actions">
              <ActionMenu 
                :actions="getMaterialActions(material)" 
                @action="handleMaterialAction($event, material)"
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
            {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredMaterials.length }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import materialService from '../services/materialService';
import ActionMenu from '../components/ActionMenu.vue';

export default {
  components: {
    ActionMenu
  },
  name: 'MaterialsView',
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
      itemsPerPage: 10,
      openMenuId: null // Per il menu azioni
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
            // Assicurati che i campi siano disponibili in camelCase
            unitOfMeasure: material.unitOfMeasure || material.unit_of_measure || '',
            costPerUnit: material.costPerUnit || material.cost_per_unit || 0,
            currentStock: material.currentStock || material.current_stock || 0,
            minStockLevel: material.minStockLevel || material.min_stock_level || null
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
          material.name.toLowerCase().includes(query) ||
          material.description?.toLowerCase().includes(query) ||
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

    isLowStock(material) {
      if (!material.minStockLevel) return false;

      // Converti i valori in numeri per assicurarsi che il confronto sia numerico
      const currentStock = parseFloat(material.currentStock);
      const minStockLevel = parseFloat(material.minStockLevel);

      // Verifica che entrambi i valori siano numeri validi
      if (isNaN(currentStock) || isNaN(minStockLevel)) return false;

      // Un materiale è considerato "low stock" solo quando la quantità disponibile è INFERIORE al livello minimo
      return currentStock < minStockLevel;
    },

    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },

    handleClickOutside(event) {
      if (this.openMenuId !== null) {
        const menus = document.querySelectorAll('.menu-dropdown');
        let clickedInside = false;
        menus.forEach(menu => {
          if (menu.contains(event.target)) {
            clickedInside = true;
          }
        });
        if (!clickedInside) {
          this.openMenuId = null;
        }
      }
    },

    viewMaterial(id) {
      this.$router.push(`/materials/${id}/view`);
      this.openMenuId = null;
    },

    editMaterial(id) {
      this.$router.push(`/materials/${id}`);
      this.openMenuId = null;
    },

    async deleteMaterial(id) {
      if (!confirm('Sei sicuro di voler eliminare questo materiale?')) {
        return;
      }
      try {
        await this.$api.delete(`/api/materials/${id}`);
        this.materials = this.materials.filter(m => m.id !== id);
        this.filterMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Si è verificato un errore durante l\'eliminazione del materiale.');
      }
      this.openMenuId = null;
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
          key: 'duplicate',
          label: this.$t('common.duplicate'),
          icon: 'fas fa-copy',
          variant: 'default',
          tooltip: 'Duplicate material'
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
          this.viewMaterial(material.id);
          break;
        case 'edit':
          this.editMaterial(material.id);
          break;
        case 'duplicate':
          this.duplicateMaterial(material);
          break;
        case 'delete':
          this.deleteMaterial(material.id);
          break;
      }
    },

    duplicateMaterial(material) {
      // Navigate to create form with pre-filled data
      this.$router.push({
        path: '/materials/new',
        query: { duplicate: material.id }
      });
    },

    async refreshMaterials() {
      await this.fetchMaterials();
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f1f3f4;
}

.materials-content {
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

.low-stock-row {
  background-color: #fff8e1 !important;
}

.low-stock-card {
  border-left: 4px solid #ff9800;
  background: linear-gradient(to right, #fff8e1, #ffffff);
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
  
  .materials-content {
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

/* Status indicators */
.text-warning {
  color: #f57c00 !important;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
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
</style>