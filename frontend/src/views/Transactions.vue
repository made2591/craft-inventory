<template>
  <div class="transactions">
    <h1>Gestione Transazioni</h1>
    
    <div class="actions">
      <router-link to="/transactions/new" class="btn btn-primary">Nuova Transazione</router-link>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label for="transaction-type">Tipo:</label>
        <select id="transaction-type" v-model="typeFilter">
          <option value="">Tutti</option>
          <option value="purchase">Acquisti</option>
          <option value="sale">Vendite</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="transaction-status">Stato:</label>
        <select id="transaction-status" v-model="statusFilter">
          <option value="">Tutti</option>
          <option value="pending">In attesa</option>
          <option value="completed">Completate</option>
          <option value="cancelled">Annullate</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="date-from">Da:</label>
        <input type="date" id="date-from" v-model="dateFromFilter">
      </div>
      
      <div class="filter-group">
        <label for="date-to">A:</label>
        <input type="date" id="date-to" v-model="dateToFilter">
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="filteredTransactions.length === 0" class="empty-state">
      Nessuna transazione trovata. Aggiungi la tua prima transazione!
    </div>
    
    <div v-else class="transactions-list">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Cliente/Fornitore</th>
            <th>Importo Totale</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id" :class="getStatusClass(transaction.status)">
            <td>{{ formatDate(transaction.date) }}</td>
            <td>{{ formatType(transaction.transaction_type) }}</td>
            <td>
              <span v-if="transaction.transaction_type === 'purchase'">
                {{ getSupplierName(transaction.supplier_id) }}
              </span>
              <span v-else>
                {{ getCustomerName(transaction.customer_id) }}
              </span>
            </td>
            <td>€ {{ transaction.total_amount !== undefined ? transaction.total_amount.toFixed(2) : '0.00' }}</td>
            <td>{{ formatStatus(transaction.status) }}</td>
            <td class="actions">
              <router-link :to="`/transactions/${transaction.id}`" class="btn btn-sm">Dettagli</router-link>
              <button 
                v-if="transaction.status === 'pending'" 
                @click="updateStatus(transaction.id, 'completed')" 
                class="btn btn-sm btn-success"
              >
                Completa
              </button>
              <button 
                v-if="transaction.status === 'pending'" 
                @click="updateStatus(transaction.id, 'cancelled')" 
                class="btn btn-sm btn-warning"
              >
                Annulla
              </button>
              <button 
                v-if="transaction.status !== 'completed'" 
                @click="deleteTransaction(transaction.id)" 
                class="btn btn-sm btn-danger"
              >
                Elimina
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="summary" v-if="filteredTransactions.length > 0">
      <h2>Riepilogo</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Totale Transazioni</h3>
          <p class="summary-value">{{ filteredTransactions.length }}</p>
        </div>
        <div class="summary-card">
          <h3>Totale Acquisti</h3>
          <p class="summary-value">€ {{ totalPurchases !== undefined ? totalPurchases.toFixed(2) : '0.00' }}</p>
        </div>
        <div class="summary-card">
          <h3>Totale Vendite</h3>
          <p class="summary-value">€ {{ totalSales !== undefined ? totalSales.toFixed(2) : '0.00' }}</p>
        </div>
        <div class="summary-card">
          <h3>Bilancio</h3>
          <p class="summary-value" :class="{ 'positive': totalSales - totalPurchases > 0, 'negative': totalSales - totalPurchases < 0 }">
            € {{ (totalSales - totalPurchases) !== undefined ? (totalSales - totalPurchases).toFixed(2) : '0.00' }}
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
      dateToFilter: ''
    };
  },
  computed: {
    filteredTransactions() {
      let filtered = [...this.transactions];
      
      // Filtra per tipo
      if (this.typeFilter) {
        filtered = filtered.filter(t => t.transaction_type === this.typeFilter);
      }
      
      // Filtra per stato
      if (this.statusFilter) {
        filtered = filtered.filter(t => t.status === this.statusFilter);
      }
      
      // Filtra per data di inizio
      if (this.dateFromFilter) {
        const fromDate = new Date(this.dateFromFilter);
        filtered = filtered.filter(t => new Date(t.date) >= fromDate);
      }
      
      // Filtra per data di fine
      if (this.dateToFilter) {
        const toDate = new Date(this.dateToFilter);
        toDate.setHours(23, 59, 59, 999); // Imposta alla fine della giornata
        filtered = filtered.filter(t => new Date(t.date) <= toDate);
      }
      
      return filtered;
    },
    totalPurchases() {
      return this.filteredTransactions
        .filter(t => t.transaction_type === 'purchase' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + t.total_amount, 0);
    },
    totalSales() {
      return this.filteredTransactions
        .filter(t => t.transaction_type === 'sale' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + t.total_amount, 0);
    }
  },
  created() {
    this.fetchTransactions();
    this.fetchSuppliers();
    this.fetchCustomers();
  },
  methods: {
    async fetchTransactions() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await transactionService.getAllTransactions();
        this.transactions = response.data;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        this.error = 'Si è verificato un errore durante il recupero delle transazioni. Riprova più tardi.';
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
      return supplier ? supplier.name : 'Fornitore sconosciuto';
    },
    
    getCustomerName(customerId) {
      if (!customerId) return 'N/A';
      const customer = this.customers.find(c => c.id === customerId);
      return customer ? customer.name : 'Cliente sconosciuto';
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    formatType(type) {
      switch (type) {
        case 'purchase':
          return 'Acquisto';
        case 'sale':
          return 'Vendita';
        default:
          return type;
      }
    },
    
    formatStatus(status) {
      switch (status) {
        case 'pending':
          return 'In attesa';
        case 'completed':
          return 'Completata';
        case 'cancelled':
          return 'Annullata';
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
        alert('Si è verificato un errore durante l\'aggiornamento dello stato della transazione.');
      }
    },
    
    async deleteTransaction(id) {
      if (!confirm('Sei sicuro di voler eliminare questa transazione?')) {
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
          alert('Si è verificato un errore durante l\'eliminazione della transazione.');
        }
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