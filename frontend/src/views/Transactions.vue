<template>
  <div class="transactions">
    <h1>{{ $t('transactions.title') }}</h1>
    
    <div class="actions">
      <router-link to="/transactions/new" class="btn btn-primary">{{ $t('transactions.newTransaction') }}</router-link>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label for="transaction-type">{{ $t('transactions.type') }}:</label>
        <select id="transaction-type" v-model="typeFilter">
          <option value="">{{ $t('transactions.all') }}</option>
          <option value="purchase">{{ $t('transactions.purchase') }}</option>
          <option value="sale">{{ $t('transactions.sale') }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="transaction-status">{{ $t('transactions.status') }}:</label>
        <select id="transaction-status" v-model="statusFilter">
          <option value="">{{ $t('transactions.all') }}</option>
          <option value="pending">{{ $t('transactions.pending') }}</option>
          <option value="completed">{{ $t('transactions.completed') }}</option>
          <option value="cancelled">{{ $t('transactions.cancelled') }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="date-from">{{ $t('transactions.from') }}:</label>
        <input type="date" id="date-from" v-model="dateFromFilter">
      </div>
      
      <div class="filter-group">
        <label for="date-to">{{ $t('transactions.to') }}:</label>
        <input type="date" id="date-to" v-model="dateToFilter">
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="filteredTransactions.length === 0" class="empty-state">
      {{ $t('transactions.noTransactions') }}
    </div>
    
    <div v-else class="transactions-list">
      <table>
        <thead>
          <tr>
            <th>{{ $t('transactions.date') }}</th>
            <th>{{ $t('transactions.type') }}</th>
            <th>{{ $t('transactions.clientSupplier') }}</th>
            <th>{{ $t('transactions.totalAmount') }}</th>
            <th>{{ $t('transactions.status') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in paginatedTransactions" :key="transaction.id" :class="getStatusClass(transaction.status)">
            <td>{{ formatDate(transaction.date) }}</td>
            <td>{{ formatType(transaction.transactionType) }}</td>
            <td>
              <span v-if="transaction.transactionType === 'purchase'">
                {{ getSupplierName(transaction.supplierId) }}
              </span>
              <span v-else>
                {{ getCustomerName(transaction.customerId) }}
              </span>
            </td>
            <td>€ {{ formatCost(transaction.totalAmount) }}</td>
            <td>{{ formatStatus(transaction.status) }}</td>
            <td class="actions">
              <router-link :to="`/transactions/${transaction.id}`" class="btn btn-sm">{{ $t('common.details') }}</router-link>
              <button 
                v-if="transaction.status === 'pending'" 
                @click="updateStatus(transaction.id, 'completed')" 
                class="btn btn-sm btn-success"
              >
                {{ $t('transactions.complete') }}
              </button>
              <button 
                v-if="transaction.status === 'pending'" 
                @click="updateStatus(transaction.id, 'cancelled')" 
                class="btn btn-sm btn-warning"
              >
                {{ $t('transactions.cancel') }}
              </button>
              <button 
                v-if="transaction.status !== 'completed'" 
                @click="deleteTransaction(transaction.id)" 
                class="btn btn-sm btn-danger"
              >
                {{ $t('common.delete') }}
              </button>
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
        {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: totalItems }) }}
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
          <p class="summary-value">€ {{ formatCost(totalPurchases) }}</p>
        </div>
        <div class="summary-card">
          <h3>{{ $t('transactions.totalSales') }}</h3>
          <p class="summary-value">€ {{ formatCost(totalSales) }}</p>
        </div>
        <div class="summary-card">
          <h3>{{ $t('transactions.balance') }}</h3>
          <p class="summary-value" :class="{ 'positive': totalSales - totalPurchases > 0, 'negative': totalSales - totalPurchases < 0 }">
            € {{ formatCost(totalSales - totalPurchases) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import transactionService from '../services/transactionService';
import api from '../services/api';

export default {
  name: 'TransactionsView',
  data() {
    return {
      transactions: [],
      suppliers: [],
      customers: [],
      loading: true,
      error: null,
      typeFilter: '',
      statusFilter: '',
      dateFromFilter: '',
      dateToFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0
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
    }
  },
  created() {
    this.fetchTransactions();
    this.fetchSuppliers();
    this.fetchCustomers();
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
    
    formatCost(cost) {
      if (cost === undefined || cost === null) return '0.00';
      const numCost = typeof cost === 'number' ? cost : parseFloat(cost);
      return isNaN(numCost) ? '0.00' : numCost.toFixed(2);
    },
    
    async updateStatus(id, newStatus) {
      try {
        await transactionService.updateTransaction(id, { status: newStatus });
        // Aggiorna la transazione localmente
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transactions[index].status = newStatus;
        }
      } catch (error) {
        console.error('Error updating transaction status:', error);
        alert(this.$t('errors.updateTransactionStatus'));
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
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchTransactions();
      }
    }
  }
};
</script>

<style scoped>
.transactions {
  padding: 20px;
}

h1, h2 {
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
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
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-danger {
  background-color: #dc3545;
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
  margin-bottom: 30px;
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

.status-pending {
  background-color: #fff3cd;
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
</style>