<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">
        <i class="fas fa-exchange-alt mr-2"></i>
        {{ $t('transactions.title') }}
      </h1>
      <div class="flex justify-center">
        <router-link to="/transactions/new" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          {{ $t('transactions.newTransaction') }}
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
              :placeholder="$t('transactions.searchPlaceholder')" 
              @input="filterTransactions"
              class="form-input"
              style="margin: 0;"
            >
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-filter text-muted"></i>
            <select id="transaction-type" v-model="typeFilter" @change="filterTransactions" class="form-select">
              <option value="">{{ $t('common.all') }}</option>
              <option value="purchase">{{ $t('transactions.purchase') }}</option>
              <option value="sale">{{ $t('transactions.sale') }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <i class="fas fa-tasks text-muted"></i>
            <select id="transaction-status" v-model="statusFilter" @change="filterTransactions" class="form-select">
              <option value="">{{ $t('common.all') }}</option>
              <option value="pending">{{ $t('transactions.pending') }}</option>
              <option value="completed">{{ $t('transactions.completed') }}</option>
              <option value="cancelled">{{ $t('transactions.cancelled') }}</option>
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
    
    <div v-else-if="filteredTransactions.length === 0" class="card text-center">
      <div class="text-muted">
        <i class="fas fa-receipt text-2xl"></i>
        <p class="text-lg">{{ $t('transactions.noTransactionsFound') }}</p>
      </div>
    </div>
    
    <div v-else class="transactions-content">
      <!-- Desktop Table View -->
      <div class="table-responsive hidden-mobile">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('date')" class="sortable cursor-pointer">
                {{ $t('transactions.date') }}
                <i v-if="sortKey === 'date'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('transactionType')" class="sortable cursor-pointer">
                {{ $t('transactions.type') }}
                <i v-if="sortKey === 'transactionType'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('customerName')" class="sortable cursor-pointer">
                {{ $t('transactions.customer') }}
                <i v-if="sortKey === 'customerName'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('supplierName')" class="sortable cursor-pointer">
                {{ $t('transactions.supplier') }}
                <i v-if="sortKey === 'supplierName'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('totalAmount')" class="sortable cursor-pointer">
                {{ $t('transactions.totalAmount') }}
                <i v-if="sortKey === 'totalAmount'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th @click="sortBy('status')" class="sortable cursor-pointer">
                {{ $t('transactions.status') }}
                <i v-if="sortKey === 'status'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="ml-1"></i>
              </th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
              <td class="font-medium">{{ formatDate(transaction.date) }}</td>
              <td>
                <span :class="getTransactionTypeClass(transaction.transactionType)" class="badge">
                  <i :class="getTransactionTypeIcon(transaction.transactionType)"></i>
                  {{ formatTransactionType(transaction.transactionType) }}
                </span>
              </td>
              <td>{{ transaction.customerName || 'N/A' }}</td>
              <td>{{ transaction.supplierName || 'N/A' }}</td>
              <td class="font-bold">{{ $formatCurrency(transaction.totalAmount) }}</td>
              <td>
                <span :class="getStatusClass(transaction.status)" class="badge">
                  <i :class="getStatusIcon(transaction.status)"></i>
                  {{ formatStatus(transaction.status) }}
                </span>
              </td>
              <td>
                <ActionMenu 
                  :actions="getTransactionActions(transaction)" 
                  @action="handleTransactionAction($event, transaction)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="visible-mobile">
        <div class="grid gap-4">
          <div v-for="transaction in paginatedTransactions" :key="transaction.id" class="card">
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span :class="getTransactionTypeClass(transaction.transactionType)" class="badge">
                    <i :class="getTransactionTypeIcon(transaction.transactionType)"></i>
                    {{ formatTransactionType(transaction.transactionType) }}
                  </span>
                  <span :class="getStatusClass(transaction.status)" class="badge">
                    <i :class="getStatusIcon(transaction.status)"></i>
                    {{ formatStatus(transaction.status) }}
                  </span>
                </div>
                <p class="text-sm text-muted">{{ formatDate(transaction.date) }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold">{{ $formatCurrency(transaction.totalAmount) }}</p>
              </div>
            </div>
            
            <div class="grid gap-3 mb-4">
              <div v-if="transaction.customerName">
                <p class="text-xs text-muted font-medium">{{ $t('transactions.customer') }}</p>
                <p class="font-medium">
                  <i class="fas fa-user mr-1"></i>
                  {{ transaction.customerName }}
                </p>
              </div>
              <div v-if="transaction.supplierName">
                <p class="text-xs text-muted font-medium">{{ $t('transactions.supplier') }}</p>
                <p class="font-medium">
                  <i class="fas fa-truck mr-1"></i>
                  {{ transaction.supplierName }}
                </p>
              </div>
              <div v-if="transaction.notes">
                <p class="text-xs text-muted font-medium">{{ $t('transactions.notes') }}</p>
                <p class="text-sm">{{ transaction.notes }}</p>
              </div>
            </div>
            
            <div class="mobile-actions">
              <ActionMenu 
                :actions="getTransactionActions(transaction)" 
                @action="handleTransactionAction($event, transaction)"
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
            {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredTransactions.length }) }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="summary" v-if="filteredTransactions.length > 0">
      <h2>{{ $t('transactions.summary') }}</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <h3>{{ $t('transactions.totalTransactions') }}</h3>
          <p class="summary-value">{{ filteredTransactions.length }}</p>
        </div>
        <div class="summary-card">
          <h3>{{ $t('transactions.totalPurchases') }}</h3>
          <p class="summary-value">{{ $formatCost(totalPurchases) }}</p>
        </div>
        <div class="summary-card">
          <h3>{{ $t('transactions.totalSales') }}</h3>
          <p class="summary-value">{{ $formatCost(totalSales) }}</p>
        </div>
        <div class="summary-card">
          <h3>{{ $t('transactions.balance') }}</h3>
          <p class="summary-value" :class="{ 'positive': totalSales - totalPurchases > 0, 'negative': totalSales - totalPurchases < 0 }">
            {{ $formatCost(totalSales - totalPurchases) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import transactionService from '../services/transactionService';
import api from '../services/api';
import ActionMenu from '../components/ActionMenu.vue';

export default {
  components: {
    ActionMenu
  },
  name: 'TransactionsView',
  data() {
    return {
      transactions: [],
      suppliers: [],
      customers: [],
      loading: true,
      error: null,
      searchQuery: '',
      typeFilter: '',
      statusFilter: '',
      dateFromFilter: '',
      dateToFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
      sortKey: 'date',
      sortOrder: 'desc',
      openDropdown: null,
      openMenuId: null
    };
  },
  computed: {
    filteredTransactions() {
      // Ora i dati sono già filtrati dal server
      return this.transactions;
    },
    paginatedTransactions() {
      // I dati sono già paginati dal server
      return this.transactions;
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.totalItems ? this.totalItems : end;
    },
    totalPurchases() {
      return this.filteredTransactions
        .filter(t => t.transactionType === 'purchase' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    },
    totalSales() {
      return this.filteredTransactions
        .filter(t => t.transactionType === 'sale' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
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
    this.fetchTransactions();
    this.fetchSuppliers();
    this.fetchCustomers();
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  watch: {
    typeFilter() {
      this.currentPage = 1;
      this.fetchTransactions();
    },
    statusFilter() {
      this.currentPage = 1;
      this.fetchTransactions();
    },
    dateFromFilter() {
      this.currentPage = 1;
      this.fetchTransactions();
    },
    dateToFilter() {
      this.currentPage = 1;
      this.fetchTransactions();
    }
  },
  methods: {
    toggleDropdown(transactionId) {
      if (this.openDropdown === transactionId) {
        this.openDropdown = null;
      } else {
        this.openDropdown = transactionId;
      }
    },
    
    closeDropdown() {
      this.openDropdown = null;
    },
    
    toggleMenu(transactionId) {
      if (this.openMenuId === transactionId) {
        this.openMenuId = null;
      } else {
        this.openMenuId = transactionId;
      }
    },
    
    handleOutsideClick(event) {
      if (!event.target.closest('.dropdown') && !event.target.closest('.actions-menu-row')) {
        this.closeDropdown();
        this.openMenuId = null;
      }
    },
    
    async fetchTransactions() {
      this.loading = true;
      this.error = null;
      
      try {
        const options = {
          page: this.currentPage,
          limit: this.itemsPerPage,
          type: this.typeFilter || undefined,
          status: this.statusFilter || undefined
        };
        
        // Aggiungi i filtri di data se presenti
        if (this.dateFromFilter) {
          options.dateFrom = this.dateFromFilter;
        }
        
        if (this.dateToFilter) {
          options.dateTo = this.dateToFilter;
        }
        
        const response = await transactionService.getAllTransactions(options);
        this.transactions = response.data.transactions;
        this.totalItems = response.data.pagination.totalItems;
        this.totalPages = response.data.pagination.totalPages;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        this.error = this.$t('errors.fetchTransactions');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSuppliers() {
      try {
        const response = await api.get('/api/suppliers');
        this.suppliers = response.data;
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    },
    
    async fetchCustomers() {
      try {
        const response = await api.get('/api/customers');
        this.customers = response.data;
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    },
    
    getSupplierName(supplierId) {
      if (!supplierId) return 'N/A';
      const supplier = this.suppliers.find(s => s.id === supplierId);
      return supplier ? supplier.name : this.$t('common.unknownSupplier');
    },
    
    getCustomerName(customerId) {
      if (!customerId) return 'N/A';
      const customer = this.customers.find(c => c.id === customerId);
      return customer ? customer.name : this.$t('common.unknownCustomer');
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    formatType(type) {
      switch (type) {
        case 'purchase':
          return this.$t('transactions.purchase');
        case 'sale':
          return this.$t('transactions.sale');
        default:
          return type;
      }
    },
    
    formatStatus(status) {
      switch (status) {
        case 'pending':
          return this.$t('transactions.pending');
        case 'completed':
          return this.$t('transactions.completed');
        case 'cancelled':
          return this.$t('transactions.cancelled');
        default:
          return status;
      }
    },
    
    formatTransactionType(type) {
      switch (type) {
        case 'sale':
          return this.$t('transactions.sale');
        case 'purchase':
          return this.$t('transactions.purchase');
        default:
          return type;
      }
    },
    
    getTransactionTypeClass(type) {
      switch (type) {
        case 'sale':
          return 'badge-sale';
        case 'purchase':
          return 'badge-purchase';
        default:
          return 'badge-secondary';
      }
    },
    
    getTransactionTypeIcon(type) {
      switch (type) {
        case 'sale':
          return 'fas fa-arrow-up';
        case 'purchase':
          return 'fas fa-arrow-down';
        default:
          return 'fas fa-exchange-alt';
      }
    },
    
    getStatusIcon(status) {
      switch (status) {
        case 'completed':
          return 'fas fa-check-circle';
        case 'pending':
          return 'fas fa-clock';
        case 'cancelled':
          return 'fas fa-times-circle';
        default:
          return 'fas fa-question-circle';
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'status-pending';
        case 'completed':
          return 'status-completed';
        case 'cancelled':
          return 'status-cancelled';
        default:
          return '';
      }
    },
    
    async updateStatus(id, newStatus) {
      try {
        await transactionService.updateTransaction(id, { status: newStatus });
        // Aggiorna la transazione localmente
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transactions[index].status = newStatus;
        }
        this.closeDropdown();
      } catch (error) {
        console.error('Error updating transaction status:', error);
        alert(this.$t('errors.updateTransactionStatus'));
        this.closeDropdown();
      }
    },
    
    async deleteTransaction(id) {
      if (!confirm(this.$t('transactions.confirmDelete'))) {
        return;
      }
      
      try {
        await transactionService.deleteTransaction(id);
        this.transactions = this.transactions.filter(t => t.id !== id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        if (error.response && error.response.status === 400) {
          alert(error.response.data);
        } else {
          alert(this.$t('errors.deleteTransaction'));
        }
      }
    },

    getTransactionActions(transaction) {
      return [
        {
          key: 'view',
          label: this.$t('common.view'),
          icon: 'fas fa-eye',
          variant: 'default',
          tooltip: 'View transaction details'
        },
        {
          key: 'edit',
          label: this.$t('common.edit'),
          icon: 'fas fa-edit',
          variant: 'primary',
          tooltip: 'Edit transaction'
        },
        {
          key: 'duplicate',
          label: this.$t('common.duplicate'),
          icon: 'fas fa-copy',
          variant: 'default',
          tooltip: 'Duplicate transaction'
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          icon: 'fas fa-trash',
          variant: 'danger',
          tooltip: 'Delete transaction'
        }
      ];
    },

    handleTransactionAction(actionKey, transaction) {
      switch (actionKey) {
        case 'view':
          this.viewTransaction(transaction.id);
          break;
        case 'edit':
          this.editTransaction(transaction.id);
          break;
        case 'duplicate':
          this.duplicateTransaction(transaction);
          break;
        case 'delete':
          this.deleteTransaction(transaction.id);
          break;
      }
    },

    viewTransaction(id) {
      this.$router.push(`/transactions/${id}/view`);
    },

    editTransaction(id) {
      this.$router.push(`/transactions/${id}/edit`);
    },

    duplicateTransaction(transaction) {
      // Navigate to create form with pre-filled data
      this.$router.push({
        path: '/transactions/new',
        query: { duplicate: transaction.id }
      });
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchTransactions();
      }
    },

    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      this.fetchTransactions();
    },

    updatePagination() {
      this.currentPage = 1;
      this.fetchTransactions();
    },

    filterTransactions() {
      this.currentPage = 1;
      this.fetchTransactions();
    }
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f1f3f4;
}

.transactions-content {
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

/* Badge styles for transaction types and status */
.badge-sale {
  background: linear-gradient(135deg, var(--danger) 0%, var(--cardinal) 100%);
  color: white;
  border: 1px solid var(--danger);
}

.badge-purchase {
  background: linear-gradient(135deg, var(--primary) 0%, var(--oxford-blue-light) 100%);
  color: white;
  border: 1px solid var(--primary);
}

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

.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.badge-secondary {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.filter-group select, .filter-group input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-size: 14px;
  line-height: 1.2;
  text-align: center;
  vertical-align: middle;
}

.btn-primary {
  background-color: var(--secondary);
  color: var(--surface);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.2;
}

.btn-success {
  background-color: var(--success);
  color: var(--surface);
}

.btn-warning {
  background-color: var(--warning);
  color: var(--oxford-blue);
}

.btn-danger {
  background-color: var(--danger);
  color: var(--surface);
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
  margin-bottom: 30px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.status-pending {
  background: linear-gradient(135deg, var(--secondary) 0%, var(--fulvous-light) 100%);
  color: var(--oxford-blue);
  border: 1px solid var(--secondary);
}

.status-completed {
  background-color: #d4edda;
}

.status-cancelled {
  background-color: #f8d7da;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #6c757d;
  min-width: 30px;
  text-align: center;
}

.dropdown-toggle:hover {
  background-color: #e9ecef;
  color: #495057;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 1000;
  margin-top: 2px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-decoration: none;
  color: #212529;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.btn-success-item:hover {
  background-color: #d4edda;
  color: #155724;
}

.btn-warning-item:hover {
  background-color: #fff3cd;
  color: #856404;
}

.btn-danger-item:hover {
  background-color: #f8d7da;
  color: #721c24;
}

.summary {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.summary-card h3 {
  margin-top: 0;
  font-size: 16px;
  color: #6c757d;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 0;
}

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.btn-active {
  background-color: var(--primary);
  color: white;
}

.pagination-info {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 20px;
}

.actions-menu-row {
  position: relative;
}

.btn-menu {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #6c757d;
}

.btn-menu:hover {
  color: #495057;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 1000;
  margin-top: 2px;
}

.btn-view, .btn-edit, .btn-danger {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-decoration: none;
  color: #212529;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger {
  color: #dc3545;
}

.btn-danger:hover {
  background-color: #f8d7da;
}

.btn-edit:hover {
  background-color: #e2e3e5;
}
</style>