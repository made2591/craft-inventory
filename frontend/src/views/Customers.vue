<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">{{ $t('customers.title') }}</h1>
      <div class="flex justify-center">
        <router-link to="/customers/new" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ $t('customers.newCustomer') }}
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
              :placeholder="$t('customers.searchPlaceholder')" 
              @input="filterCustomers"
              class="form-input"
              style="margin: 0;"
            >
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-filter text-muted"></i>
            <select id="customer-type" v-model="typeFilter" @change="filterCustomers" class="form-select">
              <option value="">{{ $t('common.all') }}</option>
              <option value="private">{{ $t('customers.private') }}</option>
              <option value="online">{{ $t('customers.onlineChannels') }}</option>
              <option value="store">{{ $t('customers.stores') }}</option>
            </select>
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
    
    <div v-else-if="filteredCustomers.length === 0" class="card text-center">
      <div class="text-muted">
        <i class="fas fa-users text-2xl"></i>
        <p class="text-lg">{{ $t('customers.noCustomersFound') }}</p>
      </div>
    </div>
    
    <div v-else class="customers-content">
      <!-- Desktop Table View -->
      <div class="table-responsive hidden-mobile">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="sortable cursor-pointer">
                {{ $t('customers.name') }}
                <i v-if="sortKey === 'name'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('customerType')" class="sortable cursor-pointer">
                {{ $t('customers.type') }}
                <i v-if="sortKey === 'customerType'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('contactPerson')" class="sortable cursor-pointer">
                {{ $t('customers.contact') }}
                <i v-if="sortKey === 'contactPerson'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('email')" class="sortable cursor-pointer">
                {{ $t('customers.email') }}
                <i v-if="sortKey === 'email'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('phone')" class="sortable cursor-pointer">
                {{ $t('customers.phone') }}
                <i v-if="sortKey === 'phone'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in paginatedCustomers" :key="customer.id">
              <td>
                <router-link :to="`/customers/${customer.id}/view`" class="text-primary font-medium">
                  {{ customer.name }}
                </router-link>
              </td>
              <td>
                <span :class="getCustomerTypeClass(customer.customerType)" class="badge">
                  <i :class="getCustomerTypeIcon(customer.customerType)"></i>
                  {{ formatCustomerType(customer.customerType) }}
                </span>
              </td>
              <td>{{ customer.contactPerson || $t('common.notApplicable') }}</td>
              <td>
                <a v-if="customer.email" :href="`mailto:${customer.email}`" class="text-primary">
                  {{ customer.email }}
                </a>
                <span v-else class="text-muted">{{ $t('common.notApplicable') }}</span>
              </td>
              <td>
                <a v-if="customer.phone" :href="`tel:${customer.phone}`" class="text-primary">
                  {{ customer.phone }}
                </a>
                <span v-else class="text-muted">{{ $t('common.notApplicable') }}</span>
              </td>
              <td>
                <ActionMenu 
                  :actions="getCustomerActions(customer)" 
                  @action="handleCustomerAction($event, customer)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="visible-mobile">
        <div class="grid gap-4">
          <div v-for="customer in paginatedCustomers" :key="customer.id" class="card">
            <div class="flex justify-between items-start mb-3">
              <div>
                <router-link :to="`/customers/${customer.id}/view`" class="text-lg font-bold text-primary">
                  {{ customer.name }}
                </router-link>
                <p class="text-sm text-muted">{{ customer.contactPerson || 'No contact person' }}</p>
              </div>
              <span :class="getCustomerTypeClass(customer.customerType)" class="badge">
                <i :class="getCustomerTypeIcon(customer.customerType)"></i>
                {{ formatCustomerType(customer.customerType) }}
              </span>
            </div>
            
            <div class="grid gap-3 mb-4">
              <div v-if="customer.email">
                <p class="text-xs text-muted font-medium">{{ $t('customers.email') }}</p>
                <a :href="`mailto:${customer.email}`" class="text-primary font-medium">
                  <i class="fas fa-envelope mr-1"></i>
                  {{ customer.email }}
                </a>
              </div>
              <div v-if="customer.phone">
                <p class="text-xs text-muted font-medium">{{ $t('customers.phone') }}</p>
                <a :href="`tel:${customer.phone}`" class="text-primary font-medium">
                  <i class="fas fa-phone mr-1"></i>
                  {{ customer.phone }}
                </a>
              </div>
              <div v-if="customer.address">
                <p class="text-xs text-muted font-medium">{{ $t('customers.address') }}</p>
                <p class="font-medium">{{ customer.address }}</p>
              </div>
            </div>
            
            <div class="mobile-actions">
              <ActionMenu 
                :actions="getCustomerActions(customer)" 
                @action="handleCustomerAction($event, customer)"
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
            {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredCustomers.length }) }}
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
      itemsPerPage: 10,
      openMenuId: null
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
        this.error = this.$t('errors.fetchCustomers');
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
          return this.$t('customers.private');
        case 'online':
          return this.$t('customers.onlineChannels');
        case 'store':
          return this.$t('customers.stores');
        default:
          return type;
      }
    },
    
    getCustomerTypeClass(type) {
      switch (type) {
        case 'private':
          return 'badge-info';
        case 'online':
          return 'badge-success';
        case 'store':
          return 'badge-warning';
        default:
          return 'badge-secondary';
      }
    },
    
    getCustomerTypeIcon(type) {
      switch (type) {
        case 'private':
          return 'fas fa-user';
        case 'online':
          return 'fas fa-globe';
        case 'store':
          return 'fas fa-store';
        default:
          return 'fas fa-question';
      }
    },
    
    viewCustomer(id) {
      this.$router.push(`/customers/${id}/view`);
    },
    
    editCustomer(id) {
      this.$router.push(`/customers/${id}`);
    },
    
    async deleteCustomer(id) {
      if (!confirm(this.$t('customers.confirmDelete'))) {
        return;
      }
      
      try {
        await api.delete(`/api/customers/${id}`);
        this.customers = this.customers.filter(c => c.id !== id);
        this.filterCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        if (error.response && error.response.status === 400) {
          alert(this.$t('errors.deleteCustomerTransactions'));
        } else {
          alert(this.$t('errors.deleteCustomer'));
        }
      }
    },

    getCustomerActions(customer) {
      return [
        {
          key: 'view',
          label: this.$t('common.view'),
          icon: 'fas fa-eye',
          variant: 'default',
          tooltip: 'View customer details'
        },
        {
          key: 'edit',
          label: this.$t('common.edit'),
          icon: 'fas fa-edit',
          variant: 'primary',
          tooltip: 'Edit customer'
        },
        {
          key: 'contact',
          label: this.$t('customers.contact'),
          icon: 'fas fa-envelope',
          variant: 'default',
          tooltip: 'Contact customer',
          disabled: !customer.email
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          icon: 'fas fa-trash',
          variant: 'danger',
          tooltip: 'Delete customer'
        }
      ];
    },

    handleCustomerAction(actionKey, customer) {
      switch (actionKey) {
        case 'view':
          this.viewCustomer(customer.id);
          break;
        case 'edit':
          this.editCustomer(customer.id);
          break;
        case 'contact':
          this.contactCustomer(customer);
          break;
        case 'delete':
          this.deleteCustomer(customer.id);
          break;
      }
    },

    contactCustomer(customer) {
      if (customer.email) {
        window.location.href = `mailto:${customer.email}`;
      }
    },
    
    toggleMenu(customerId) {
      this.openMenuId = this.openMenuId === customerId ? null : customerId;
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

.customers-content {
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

/* Badge styles for customer types */
.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.badge-secondary {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

/* Mobile specific styles */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  .customers-content {
    gap: 16px;
  }
  
  .card {
    padding: 16px;
  }
  
  .mobile-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
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

/* Link styles */
a.text-primary {
  text-decoration: none;
}

a.text-primary:hover {
  text-decoration: underline;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Print styles */
@media print {
  .btn, .pagination, .page-header .flex {
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
</style>