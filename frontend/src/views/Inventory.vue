<template>
  <div class="inventory">
    <h1>{{ $t('inventory.title') }}</h1>

    <div class="actions">
      <router-link to="/inventory/new" class="btn btn-primary">{{ $t('inventory.newItem') }}</router-link>
    </div>

    <!-- Filtri e opzioni di paginazione -->
    <div class="table-controls">
      <div class="search-filter">
        <input type="text" v-model="searchQuery" :placeholder="$t('inventory.searchPlaceholder')" @input="filterItems">
      </div>

      <div class="filter-group">
        <label for="model-filter">{{ $t('inventory.filterByModel') }}:</label>
        <select id="model-filter" v-model="modelFilter" @change="filterItems">
          <option value="">{{ $t('inventory.allModels') }}</option>
          <option v-for="model in models" :key="model.id" :value="model.id">
            {{ model.name }}
          </option>
        </select>
      </div>

      <div class="pagination-controls">
        <label for="itemsPerPage">{{ $t('common.itemsPerPage') }}:</label>
        <select id="itemsPerPage" v-model="itemsPerPage" @change="updatePagination">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="filteredItems.length === 0" class="empty-state">
      {{ $t('inventory.noItemsFound') }}
    </div>

    <div v-else class="inventory-list">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('modelSku')" class="sortable">
              {{ $t('inventory.modelSku') }}
              <span v-if="sortKey === 'modelSku'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('modelName')" class="sortable">
              {{ $t('inventory.model') }}
              <span v-if="sortKey === 'modelName'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('quantity')" class="sortable">
              {{ $t('inventory.quantity') }}
              <span v-if="sortKey === 'quantity'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('productionDate')" class="sortable">
              {{ $t('inventory.productionDate') }}
              <span v-if="sortKey === 'productionDate'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('notes')" class="sortable">
              {{ $t('inventory.notes') }}
              <span v-if="sortKey === 'notes'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedItems" :key="item.id">
            <td>
              <router-link v-if="item.modelSku" :to="`/models/${item.modelId}/view`" class="sku-link">
                {{ item.modelSku }}
              </router-link>
              <span v-else>N/A</span>
            </td>
            <td>{{ item.modelName || 'N/A' }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatDate(item.productionDate) }}</td>
            <td>{{ item.notes || 'N/A' }}</td>
            <td class="actions">
              <button @click="viewItem(item.id)" class="btn btn-sm btn-view">{{ $t('common.view') }}</button>
              <button @click="editItem(item.id)" class="btn btn-sm btn-edit">{{ $t('common.edit') }}</button>
              <button @click="deleteItem(item.id)" class="btn btn-sm btn-danger">{{ $t('common.delete') }}</button>
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
        {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredItems.length }) }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
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
      itemsPerPage: 10
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
    }
  }
};
</script>

<style scoped>
.inventory {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 10px;
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
  background-color: #42b983;
  color: white;
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
</style>