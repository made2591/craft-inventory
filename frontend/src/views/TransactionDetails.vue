<template>
  <div class="transaction-details">
    <div class="header">
      <h1>{{ $t('transactions.detailsTitle') }}</h1>
      <div class="actions">
        <router-link to="/transactions" class="btn btn-secondary">{{ $t('transactions.backToTransactions') }}</router-link>
        <button 
          v-if="transaction && transaction.status === 'pending'" 
          @click="updateStatus('completed')" 
          class="btn btn-success"
        >
          {{ $t('transactions.complete') }}
        </button>
        <button 
          v-if="transaction && transaction.status === 'pending'" 
          @click="updateStatus('cancelled')" 
          class="btn btn-warning"
        >
          {{ $t('transactions.cancel') }}
        </button>
        <button 
          v-if="transaction && transaction.status !== 'completed'" 
          @click="deleteTransaction" 
          class="btn btn-danger"
        >
          {{ $t('common.delete') }}
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="!transaction" class="empty-state">
      {{ $t('transactions.notFound') }}
    </div>
    
    <div v-else class="transaction-content">
      <div class="transaction-info">
        <div class="info-card">
          <h2>{{ $t('transactions.generalInfo') }}</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">{{ $t('common.id') }}:</span>
              <span class="value">{{ transaction.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('transactions.type') }}:</span>
              <span class="value">{{ formatType(transaction.transactionType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('transactions.date') }}:</span>
              <span class="value">{{ formatDate(transaction.date) }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('transactions.status') }}:</span>
              <span class="value" :class="getStatusClass(transaction.status)">
                {{ formatStatus(transaction.status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('transactions.totalAmount') }}:</span>
              <span class="value">{{ $formatCost(transaction.totalAmount) }}</span>
            </div>
            <div class="info-item" v-if="transaction.transactionType === 'purchase'">
              <span class="label">{{ $t('transactions.supplier') }}:</span>
              <span class="value">{{ getSupplierName(transaction.supplierId) }}</span>
            </div>
            <div class="info-item" v-else>
              <span class="label">{{ $t('transactions.customer') }}:</span>
              <span class="value">{{ getCustomerName(transaction.customerId) }}</span>
            </div>
            <div class="info-item" v-if="transaction.notes">
              <span class="label">{{ $t('transactions.notes') }}:</span>
              <span class="value">{{ transaction.notes }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="transaction-items">
        <h2>{{ $t('transactions.transactionItems') }}</h2>
        <table>
          <thead>
            <tr>
              <th>{{ $t('transactions.item') }}</th>
              <th>{{ $t('transactions.quantity') }}</th>
              <th>{{ $t('transactions.unitPrice') }}</th>
              <th>{{ $t('transactions.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <span v-if="item.productModelId">
                  {{ getModelName(item.productModelId) }}
                </span>
                <span v-else-if="item.materialId">
                  {{ getMaterialName(item.materialId) }}
                </span>
                <span v-else>{{ $t('common.unknownItem') }}</span>
              </td>
              <td>{{ $formatQuantity(item.quantity) }}</td>
              <td>{{ $formatCost(item.unitPrice) }}</td>
              <td>{{ $formatCost(item.quantity * item.unitPrice) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">{{ $t('transactions.total') }}</td>
              <td class="total-value">{{ $formatCost(transaction.totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import transactionService from '../services/transactionService';
import api from '../services/api';

export default {
  name: 'TransactionDetailsView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      transaction: null,
      items: [],
      suppliers: [],
      customers: [],
      materials: [],
      models: [],
      loading: true,
      error: null
    };
  },
  created() {
    this.fetchTransaction();
    this.fetchSuppliers();
    this.fetchCustomers();
    this.fetchMaterials();
    this.fetchModels();
  },
  methods: {
    async fetchTransaction() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await transactionService.getTransactionById(this.id);
        this.transaction = response.data.transaction;
        this.items = response.data.items;
      } catch (error) {
        console.error('Error fetching transaction:', error);
        this.error = this.$t('errors.fetchTransaction');
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
    
    async fetchMaterials() {
      try {
        const response = await api.get('/api/materials');
        this.materials = response.data;
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    },
    
    async fetchModels() {
      try {
        const response = await api.get('/api/models');
        this.models = response.data;
      } catch (error) {
        console.error('Error fetching models:', error);
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
    
    getMaterialName(materialId) {
      if (!materialId) return 'N/A';
      const material = this.materials.find(m => m.id === materialId);
      return material ? material.name : this.$t('common.unknownMaterial');
    },
    
    getModelName(modelId) {
      if (!modelId) return 'N/A';
      const model = this.models.find(m => m.id === modelId);
      return model ? model.name : this.$t('common.unknownModel');
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
    
    async updateStatus(newStatus) {
      try {
        await transactionService.updateTransaction(this.id, { status: newStatus });
        this.transaction.status = newStatus;
      } catch (error) {
        console.error('Error updating transaction status:', error);
        alert(this.$t('errors.updateTransactionStatus'));
      }
    },
    
    async deleteTransaction() {
      if (!confirm(this.$t('transactions.confirmDelete'))) {
        return;
      }
      
      try {
        await transactionService.deleteTransaction(this.id);
        this.$router.push('/transactions');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        if (error.response && error.response.status === 400) {
          alert(error.response.data);
        } else {
          alert(this.$t('errors.deleteTransaction'));
        }
      }
    }
  }
};
</script>

<style scoped>
.transaction-details {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 10px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
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

.transaction-content {
  display: grid;
  gap: 30px;
}

.info-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: bold;
  color: #6c757d;
  font-size: 14px;
}

.value {
  font-size: 16px;
}

.status-pending {
  color: #ffc107;
  font-weight: bold;
}

.status-completed {
  color: #28a745;
  font-weight: bold;
}

.status-cancelled {
  color: #dc3545;
  font-weight: bold;
}

.transaction-items {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
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

tfoot {
  font-weight: bold;
}

.total-label {
  text-align: right;
}

.total-value {
  font-size: 18px;
}
</style>