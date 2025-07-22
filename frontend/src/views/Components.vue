<template>
  <div class="components">
    <h1>Gestione Componenti</h1>
    
    <div class="actions">
      <router-link to="/components/new" class="btn btn-primary">Nuovo Componente</router-link>
      <button @click="recalculateAllCosts" class="btn btn-secondary" :disabled="isRecalculating">
        {{ isRecalculating ? 'Ricalcolo in corso...' : 'Ricalcola tutti i costi' }}
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="components.length === 0" class="empty-state">
      Nessun componente trovato. Aggiungi il tuo primo componente!
    </div>
    
    <div v-else class="components-list">
      <!-- Filtri e opzioni di paginazione -->
      <div class="table-controls">
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cerca componenti..." 
            @input="filterComponents"
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
            <th @click="sortBy('sku')" class="sortable">
              SKU
              <span v-if="sortKey === 'sku'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
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
            <th @click="sortBy('quantity')" class="sortable">
              Quantità
              <span v-if="sortKey === 'quantity'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Costo Totale</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="component in paginatedComponents" :key="component.id">
            <td>
              <router-link :to="`/components/${component.id}/view`" class="sku-link">
                <strong>{{ component.sku || 'N/A' }}</strong>
              </router-link>
            </td>
            <td>{{ component.name }}</td>
            <td>{{ component.description || 'N/A' }}</td>
            <td>{{ component.quantity || 0 }}</td>
            <td>
              <span v-if="loadingCosts[component.id]" class="loading-cost">
                <i class="loading-spinner"></i> Calcolo...
              </span>
              <span v-else-if="componentCosts[component.id] !== undefined">
                € {{ typeof componentCosts[component.id] === 'number' ? componentCosts[component.id].toFixed(2) : componentCosts[component.id] }}
              </span>
              <span v-else>
                <button @click="loadComponentCost(component.id)" class="btn btn-sm btn-secondary">
                  Calcola costo
                </button>
              </span>
            </td>
            <td class="actions">
              <button @click="viewComponent(component.id)" class="btn btn-sm btn-view">Visualizza</button>
              <button @click="editComponent(component.id)" class="btn btn-sm btn-edit">Modifica</button>
              <button @click="deleteComponent(component.id)" class="btn btn-sm btn-danger">Elimina</button>
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
        Visualizzazione {{ startIndex + 1 }}-{{ endIndex }} di {{ filteredComponents.length }} elementi
      </div>
    </div>
  </div>
</template>

<script>
import componentService from '../services/componentService';

export default {
  name: 'ComponentsView',
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
        this.error = 'Si è verificato un errore durante il recupero dei componenti. Riprova più tardi.';
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
        alert('Si è verificato un errore durante il ricalcolo dei costi. Riprova più tardi.');
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
          [componentId]: 'Errore' 
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
        this.filteredComponents = this.components.filter(component => 
          component.name.toLowerCase().includes(query) ||
          (component.description && component.description.toLowerCase().includes(query))
        );
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
    
    viewComponent(id) {
      this.$router.push(`/components/${id}/view`);
    },
    
    editComponent(id) {
      this.$router.push(`/components/${id}`);
    },
    
    async deleteComponent(id) {
      if (!confirm('Sei sicuro di voler eliminare questo componente?')) {
        return;
      }
      
      try {
        await componentService.deleteComponent(id);
        this.components = this.components.filter(c => c.id !== id);
        this.filterComponents();
      } catch (error) {
        console.error('Error deleting component:', error);
        if (error.response && error.response.status === 400) {
          alert('Impossibile eliminare il componente: è utilizzato in uno o più modelli.');
        } else {
          alert('Si è verificato un errore durante l\'eliminazione del componente.');
        }
      }
    }
  }
};
</script>

<style scoped>
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
</style>