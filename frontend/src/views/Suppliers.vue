<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">{{ $t('suppliers.title') }}</h1>
      <div class="flex justify-center">
        <router-link to="/suppliers/new" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ $t('suppliers.newSupplier') }}
        </router-link>
      </div>
    </div>
    
    <!-- Controls Card -->
    <div class="card">
      <div class="grid grid-auto gap-4">
        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-search text-muted"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="$t('suppliers.searchPlaceholder')" 
              @input="filterSuppliers"
              class="form-input"
              style="margin: 0;"
            >
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
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
    
    <div v-else-if="filteredSuppliers.length === 0" class="card text-center">
      <div class="text-muted">
        <i class="fas fa-truck text-2xl"></i>
        <p class="text-lg">{{ $t('suppliers.noSuppliersFound') }}</p>
      </div>
    </div>
    
    <div v-else class="suppliers-content">
      <!-- Desktop Table View -->
      <div class="table-responsive hidden-mobile">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="sortable cursor-pointer">
                {{ $t('suppliers.name') }}
                <i v-if="sortKey === 'name'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('contactPerson')" class="sortable cursor-pointer">
                {{ $t('suppliers.contact') }}
                <i v-if="sortKey === 'contactPerson'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('email')" class="sortable cursor-pointer">
                {{ $t('suppliers.email') }}
                <i v-if="sortKey === 'email'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('phone')" class="sortable cursor-pointer">
                {{ $t('suppliers.phone') }}
                <i v-if="sortKey === 'phone'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in paginatedSuppliers" :key="supplier.id">
              <td>
                <router-link :to="`/suppliers/${supplier.id}/view`" class="text-primary font-medium">
                  {{ supplier.name }}
                </router-link>
              </td>
              <td>{{ supplier.contactPerson || $t('common.notApplicable') }}</td>
              <td>
                <a v-if="supplier.email" :href="`mailto:${supplier.email}`" class="text-primary">
                  {{ supplier.email }}
                </a>
                <span v-else class="text-muted">{{ $t('common.notApplicable') }}</span>
              </td>
              <td>
                <a v-if="supplier.phone" :href="`tel:${supplier.phone}`" class="text-primary">
                  {{ supplier.phone }}
                </a>
                <span v-else class="text-muted">{{ $t('common.notApplicable') }}</span>
              </td>
              <td>
                <ActionMenu 
                  :actions="getSupplierActions(supplier)" 
                  @action="handleSupplierAction($event, supplier)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="visible-mobile">
        <div class="grid gap-4">
          <div v-for="supplier in paginatedSuppliers" :key="supplier.id" class="card">
            <div class="flex justify-between items-start mb-3">
              <div>
                <router-link :to="`/suppliers/${supplier.id}/view`" class="text-lg font-bold text-primary">
                  {{ supplier.name }}
                </router-link>
                <p class="text-sm text-muted">{{ supplier.contactPerson || 'No contact person' }}</p>
              </div>
              <span class="badge badge-info">
                <i class="fas fa-truck"></i>
                {{ $t('suppliers.title') }}
              </span>
            </div>
            
            <div class="grid gap-3 mb-4">
              <div v-if="supplier.email">
                <p class="text-xs text-muted font-medium">{{ $t('suppliers.email') }}</p>
                <a :href="`mailto:${supplier.email}`" class="text-primary font-medium">
                  <i class="fas fa-envelope mr-1"></i>
                  {{ supplier.email }}
                </a>
              </div>
              <div v-if="supplier.phone">
                <p class="text-xs text-muted font-medium">{{ $t('suppliers.phone') }}</p>
                <a :href="`tel:${supplier.phone}`" class="text-primary font-medium">
                  <i class="fas fa-phone mr-1"></i>
                  {{ supplier.phone }}
                </a>
              </div>
              <div v-if="supplier.address">
                <p class="text-xs text-muted font-medium">{{ $t('suppliers.address') }}</p>
                <p class="font-medium">{{ supplier.address }}</p>
              </div>
              <div v-if="supplier.website">
                <p class="text-xs text-muted font-medium">{{ $t('suppliers.website') }}</p>
                <a :href="supplier.website" target="_blank" class="text-primary font-medium">
                  <i class="fas fa-external-link-alt mr-1"></i>
                  {{ supplier.website }}
                </a>
              </div>
            </div>
            
            <div class="mobile-actions">
              <ActionMenu 
                :actions="getSupplierActions(supplier)" 
                @action="handleSupplierAction($event, supplier)"
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
            {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredSuppliers.length }) }}
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
      itemsPerPage: 10,
      openMenuId: null
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
    },

    getSupplierActions(supplier) {
      return [
        {
          key: 'view',
          label: this.$t('common.view'),
          icon: 'fas fa-eye',
          variant: 'default',
          tooltip: 'View supplier details'
        },
        {
          key: 'edit',
          label: this.$t('common.edit'),
          icon: 'fas fa-edit',
          variant: 'primary',
          tooltip: 'Edit supplier'
        },
        {
          key: 'contact',
          label: this.$t('suppliers.contact'),
          icon: 'fas fa-envelope',
          variant: 'default',
          tooltip: 'Contact supplier',
          disabled: !supplier.email
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          icon: 'fas fa-trash',
          variant: 'danger',
          tooltip: 'Delete supplier'
        }
      ];
    },

    handleSupplierAction(actionKey, supplier) {
      switch (actionKey) {
        case 'view':
          this.viewSupplier(supplier.id);
          break;
        case 'edit':
          this.editSupplier(supplier.id);
          break;
        case 'contact':
          this.contactSupplier(supplier);
          break;
        case 'delete':
          this.deleteSupplier(supplier.id);
          break;
      }
    },

    contactSupplier(supplier) {
      if (supplier.email) {
        window.location.href = `mailto:${supplier.email}`;
      }
    },
    
    toggleMenu(supplierId) {
      this.openMenuId = this.openMenuId === supplierId ? null : supplierId;
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
  background-color: var(--secondary);
  color: var(--surface);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px; /* Altezza fissa per i pulsanti */
  line-height: 20px; /* Allineamento verticale del testo */
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

.name-link {
  color: var(--secondary);
  text-decoration: none;
}

.name-link:hover {
  text-decoration: underline;
  color: var(--fulvous-dark);
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