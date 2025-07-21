<template>
  <div class="customers">
    <h1>Gestione Clienti</h1>
    
    <div class="actions">
      <router-link to="/customers/new" class="btn btn-primary">Nuovo Cliente</router-link>
    </div>
    
    <!-- Filtri e opzioni di paginazione -->
    <div class="table-controls">
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cerca clienti..." 
          @input="filterCustomers"
        >
      </div>
      
      <div class="filter-group">
        <label for="customer-type">Filtra per tipo:</label>
        <select id="customer-type" v-model="typeFilter" @change="filterCustomers">
          <option value="">Tutti</option>
          <option value="private">Privati</option>
          <option value="online">Canali Online</option>
          <option value="store">Negozi</option>
        </select>
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
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="filteredCustomers.length === 0" class="empty-state">
      Nessun cliente trovato. Aggiungi il tuo primo cliente!
    </div>
    
    <div v-else class="customers-list">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              Nome
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('customerType')" class="sortable">
              Tipo
              <span v-if="sortKey === 'customerType'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('contactPerson')" class="sortable">
              Contatto
              <span v-if="sortKey === 'contactPerson'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('email')" class="sortable">
              Email
              <span v-if="sortKey === 'email'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('phone')" class="sortable">
              Telefono
              <span v-if="sortKey === 'phone'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in paginatedCustomers" :key="customer.id">
            <td>{{ customer.name }}</td>
            <td>{{ formatCustomerType(customer.customerType) }}</td>
            <td>{{ customer.contactPerson || 'N/A' }}</td>
            <td>{{ customer.email || 'N/A' }}</td>
            <td>{{ customer.phone || 'N/A' }}</td>
            <td class="actions">
              <button @click="editCustomer(customer.id)" class="btn btn-sm btn-edit">Modifica</button>
              <button @click="deleteCustomer(customer.id)" class="btn btn-sm btn-danger">Elimina</button>
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
        Visualizzazione {{ startIndex + 1 }}-{{ endIndex }} di {{ filteredCustomers.length }} elementi
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'CustomersView',
  data() {
    return {
      customers: [],
      filteredCustomers: [],
      loading: true,
      error: null,
      searchQuery: '',
      typeFilter: '',
      sortKey: 'name',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredCustomers.length ? this.filteredCustomers.length : end;
    },
    paginatedCustomers() {
      return this.filteredCustomers.slice(this.startIndex, this.endIndex);
    }
  },
  created() {
    this.fetchCustomers();
  },
  methods: {
    async fetchCustomers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/customers');
        this.customers = response.data;
        this.filterCustomers();
      } catch (error) {
        console.error('Error fetching customers:', error);
        this.error = 'Si è verificato un errore durante il recupero dei clienti. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    filterCustomers() {
      let filtered = [...this.customers];
      
      // Apply type filter
      if (this.typeFilter) {
        filtered = filtered.filter(customer => customer.customerType === this.typeFilter);
      }
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(customer => 
          customer.name.toLowerCase().includes(query) ||
          (customer.contactPerson && customer.contactPerson.toLowerCase().includes(query)) ||
          (customer.email && customer.email.toLowerCase().includes(query)) ||
          (customer.phone && customer.phone.toLowerCase().includes(query))
        );
      }
      
      this.filteredCustomers = filtered;
      this.sortCustomers();
      this.currentPage = 1;
    },
    
    sortCustomers() {
      const key = this.sortKey;
      const order = this.sortOrder;
      
      this.filteredCustomers.sort((a, b) => {
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
      
      this.sortCustomers();
    },
    
    updatePagination() {
      this.currentPage = 1;
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    formatCustomerType(type) {
      switch (type) {
        case 'private':
          return 'Privato';
        case 'online':
          return 'Canale Online';
        case 'store':
          return 'Negozio';
        default:
          return type;
      }
    },
    
    editCustomer(id) {
      this.$router.push(`/customers/${id}`);
    },
    
    async deleteCustomer(id) {
      if (!confirm('Sei sicuro di voler eliminare questo cliente?')) {
        return;
      }
      
      try {
        await api.delete(`/api/customers/${id}`);
        this.customers = this.customers.filter(c => c.id !== id);
        this.filterCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        if (error.response && error.response.status === 400) {
          alert('Impossibile eliminare il cliente: ci sono transazioni associate.');
        } else {
          alert('Si è verificato un errore durante l\'eliminazione del cliente.');
        }
      }
    }
  }
};
</script>

<style scoped>
.customers {
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