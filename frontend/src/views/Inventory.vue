<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">
        <i class="fas fa-warehouse mr-2"></i>
        {{ $t('inventory.title') }}
      </h1>
      <div class="flex justify-center">
        <router-link to="/inventory/new" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ $t('inventory.newItem') }}
        </router-link>
      </div>
    </div>

    <!-- Controls Card -->
    <div class="card">
      <div class="grid grid-auto gap-4">
        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-search text-muted"></i>
            <input type="text" v-model="searchQuery" :placeholder="$t('inventory.searchPlaceholder')"
              @input="filterItems" class="form-input" style="margin: 0;">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-filter text-muted"></i>
            <select id="model-filter" v-model="modelFilter" @change="filterItems" class="form-select">
              <option value="">{{ $t('inventory.allModels') }}</option>
              <option v-for="model in models" :key="model.id" :value="model.id">
                {{ model.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <label for="itemsPerPage" class="form-label text-sm" style="margin: 0;">{{ $t('common.itemsPerPage')
            }}:</label>
            <select id="itemsPerPage" v-model="itemsPerPage" @change="updatePagination" class="form-select">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
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

    <div v-else-if="filteredItems.length === 0" class="card text-center">
      <div class="text-muted">
        <i class="fas fa-warehouse text-2xl"></i>
        <p class="text-lg">{{ $t('inventory.noItemsFound') }}</p>
      </div>
    </div>

    <div v-else class="inventory-content">
      <!-- Desktop Table View -->
      <div class="table-responsive hidden-mobile">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('modelSku')" class="sortable cursor-pointer">
                {{ $t('inventory.modelSku') }}
                <i v-if="sortKey === 'modelSku'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  class="ml-1"></i>
              </th>
              <th @click="sortBy('modelName')" class="sortable cursor-pointer">
                {{ $t('inventory.model') }}
                <i v-if="sortKey === 'modelName'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  class="ml-1"></i>
              </th>
              <th @click="sortBy('quantity')" class="sortable cursor-pointer">
                {{ $t('inventory.quantity') }}
                <i v-if="sortKey === 'quantity'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  class="ml-1"></i>
              </th>
              <th @click="sortBy('productionDate')" class="sortable cursor-pointer">
                {{ $t('inventory.productionDate') }}
                <i v-if="sortKey === 'productionDate'"
                  :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('notes')" class="sortable cursor-pointer">
                {{ $t('inventory.notes') }}
                <i v-if="sortKey === 'notes'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  class="ml-1"></i>
              </th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id">
              <td class="font-medium">
                <router-link v-if="item.modelSku" :to="`/models/${item.modelId}/view`" class="text-primary font-medium">
                  {{ item.modelSku }}
                </router-link>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td class="font-medium">{{ item.modelName || 'N/A' }}</td>
              <td>
                <span class="badge badge-info">
                  <i class="fas fa-cubes mr-1"></i>
                  {{ $formatQuantity(item.quantity) }}
                </span>
              </td>
              <td class="font-medium">{{ formatDate(item.productionDate) }}</td>
              <td>
                <span v-if="item.notes" class="text-sm">{{ item.notes }}</span>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td>
                <ActionMenu :actions="getInventoryActions(item)" @action="handleInventoryAction($event, item)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="visible-mobile">
        <div class="grid gap-4">
          <div v-for="item in paginatedItems" :key="item.id" class="card">
            <div class="flex justify-between items-start mb-3">
              <div>
                <router-link v-if="item.modelSku" :to="`/models/${item.modelId}/view`"
                  class="text-lg font-bold text-primary">
                  {{ item.modelName || 'N/A' }}
                </router-link>
                <h3 v-else class="text-lg font-bold">{{ item.modelName || 'N/A' }}</h3>
                <p class="text-sm text-muted">{{ $t('common.sku') }}: {{ item.modelSku || $t('common.notApplicable') }}</p>
              </div>
              <div class="text-right">
                <span class="badge badge-info">
                  <i class="fas fa-cubes mr-1"></i>
                  {{ $formatQuantity(item.quantity) }}
                </span>
              </div>
            </div>

            <div class="grid gap-3 mb-4">
              <div>
                <p class="text-xs text-muted font-medium">{{ $t('inventory.productionDate') }}</p>
                <p class="font-medium">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(item.productionDate) }}
                </p>
              </div>
              <div v-if="item.notes">
                <p class="text-xs text-muted font-medium">{{ $t('inventory.notes') }}</p>
                <p class="text-sm">{{ item.notes }}</p>
              </div>
            </div>

            <div class="mobile-actions">
              <ActionMenu :actions="getInventoryActions(item)" @action="handleInventoryAction($event, item)" />
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
              <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                :class="['btn', 'btn-sm', currentPage === page ? 'btn-primary' : 'btn-secondary']">
                {{ page }}
              </button>
            </div>

            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="btn btn-secondary btn-sm">
              <span class="hidden-mobile">{{ $t('common.next') }}</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="text-sm text-muted text-center">
            {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredItems.length }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import ActionMenu from '../components/ActionMenu.vue';

export default {
  components: {
    ActionMenu
  },
  name: 'InventoryView',
  data() {
    return {
      inventoryItems: [],
      filteredItems: [],
      models: [],
      loading: true,
      error: null,
      searchQuery: '',
      modelFilter: '',
      sortKey: 'productionDate',
      sortOrder: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      openMenuId: null
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredItems.length ? this.filteredItems.length : end;
    },
    paginatedItems() {
      return this.filteredItems.slice(this.startIndex, this.endIndex);
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
    this.fetchInventory();
    this.fetchModels();
  },
  methods: {
    async fetchInventory() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/api/inventory');
        this.inventoryItems = response.data;
        this.filterItems();
      } catch (error) {
        console.error('Error fetching inventory:', error);
        this.error = this.$t('errors.fetchInventoryItems');
      } finally {
        this.loading = false;
      }
    },

    async fetchModels() {
      try {
        const response = await api.get('/api/models');
        this.models = response.data;
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    },

    filterItems() {
      let filtered = [...this.inventoryItems];

      // Apply model filter
      if (this.modelFilter) {
        filtered = filtered.filter(item => item.modelId === this.modelFilter);
      }

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          (item.modelName && item.modelName.toLowerCase().includes(query)) ||
          (item.notes && item.notes.toLowerCase().includes(query))
        );
      }

      this.filteredItems = filtered;
      this.sortItems();
      this.currentPage = 1;
    },

    sortItems() {
      const key = this.sortKey;
      const order = this.sortOrder;

      this.filteredItems.sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = '';
        if (valueB === null || valueB === undefined) valueB = '';

        // Special handling for dates
        if (key === 'productionDate') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }

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

      this.sortItems();
    },

    updatePagination() {
      this.currentPage = 1;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        // Prova a creare un oggetto Date valido
        const date = new Date(dateString);

        // Verifica se la data è valida
        if (isNaN(date.getTime())) {
          return 'N/A';
        }

        // Formatta la data in modo leggibile (giorno/mese/anno)
        return new Intl.DateTimeFormat('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
      }
    },

    viewItem(id) {
      this.$router.push(`/inventory/${id}/view`);
    },

    editItem(id) {
      this.$router.push(`/inventory/${id}`);
    },

    async deleteItem(id) {
      if (!confirm(this.$t('inventory.confirmDeleteItem'))) {
        return;
      }

      try {
        await api.delete(`/api/inventory/${id}`);
        this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
        this.filterItems();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        alert(this.$t('errors.deleteInventoryItem'));
      }
    },

    getInventoryActions(item) {
      return [
        {
          key: 'view',
          label: this.$t('common.view'),
          icon: 'fas fa-eye',
          variant: 'default',
          tooltip: 'View inventory item details'
        },
        {
          key: 'edit',
          label: this.$t('common.edit'),
          icon: 'fas fa-edit',
          variant: 'primary',
          tooltip: 'Edit inventory item'
        },
        {
          key: 'duplicate',
          label: this.$t('common.duplicate'),
          icon: 'fas fa-copy',
          variant: 'default',
          tooltip: 'Duplicate inventory item'
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          icon: 'fas fa-trash',
          variant: 'danger',
          tooltip: 'Delete inventory item'
        }
      ];
    },

    handleInventoryAction(actionKey, item) {
      switch (actionKey) {
        case 'view':
          this.viewItem(item.id);
          break;
        case 'edit':
          this.editItem(item.id);
          break;
        case 'duplicate':
          this.duplicateItem(item);
          break;
        case 'delete':
          this.deleteItem(item.id);
          break;
      }
    },

    duplicateItem(item) {
      // Navigate to create form with pre-filled data
      this.$router.push({
        path: '/inventory/new',
        query: { duplicate: item.id }
      });
    },

    toggleMenu(itemId) {
      this.openMenuId = this.openMenuId === itemId ? null : itemId;
    },

    handleClickOutside(event) {
      const target = event.target;
      const menu = this.$el.querySelector('.menu-dropdown');

      if (menu && !menu.contains(target)) {
        this.openMenuId = null;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
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

.inventory-content {
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

.mr-1 {
  margin-right: 4px;
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.search-filter input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
  margin-bottom: 0;
}

.filter-group select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ddd;
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

.btn-view {
  background-color: var(--info);
  color: var(--surface);
}

.btn-active {
  background-color: var(--secondary);
  color: var(--surface);
}

.sku-link {
  color: var(--secondary);
  text-decoration: none;
  font-weight: bold;
}

.sku-link:hover {
  text-decoration: underline;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error {
  color: #dc3545;
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
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  /* Allineamento verticale al centro */
  height: 44px;
  /* Altezza fissa per tutte le celle */
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

.actions-menu-row {
  position: relative;
}

.btn-menu {
  background-color: transparent;
  color: #333;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.menu-dropdown button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
}

.menu-dropdown button:hover {
  background-color: #f1f1f1;
}
</style>
/* M
obile Responsive */
@media (max-width: 768px) {
.page-header h1 {
font-size: 24px;
margin-bottom: 16px;
}

.inventory-content {
gap: 16px;
}

.card {
padding: 16px;
}

.grid-auto {
grid-template-columns: 1fr;
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
}

/* Loading animation */
@keyframes fadeIn {
from { opacity: 0; transform: translateY(10px); }
to { opacity: 1; transform: translateY(0); }
}

.card {
animation: fadeIn 0.3s ease-out;
}

/* Focus states for accessibility */
.btn:focus,
.form-input:focus,
.form-select:focus {
outline: 2px solid var(--primary);
outline-offset: 2px;
}

/* Smooth transitions */
* {
transition: all 0.2s ease;
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

.badge {
border: 1px solid #333 !important;
color: #333 !important;
}
}