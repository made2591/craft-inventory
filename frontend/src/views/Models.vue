<template>
  <div class="models">
    <h1>Gestione Modelli di Prodotto</h1>
    
    <div class="actions">
      <router-link to="/models/new" class="btn btn-primary">Nuovo Modello</router-link>
    </div>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="models.length === 0" class="empty-state">
      Nessun modello trovato. Aggiungi il tuo primo modello di prodotto!
    </div>
    
    <div v-else class="models-list">
      <!-- Filtri e opzioni di paginazione -->
      <div class="table-controls">
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cerca modelli..." 
            @input="filterModels"
          >
        </div>
        <div class="pagination-controls">
          <label for="itemsPerPage">Elementi per pagina:</label>
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
            <th @click="sortBy('name')" class="sortable">
              Nome
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('description')" class="sortable">
              Descrizione
              <span v-if="sortKey === 'description'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('production_cost')" class="sortable">
              Costo di Produzione
              <span v-if="sortKey === 'production_cost'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('selling_price')" class="sortable">
              Prezzo di Vendita
              <span v-if="sortKey === 'selling_price'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('labor_time_minutes')" class="sortable">
              Tempo di Lavoro
              <span v-if="sortKey === 'labor_time_minutes'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Margine</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="model in paginatedModels" :key="model.id">
            <td>{{ model.name }}</td>
            <td>{{ model.description || 'N/A' }}</td>
            <td>€ {{ model.production_cost !== undefined && model.production_cost !== null ? model.production_cost.toFixed(2) : '0.00' }}</td>
            <td>€ {{ model.selling_price !== undefined && model.selling_price !== null ? model.selling_price.toFixed(2) : '0.00' }}</td>
            <td>{{ formatTime(model.labor_time_minutes) }}</td>
            <td>{{ calculateMargin(model) }}%</td>
            <td class="actions">
              <button @click="editModel(model.id)" class="btn btn-sm btn-edit">Modifica</button>
              <button @click="deleteModel(model.id)" class="btn btn-sm btn-danger">Elimina</button>
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
          Precedente
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
          Successivo
        </button>
      </div>
      
      <div class="pagination-info">
        Visualizzazione {{ startIndex + 1 }}-{{ endIndex }} di {{ filteredModels.length }} elementi
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
        this.error = 'Si è verificato un errore durante il recupero dei modelli. Riprova più tardi.';
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
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    },
    
    calculateMargin(model) {
      if (!model.selling_price || !model.production_cost || model.selling_price === 0) {
        return '0.0';
      }
      const margin = ((model.selling_price - model.production_cost) / model.selling_price) * 100;
      return margin.toFixed(1);
    },
    
    editModel(id) {
      this.$router.push(`/models/${id}`);
    },
    
    async deleteModel(id) {
      if (!confirm('Sei sicuro di voler eliminare questo modello?')) {
        return;
      }
      
      try {
        await api.delete(`/api/models/${id}`);
        this.models = this.models.filter(m => m.id !== id);
        this.filterModels();
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Si è verificato un errore durante l\'eliminazione del modello.');
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

.btn-active {
  background-color: #42b983;
  color: white;
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
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
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
  height: 28px; /* Altezza fissa uguale ai pulsanti */
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