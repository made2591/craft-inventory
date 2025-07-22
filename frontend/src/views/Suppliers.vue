<template>
  <div class="suppliers">
    <h1>{{ $t('suppliers.title') }}</h1>
    
    <div class="actions">
      <router-link to="/suppliers/new" class="btn btn-primary">{{ $t('suppliers.newSupplier') }}</router-link>
    </div>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="suppliers.length === 0" class="empty-state">
      {{ $t('suppliers.noSuppliersFound') }}
    </div>
    
    <div v-else class="suppliers-list">
      <!-- Filtri e opzioni di paginazione -->
      <div class="table-controls">
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="$t('suppliers.searchPlaceholder')" 
            @input="filterSuppliers"
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
            <th @click="sortBy('name')" class="sortable">
              {{ $t('suppliers.name') }}
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('contactPerson')" class="sortable">
              {{ $t('suppliers.contact') }}
              <span v-if="sortKey === 'contactPerson'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('email')" class="sortable">
              {{ $t('suppliers.email') }}
              <span v-if="sortKey === 'email'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('phone')" class="sortable">
              {{ $t('suppliers.phone') }}
              <span v-if="sortKey === 'phone'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('address')" class="sortable">
              {{ $t('suppliers.address') }}
              <span v-if="sortKey === 'address'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in paginatedSuppliers" :key="supplier.id">
            <td>
              <router-link :to="`/suppliers/${supplier.id}/view`" class="name-link">
                {{ supplier.name }}
              </router-link>
            </td>
            <td>{{ supplier.contactPerson || 'N/A' }}</td>
            <td>{{ supplier.email || 'N/A' }}</td>
            <td>{{ supplier.phone || 'N/A' }}</td>
            <td>{{ supplier.address || 'N/A' }}</td>
            <td class="actions">
              <button @click="viewSupplier(supplier.id)" class="btn btn-sm btn-view">{{ $t('common.view') }}</button>
              <button @click="editSupplier(supplier.id)" class="btn btn-sm btn-edit">{{ $t('common.edit') }}</button>
              <button @click="deleteSupplier(supplier.id)" class="btn btn-sm btn-danger">{{ $t('common.delete') }}</button>
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
        {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredSuppliers.length }) }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'SuppliersView',
  data() {
    return {
      suppliers: [],
      filteredSuppliers: [],
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
      return Math.ceil(this.filteredSuppliers.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredSuppliers.length ? this.filteredSuppliers.length : end;
    },
    paginatedSuppliers() {
      return this.filteredSuppliers.slice(this.startIndex, this.endIndex);
    }
  },
  created() {
    this.fetchSuppliers();
  },
  methods: {
    async fetchSuppliers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/suppliers');
        this.suppliers = response.data;
        this.filterSuppliers();
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        this.error = this.$t('errors.fetchSuppliers');
      } finally {
        this.loading = false;
      }
    },
    
    filterSuppliers() {
      if (!this.searchQuery) {
        this.filteredSuppliers = [...this.suppliers];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredSuppliers = this.suppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(query) ||
          (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(query)) ||
          (supplier.email && supplier.email.toLowerCase().includes(query)) ||
          (supplier.phone && supplier.phone.toLowerCase().includes(query)) ||
          (supplier.address && supplier.address.toLowerCase().includes(query))
        );
      }
      
      this.sortSuppliers();
      this.currentPage = 1;
    },
    
    sortSuppliers() {
      const key = this.sortKey;
      const order = this.sortOrder;
      
      this.filteredSuppliers.sort((a, b) => {
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
      
      this.sortSuppliers();
    },
    
    updatePagination() {
      this.currentPage = 1;
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    viewSupplier(id) {
      this.$router.push(`/suppliers/${id}/view`);
    },
    
    editSupplier(id) {
      this.$router.push(`/suppliers/${id}`);
    },
    
    async deleteSupplier(id) {
      if (!confirm(this.$t('suppliers.confirmDelete'))) {
        return;
      }
      
      try {
        await api.delete(`/api/suppliers/${id}`);
        this.suppliers = this.suppliers.filter(s => s.id !== id);
        this.filterSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        if (error.response && error.response.status === 400) {
          alert(this.$t('errors.deleteSupplierMaterials'));
        } else {
          alert(this.$t('errors.deleteSupplier'));
        }
      }
    }
  }
};
</script>

<style scoped>
.suppliers {
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

.name-link {
  color: #3498db;
  text-decoration: none;
}

.name-link:hover {
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