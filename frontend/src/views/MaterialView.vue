<template>
  <div class="material-view">
    <h1>{{ $t('materials.viewTitle') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="material-details">
      <div class="detail-header">
        <div class="sku-badge">{{ $t('materials.sku') }}: {{ material.sku || 'N/A' }}</div>
        <div class="actions">
          <button @click="editMaterial" class="btn btn-primary">{{ $t('common.edit') }}</button>
          <button @click="goBack" class="btn btn-secondary">{{ $t('common.back') }}</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.name') }}:</div>
          <div class="detail-value">{{ material.name }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.description') }}:</div>
          <div class="detail-value">{{ material.description || $t('common.noDescription') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.link') }}:</div>
          <div class="detail-value">
            <a v-if="material.link" :href="material.link" target="_blank" rel="noopener noreferrer">{{ material.link }}</a>
            <span v-else>{{ $t('common.noLink') }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.unitOfMeasure') }}:</div>
          <div class="detail-value">{{ material.unitOfMeasure }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.costPerUnit') }}:</div>
          <div class="detail-value">{{ $formatCost(material.costPerUnit) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.currentStock') }}:</div>
          <div class="detail-value" :class="{ 'low-stock': isLowStock(material) }">
            {{ $formatQuantity(material.currentStock) }} {{ material.unitOfMeasure }}
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.minStockLevel') }}:</div>
          <div class="detail-value">{{ material.minStockLevel ? $formatQuantity(material.minStockLevel) : $t('common.notSet') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('materials.supplier') }}:</div>
          <div class="detail-value">
            <router-link v-if="supplier && supplier.id" :to="`/suppliers/${supplier.id}/view`" class="supplier-link">
              {{ supplierName }}
            </router-link>
            <span v-else>{{ supplierName }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.createdAt') }}:</div>
          <div class="detail-value">{{ formatDate(material.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.updatedAt') }}:</div>
          <div class="detail-value">{{ formatDate(material.updatedAt) }}</div>
        </div>
      </div>
      
      <h2 class="section-title">{{ $t('materials.purchaseHistory') }}</h2>
      <div v-if="purchaseTransactions.length === 0" class="empty-transactions">
        {{ $t('materials.noPurchaseHistory') }}
      </div>
      <div v-else class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('transactions.date') }}</th>
              <th>{{ $t('transactions.supplier') }}</th>
              <th>{{ $t('transactions.quantity') }}</th>
              <th>{{ $t('transactions.unitPrice') }}</th>
              <th>{{ $t('transactions.total') }}</th>
              <th>{{ $t('transactions.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in paginatedPurchases" :key="transaction.id" :class="getStatusClass(transaction.status)">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>{{ transaction.supplierName || 'N/A' }}</td>
              <td>{{ $formatQuantity(transaction.quantity) }} {{ material.unitOfMeasure }}</td>
              <td>{{ $formatCost(transaction.unitPrice) }}</td>
              <td>{{ $formatCost(transaction.totalPrice) }}</td>
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
        <div class="pagination" v-if="purchaseTransactions.length > itemsPerPage">
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
        
        <div class="pagination-info" v-if="purchaseTransactions.length > 0">
          {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: totalItems || purchaseTransactions.length }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import materialService from '../services/materialService';
import supplierService from '../services/supplierService';
import ActionMenu from '../components/ActionMenu.vue';

export default {
  components: {
    ActionMenu
  },
  name: 'MaterialView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      material: {},
      supplier: null,
      purchaseTransactions: [],
      loading: true,
      error: null,
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0,
      totalPagesCount: 0
    };
  },
  computed: {
    supplierName() {
      return this.supplier ? this.supplier.name : this.$t('common.noSupplier');
    },
    paginatedPurchases() {
      // Non facciamo più lo slice qui perché i dati sono già paginati dal server
      return this.purchaseTransactions;
    },
    totalPages() {
      // Utilizziamo la variabile totalPagesCount che viene impostata dalla risposta del server
      return this.totalPagesCount || Math.ceil(this.purchaseTransactions.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.totalItems ? this.totalItems : end;
    }
  },
  created() {
    this.fetchMaterial();
    this.fetchPurchaseTransactions();
  },
  methods: {
    async fetchMaterial() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await materialService.getMaterialById(this.id);
        this.material = response.data;
        
        // Se c'è un fornitore, carica i suoi dettagli
        if (this.material.supplierId) {
          await this.fetchSupplier(this.material.supplierId);
        }
      } catch (error) {
        console.error('Error fetching material:', error);
        this.error = this.$t('errors.fetchMaterial');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSupplier(supplierId) {
      try {
        const response = await supplierService.getSupplierById(supplierId);
        this.supplier = response.data;
      } catch (error) {
        console.error('Error fetching supplier:', error);
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
    
    isLowStock(material) {
      if (!material.minStockLevel) return false;
      
      const currentStock = parseFloat(material.currentStock);
      const minStockLevel = parseFloat(material.minStockLevel);
      
      if (isNaN(currentStock) || isNaN(minStockLevel)) return false;
      
      return currentStock < minStockLevel;
    },
    
    editMaterial() {
      this.$router.push(`/materials/${this.id}`);
    },
    
    goBack() {
      this.$router.push('/materials');
    },
    
    async fetchPurchaseTransactions(page = 1) {
      try {
        // Ottieni le transazioni di acquisto per questo materiale con paginazione
        const response = await fetch(`/api/transactions?type=purchase&materialId=${this.id}&page=${page}&limit=${this.itemsPerPage}`);
        const data = await response.json();
        
        if (!data || !data.transactions) {
          console.error('Formato di risposta non valido:', data);
          return;
        }
        
        // Array per memorizzare le promesse di recupero dei dettagli delle transazioni
        const transactionPromises = data.transactions.map(async transaction => {
          // Recupera i dettagli completi della transazione, inclusi gli elementi
          const detailResponse = await fetch(`/api/transactions/${transaction.id}`);
          const detailData = await detailResponse.json();
          
          // Cerca gli elementi della transazione relativi a questo materiale
          const items = detailData.items ? detailData.items.filter(item => item.materialId === this.id) : [];
          const item = items.length > 0 ? items[0] : {};
          
          return {
            id: transaction.id,
            transactionId: transaction.id,
            date: transaction.date,
            supplierName: transaction.supplierName,
            supplierId: transaction.supplierId,
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
            status: transaction.status
          };
        });
        
        // Attendi che tutte le promesse siano risolte
        this.purchaseTransactions = await Promise.all(transactionPromises);
        
        // Aggiorna le informazioni di paginazione
        this.totalItems = data.pagination.totalItems;
        this.totalPagesCount = data.pagination.totalPages;
        this.currentPage = data.pagination.page;
      } catch (error) {
        console.error('Error fetching purchase transactions:', error);
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
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.fetchPurchaseTransactions(page);
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
        }
      ];
    },

    handleTransactionAction(actionKey, transaction) {
      switch (actionKey) {
        case 'view':
          this.$router.push(`/transactions/${transaction.transactionId}/view`);
          break;
        case 'edit':
          this.$router.push(`/transactions/${transaction.transactionId}/edit`);
          break;
      }
    }
  }
};
</script>

<style scoped>
.material-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
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

.sku-badge {
  background: linear-gradient(135deg, var(--secondary) 0%, var(--fulvous-dark) 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(226, 132, 19, 0.3);
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
  background-color: var(--secondary);
  color: var(--surface);
}

.btn-secondary {
  background-color: var(--oxford-blue-muted);
  color: var(--surface);
}

.detail-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
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

.low-stock {
  color: #dc3545;
  font-weight: bold;
}

.section-title {
  margin-top: 40px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
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
  margin-top: 20px;
  margin-bottom: 30px;
}

.transactions-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.transactions-table th,
.transactions-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transactions-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #555;
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

.pagination-info {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-top: 10px;
}
</style>