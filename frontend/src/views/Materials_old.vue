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
                <div class="action-buttons">
                  <router-link :to="`/materials/${material.id}/view`" class="btn btn-sm btn-outline" :title="$t('common.view')">
                    <i class="fas fa-eye"></i>
                  </router-link>
                  <router-link :to="`/materials/${material.id}/edit`" class="btn btn-sm btn-outline" :title="$t('common.edit')">
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button @click="deleteMaterial(material)" class="btn btn-sm btn-danger" :title="$t('common.delete')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
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
              <router-link :to="`/materials/${material.id}/view`" class="btn btn-sm btn-outline">
                <i class="fas fa-eye"></i>
              </router-link>
              <router-link :to="`/materials/${material.id}/edit`" class="btn btn-sm btn-outline">
                <i class="fas fa-edit"></i>
              </router-link>
              <button @click="deleteMaterial(material)" class="btn btn-sm btn-danger">
                <i class="fas fa-trash"></i>
              </button>
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
            <th @click="sortBy('name')" class="sortable">
              {{ $t('materials.name') }}
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('unitOfMeasure')" class="sortable">
              {{ $t('materials.unitOfMeasure') }}
              <span v-if="sortKey === 'unitOfMeasure'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('costPerUnit')" class="sortable">
              {{ $t('materials.costPerUnit') }}
              <span v-if="sortKey === 'costPerUnit'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('currentStock')" class="sortable">
              {{ $t('materials.currentStock') }}
              <span v-if="sortKey === 'currentStock'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('minStockLevel')" class="sortable">
              {{ $t('materials.minStockLevel') }}
              <span v-if="sortKey === 'minStockLevel'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="material in paginatedMaterials" :key="material.id" style="position:relative;">
            <td>
              <router-link :to="`/materials/${material.id}/view`" class="sku-link">
                <strong>{{ material.sku || 'N/A' }}</strong>
              </router-link>
            </td>
            <td>{{ material.name }}</td>
            <td>{{ material.unitOfMeasure }}</td>
            <td>{{ $formatCost(material.costPerUnit) }}</td>
            <td>{{ $formatQuantity(material.currentStock !== undefined && material.currentStock !== null ? material.currentStock : 0) }} {{ material.unitOfMeasure }}</td>
            <td style="position:relative;">
              {{ material.minStockLevel ? $formatQuantity(material.minStockLevel) : 'N/A' }}
              <div class="actions-menu-row" @mousedown.stop @click.stop>
                <button @mousedown.stop @click.stop="toggleMenu(material.id)" class="btn btn-sm btn-menu">&#8942;</button>
                <div v-if="openMenuId === material.id" class="menu-dropdown" @mousedown.stop @click.stop>
                  <button @click="viewMaterial(material.id)" class="btn btn-sm btn-view">{{ $t('common.view') }}</button>
                  <button @click="editMaterial(material.id)" class="btn btn-sm btn-edit">{{ $t('common.edit') }}</button>
                  <button @click="deleteMaterial(material.id)" class="btn btn-sm btn-danger">{{ $t('common.delete') }}</button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginazione -->
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-sm">
          {{ $t('common.previous') }}
        </button>

        <div class="page-numbers">
          <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
            :class="['btn', 'btn-sm', currentPage === page ? 'btn-active' : '']">
            {{ page }}
          </button>
        </div>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-sm">
          {{ $t('common.next') }}
        </button>
      </div>

      <div class="pagination-info">
        {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredMaterials.length }) }}
      </div>
    </div>
  </div>
</template>

<script>
import materialService from '../services/materialService';

export default {
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

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
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

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
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

/* Low Stock Styling */
.table tbody tr.low-stock {
  background: linear-gradient(135deg, var(--fulvous-light) 0%, #FFEAA7 100%);
}

.table tbody tr.low-stock:hover {
  background: linear-gradient(135deg, var(--fulvous) 0%, #FDCB6E 100%);
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
  background: linear-gradient(135deg, var(--warning) 0%, var(--fulvous-dark) 100%);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
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

.material-card.low-stock {
  border-left: 4px solid var(--warning);
  background: linear-gradient(135deg, var(--surface) 0%, var(--fulvous-light) 100%);
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
  color: var(--warning);
  animation: pulse 2s infinite;
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

h1 {
  margin-bottom: 20px;
}

.materials-header-divider {
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  margin-bottom: 18px;
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
  background-color: var(--secondary);
  color: var(--surface);
}

.btn-secondary {
  background-color: var(--oxford-blue-muted);
  color: var(--surface);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px;
  /* Altezza fissa per i pulsanti */
  line-height: 20px;
  /* Allineamento verticale del testo */
}

.btn-danger {
  background-color: var(--danger);
  color: var(--surface);
}

.btn-edit {
  background-color: var(--oxford-blue-light);
  color: var(--surface);
}

.btn-active {
  background-color: var(--secondary);
  color: var(--surface);
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 20px;
  background-color: var(--snow-dark);
  border-radius: 4px;
}

.error {
  color: var(--danger);
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-filter input {
  padding: 8px;
  border: 1px solid var(--border);
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
  border: 1px solid var(--border);
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  /* Allineamento verticale al centro */
  height: 44px;
  /* Altezza fissa per tutte le celle */
}

th {
  background-color: var(--snow-dark);
  font-weight: bold;
}

th.sortable {
  cursor: pointer;
  position: relative;
}

th.sortable:hover {
  background-color: var(--border);
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

.low-stock {
  background-color: var(--fulvous-light);
}

.actions {
  display: flex;
  gap: 8px;
  margin: 0;
  /* Reset del margine */
  padding: 0;
  /* Reset del padding */
  justify-content: center;
  /* Centra orizzontalmente */
  align-items: center;
  /* Allineamento verticale */
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

.sku-link {
  color: #3498db;
  text-decoration: none;
}

.sku-link:hover {
  text-decoration: underline;
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}

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

.btn-menu {
  background: none !important;
  color: #333;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  box-shadow: none;
}
</style>