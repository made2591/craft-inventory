<template>
  <div class="inventory-view">
    <h1>{{ $t('inventory.viewTitle') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="inventory-details">
      <div class="detail-header">
        <h2>{{ item.modelName }}</h2>
        <div class="actions">
          <button @click="editItem" class="btn btn-primary">{{ $t('common.edit') }}</button>
          <button @click="goBack" class="btn btn-secondary">{{ $t('common.back') }}</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">{{ $t('inventory.model') }}:</div>
          <div class="detail-value">{{ item.modelName }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('inventory.modelSku') }}:</div>
          <div class="detail-value">
            <router-link v-if="item.modelSku" :to="`/models/${item.modelId}/view`" class="sku-link">
              {{ item.modelSku }}
            </router-link>
            <span v-else>N/A</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('inventory.quantity') }}:</div>
          <div class="detail-value">{{ $formatQuantity(item.quantity) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('inventory.productionDate') }}:</div>
          <div class="detail-value">{{ formatDate(item.productionDate) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('inventory.notes') }}:</div>
          <div class="detail-value">{{ item.notes || $t('common.noNotes') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.createdAt') }}:</div>
          <div class="detail-value">{{ formatDate(item.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.updatedAt') }}:</div>
          <div class="detail-value">{{ formatDate(item.updatedAt) }}</div>
        </div>
      </div>
      
      <h2>{{ $t('inventory.modelComponents') }}</h2>
      <div v-if="components.length === 0" class="empty-components">
        {{ $t('inventory.noComponents') }}
      </div>
      <div v-else class="components-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('components.sku') }}</th>
              <th>{{ $t('components.name') }}</th>
              <th>{{ $t('components.quantity') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in components" :key="component.id">
              <td>
                <router-link :to="`/components/${component.componentId}/view`" class="sku-link">
                  {{ component.sku || 'N/A' }}
                </router-link>
              </td>
              <td>{{ component.componentName }}</td>
              <td>{{ $formatQuantity(component.quantity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2>{{ $t('inventory.salesHistory') }}</h2>
      <div v-if="saleTransactions.length === 0" class="empty-transactions">
        {{ $t('inventory.noSales') }}
      </div>
      <div v-else class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('transactions.date') }}</th>
              <th>{{ $t('transactions.customer') }}</th>
              <th>{{ $t('transactions.quantity') }}</th>
              <th>{{ $t('transactions.unitPrice') }}</th>
              <th>{{ $t('transactions.total') }}</th>
              <th>{{ $t('transactions.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in paginatedSales" :key="transaction.id" :class="getStatusClass(transaction.status)">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>{{ transaction.customerName || 'N/A' }}</td>
              <td>
                {{ transaction.items && transaction.items.length > 0 ? transaction.items[0].quantity : 'N/A' }}
              </td>
              <td>
                € {{ transaction.items && transaction.items.length > 0 ? formatCost(transaction.items[0].unitPrice) : '0.00' }}
              </td>
              <td>{{ $formatCost(transaction.totalAmount) }}</td>
              <td>{{ formatStatus(transaction.status) }}</td>
              <td>
                <ActionMenu 
                  :actions="getTransactionActions(transaction)" 
                  @action="handleTransactionAction($event, transaction)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Paginazione -->
        <div class="pagination" v-if="saleTransactions.length > itemsPerPage">
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
        
        <div class="pagination-info" v-if="saleTransactions.length > 0">
          {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: saleTransactions.length }) }}
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
  name: 'InventoryView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      item: {},
      components: [],
      loading: true,
      error: null,
      sales: [],
      salesLoading: false,
      salesError: null,
      currentPage: 1,
      itemsPerPage: 5,
      totalSalesItems: 0,
      totalSalesPages: 0
    };
  },
  created() {
    this.fetchInventoryItem();
  },
  computed: {
    saleTransactions() {
      return this.sales;
    },
    totalPages() {
      return this.totalSalesPages;
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.totalSalesItems ? this.totalSalesItems : end;
    },
    paginatedSales() {
      return this.sales;
    }
  },
  methods: {
    async fetchInventoryItem() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch inventory item details
        const response = await api.get(`/api/inventory/${this.id}`);
        this.item = response.data;
        
        // Fetch model details to get the SKU
        if (this.item.modelId) {
          await this.fetchModelDetails();
          // Dopo aver ottenuto i dettagli del modello, recupera le vendite
          this.fetchSalesHistory();
        }
      } catch (error) {
        console.error('Error fetching inventory item:', error);
        this.error = this.$t('errors.fetchInventoryItem');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSalesHistory(page = 1) {
      this.salesLoading = true;
      this.salesError = null;
      
      try {
        const response = await api.get(`/api/inventory/${this.id}/sales`, {
          params: {
            page: page,
            limit: this.itemsPerPage
          }
        });
        
        this.sales = response.data.sales;
        this.totalSalesItems = response.data.pagination.totalItems;
        this.totalSalesPages = response.data.pagination.totalPages;
        this.currentPage = response.data.pagination.page;
      } catch (error) {
        console.error('Error fetching sales history:', error);
        this.salesError = this.$t('errors.fetchSalesHistory');
      } finally {
        this.salesLoading = false;
      }
    },
    
    async fetchModelDetails() {
      try {
        const response = await api.get(`/api/models/${this.item.modelId}`);
        this.item.modelSku = response.data.model.sku;
        this.components = response.data.components || [];
      } catch (error) {
        console.error('Error fetching model details:', error);
      }
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
    
    editItem() {
      this.$router.push(`/inventory/${this.id}`);
    },
    
    goBack() {
      this.$router.push('/inventory');
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.fetchSalesHistory(page);
      }
    },
    
    formatCost(value) {
      if (value === undefined || value === null) return '0.00';
      return parseFloat(value).toFixed(2);
    },
    
    formatStatus(status) {
      if (!status) return 'N/A';
      
      const statusMap = {
        'pending': this.$t('transactions.pending'),
        'completed': this.$t('transactions.completed'),
        'cancelled': this.$t('transactions.cancelled')
      };
      
      return statusMap[status] || status;
    },
    
    getStatusClass(status) {
      if (!status) return '';
      
      const statusClassMap = {
        'pending': 'status-pending',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      };
      
      return statusClassMap[status] || '';
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
        }
      ];
    },

    handleTransactionAction(actionKey, transaction) {
      switch (actionKey) {
        case 'view':
          this.$router.push(`/transactions/${transaction.id}/view`);
          break;
        case 'edit':
          this.$router.push(`/transactions/${transaction.id}/edit`);
          break;
      }
    }
  }
};
</script>

<style scoped>
.inventory-view {
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

.sku-link {
  color: var(--secondary);
  text-decoration: none;
  font-weight: 600;
}

.sku-link:hover {
  color: var(--fulvous-dark);
  text-decoration: underline;
}

.empty-components {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
  margin-bottom: 20px;
}

.components-table {
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

.empty-transactions {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
  margin-bottom: 20px;
}

.transactions-table {
  margin-top: 10px;
  margin-bottom: 20px;
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
  margin-top: 10px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px;
  line-height: 20px;
}

.btn-active {
  background-color: var(--primary);
  color: white;
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
</style>