<template>
  <div class="models">
    <h1>{{ $t('models.title') }}</h1>
    
    <div class="actions">
      <router-link to="/models/new" class="btn btn-primary">{{ $t('models.newModel') }}</router-link>
    </div>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="models.length === 0" class="empty-state">
      {{ $t('models.noModelsFound') }}
    </div>
    
    <div v-else class="models-list">
      <!-- Filtri e opzioni di paginazione -->
      <div class="table-controls">
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="$t('models.searchPlaceholder')" 
            @input="filterModels"
          >
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
      
      <table>
        <thead>
          <tr>
            <th @click="sortBy('sku')" class="sortable">
              {{ $t('models.sku') }}
              <span v-if="sortKey === 'sku'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('name')" class="sortable">
              {{ $t('models.name') }}
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('description')" class="sortable">
              {{ $t('models.description') }}
              <span v-if="sortKey === 'description'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('production_cost')" class="sortable">
              {{ $t('models.productionCost') }}
              <span v-if="sortKey === 'production_cost'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('selling_price')" class="sortable">
              {{ $t('models.sellingPrice') }}
              <span v-if="sortKey === 'selling_price'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('labor_time_minutes')" class="sortable">
              {{ $t('models.laborTime') }}
              <span v-if="sortKey === 'labor_time_minutes'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>{{ $t('models.margin') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="model in paginatedModels" :key="model.id">
            <td>
              <router-link :to="`/models/${model.id}/view`" class="sku-link">
                <strong>{{ model.sku || 'N/A' }}</strong>
              </router-link>
            </td>
            <td>{{ model.name }}</td>
            <td>{{ model.description || 'N/A' }}</td>
            <td>€ {{ formatCost(model.productionCost || model.production_cost) }}</td>
            <td>€ {{ formatCost(model.sellingPrice || model.selling_price) }}</td>
            <td>{{ formatTime(model.laborTimeMinutes || model.labor_time_minutes) }}</td>
            <td>{{ calculateMargin(model) }}%</td>
            <td class="actions">
              <button @click="viewModel(model.id)" class="btn btn-sm btn-view">{{ $t('common.view') }}</button>
              <button @click="editModel(model.id)" class="btn btn-sm btn-edit">{{ $t('common.edit') }}</button>
              <button @click="deleteModel(model.id)" class="btn btn-sm btn-danger">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginazione -->
      <div class="pagination">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="btn btn-sm"
        >
          {{ $t('common.previous') }}
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="goToPage(page)" 
            :class="['btn', 'btn-sm', currentPage === page ? 'btn-active' : '']"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="btn btn-sm"
        >
          {{ $t('common.next') }}
        </button>
      </div>
      
      <div class="pagination-info">
        {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredModels.length }) }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'ModelsView',
  data() {
    return {
      models: [],
      filteredModels: [],
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
      return Math.ceil(this.filteredModels.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredModels.length ? this.filteredModels.length : end;
    },
    paginatedModels() {
      return this.filteredModels.slice(this.startIndex, this.endIndex);
    }
  },
  created() {
    this.fetchModels();
  },
  methods: {
    async fetchModels() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/models');
        this.models = response.data;
        this.filterModels();
      } catch (error) {
        console.error('Error fetching models:', error);
        this.error = this.$t('errors.fetchModels');
      } finally {
        this.loading = false;
      }
    },
    
    filterModels() {
      if (!this.searchQuery) {
        this.filteredModels = [...this.models];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredModels = this.models.filter(model => 
          model.name.toLowerCase().includes(query) ||
          (model.description && model.description.toLowerCase().includes(query))
        );
      }
      
      this.sortModels();
      this.currentPage = 1;
    },
    
    sortModels() {
      const key = this.sortKey;
      const order = this.sortOrder;
      
      this.filteredModels.sort((a, b) => {
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
      
      this.sortModels();
    },
    
    updatePagination() {
      this.currentPage = 1;
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    formatTime(minutes) {
      if (minutes === undefined || minutes === null) return '0m';
      
      // Assicurati che minutes sia un numero
      const mins = typeof minutes === 'number' ? minutes : Number(minutes);
      if (isNaN(mins)) return '0m';
      
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      
      if (hours > 0) {
        return `${hours}h ${remainingMins}m`;
      }
      return `${remainingMins}m`;
    },
    
    formatCost(cost) {
      // Assicurati che cost sia un numero
      if (cost === undefined || cost === null) return '0.00';
      
      // Converti in numero se è una stringa
      const numCost = typeof cost === 'number' ? cost : Number(cost);
      
      // Verifica se è un numero valido
      if (isNaN(numCost)) return '0.00';
      
      // Formatta con due decimali
      return numCost.toFixed(2);
    },
    
    calculateMargin(model) {
      // Supporta sia camelCase che snake_case
      const sellingPrice = model.sellingPrice !== undefined ? model.sellingPrice : model.selling_price;
      const productionCost = model.productionCost !== undefined ? model.productionCost : model.production_cost;
      
      if (!sellingPrice || !productionCost || sellingPrice === 0) {
        return '0.0';
      }
      const margin = ((sellingPrice - productionCost) / sellingPrice) * 100;
      return margin.toFixed(1);
    },
    
    viewModel(id) {
      this.$router.push(`/models/${id}/view`);
    },
    
    editModel(id) {
      this.$router.push(`/models/${id}`);
    },
    
    async deleteModel(id) {
      if (!confirm(this.$t('models.confirmDelete'))) {
        return;
      }
      
      try {
        await api.delete(`/api/models/${id}`);
        this.models = this.models.filter(m => m.id !== id);
        this.filterModels();
      } catch (error) {
        console.error('Error deleting model:', error);
        alert(this.$t('errors.deleteModel'));
      }
    }
  }
};
</script>

<style scoped>
.models {
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
</style>