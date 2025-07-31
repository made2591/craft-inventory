<template>
  <div class="customer-view">
    <h1>{{ $t('customers.viewTitle') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="customer-details">
      <div class="detail-header">
        <h2>{{ customer.name }}</h2>
        <div class="actions">
          <button @click="editCustomer" class="btn btn-primary">{{ $t('common.edit') }}</button>
          <button @click="goBack" class="btn btn-secondary">{{ $t('common.back') }}</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">{{ $t('customers.contactPerson') }}:</div>
          <div class="detail-value">{{ customer.contactPerson || $t('common.notSpecified') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('customers.customerType') }}:</div>
          <div class="detail-value">{{ formatCustomerType(customer.customerType) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('customers.email') }}:</div>
          <div class="detail-value">{{ customer.email || $t('common.notSpecified') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('customers.phone') }}:</div>
          <div class="detail-value">{{ customer.phone || $t('common.notSpecified') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('customers.address') }}:</div>
          <div class="detail-value">{{ customer.address || $t('common.notSpecified') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.link') }}:</div>
          <div class="detail-value">
            <a v-if="customer.link" :href="customer.link" target="_blank" rel="noopener noreferrer">{{ customer.link }}</a>
            <span v-else>{{ $t('common.notSpecified') }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.notes') }}:</div>
          <div class="detail-value">{{ customer.notes || $t('common.noNotes') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.createdAt') }}:</div>
          <div class="detail-value">{{ formatDate(customer.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.updatedAt') }}:</div>
          <div class="detail-value">{{ formatDate(customer.updatedAt) }}</div>
        </div>
      </div>
      
      <h2>{{ $t('customers.materialsSold') }}</h2>
      <div v-if="transactionsError" class="error-message">
        {{ transactionsError }}
      </div>
      <div v-else-if="materialTransactions.length === 0" class="empty-transactions">
        {{ $t('customers.noMaterialTransactions') }}
      </div>
      <div v-else class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('transactions.date') }}</th>
              <th>{{ $t('transactions.material') }}</th>
              <th>{{ $t('transactions.quantity') }}</th>
              <th>{{ $t('transactions.unitPrice') }}</th>
              <th>{{ $t('transactions.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in materialTransactions" :key="`material-${transaction.id}`">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>
                <div v-for="item in transaction.materialItems" :key="item.id">
                  <router-link :to="`/materials/${item.materialId}/view`" class="material-link">
                    {{ item.materialName || $t('common.notAvailable') }}
                  </router-link>
                </div>
              </td>
              <td>
                <div v-for="item in transaction.materialItems" :key="item.id">
                  {{ item.quantity }} {{ item.unitOfMeasure || '' }}
                </div>
              </td>
              <td>
                <div v-for="item in transaction.materialItems" :key="item.id">
                  {{ $formatCurrency(item.unitPrice) }}
                </div>
              </td>
              <td>{{ $formatCurrency(transaction.materialTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>{{ $t('customers.modelsSold') }}</h2>
      <div v-if="transactionsError" class="error-message">
        {{ transactionsError }}
      </div>
      <div v-else-if="modelTransactions.length === 0" class="empty-transactions">
        {{ $t('customers.noModelTransactions') }}
      </div>
      <div v-else class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('transactions.date') }}</th>
              <th>{{ $t('transactions.model') }}</th>
              <th>{{ $t('transactions.quantity') }}</th>
              <th>{{ $t('transactions.unitPrice') }}</th>
              <th>{{ $t('transactions.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in modelTransactions" :key="`model-${transaction.id}`">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>
                <div v-for="item in transaction.modelItems" :key="item.id">
                  <router-link :to="`/models/${item.productModelId}/view`" class="material-link">
                    {{ item.modelName || $t('common.notAvailable') }}
                  </router-link>
                </div>
              </td>
              <td>
                <div v-for="item in transaction.modelItems" :key="item.id">
                  {{ item.quantity }} {{ item.unitOfMeasure || '' }}
                </div>
              </td>
              <td>
                <div v-for="item in transaction.modelItems" :key="item.id">
                  {{ $formatCurrency(item.unitPrice) }}
                </div>
              </td>
              <td>{{ $formatCurrency(transaction.modelTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import { FormatterMixin } from '../utils/formatterMixin';

export default {
  name: 'CustomerView',
  mixins: [FormatterMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      customer: {},
      transactions: [],
      materialTransactions: [],
      modelTransactions: [],
      loading: true,
      error: null,
      transactionsError: null
    };
  },
  created() {
    this.fetchCustomer();
  },
  methods: {
    async fetchCustomer() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch customer details
        const response = await api.get(`/api/customers/${this.id}`);
        this.customer = response.data;
        
        // Fetch transactions with this customer
        await this.fetchTransactions();
      } catch (error) {
        console.error('Error fetching customer:', error);
        this.error = this.$t('errors.fetchCustomer');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchTransactions() {
      try {
        const response = await api.get(`/api/transactions?customerId=${this.id}&type=sale`);
        console.log('Transactions response:', response.data);
        
        // Il backend restituisce { transactions: [...], pagination: {...} }
        if (response.data && response.data.transactions) {
          this.transactions = response.data.transactions;
        } else if (Array.isArray(response.data)) {
          this.transactions = response.data;
        } else {
          this.transactions = [];
        }
        
        this.transactionsError = null;
        this.processTransactions();
      } catch (error) {
        this.transactionsError = this.$t('errors.fetchTransactions');
        console.error('Error fetching transactions:', error);
      }
    },

    processTransactions() {
      const materialTxns = [];
      const modelTxns = [];

      this.transactions.forEach(transaction => {
        // Separa gli items per materiali e modelli
        const materialItems = (transaction.items || []).filter(item => item.materialId);
        const modelItems = (transaction.items || []).filter(item => item.productModelId);

        // Se ci sono materiali, crea una transazione per materiali
        if (materialItems.length > 0) {
          const materialTotal = materialItems.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0);
          
          materialTxns.push({
            ...transaction,
            materialItems,
            materialTotal
          });
        }

        // Se ci sono modelli, crea una transazione per modelli
        if (modelItems.length > 0) {
          const modelTotal = modelItems.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0);
          
          modelTxns.push({
            ...transaction,
            modelItems,
            modelTotal
          });
        }
      });

      this.materialTransactions = materialTxns;
      this.modelTransactions = modelTxns;
    },
    
    formatCustomerType(type) {
      const types = {
        'private': this.$t('customers.private'),
        'business': this.$t('customers.business'),
        'wholesale': this.$t('customers.wholesale'),
        'retail': this.$t('customers.retail')
      };
      return types[type] || type;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    },
    
    editCustomer() {
      this.$router.push(`/customers/${this.id}`);
    },
    
    goBack() {
      this.$router.push('/customers');
    }
  }
};
</script>

<style scoped>
.customer-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error {
  color: #dc3545;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.detail-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 200px;
  font-weight: bold;
  color: #555;
}

.detail-value {
  flex: 1;
}

.detail-value a {
  color: var(--secondary);
  text-decoration: none;
}

.detail-value a:hover {
  text-decoration: underline;
}

.empty-transactions {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
  margin-bottom: 20px;
}

.error-message {
  text-align: center;
  padding: 15px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  border-radius: 4px;
  margin-bottom: 20px;
}

.transactions-table {
  margin-top: 10px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #555;
}

.material-link {
  color: var(--secondary);
  text-decoration: none;
}

.material-link:hover {
  text-decoration: underline;
}
</style>