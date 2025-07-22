<template>
  <div class="material-view">
    <h1>Dettaglio Materiale</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="material-details">
      <div class="detail-header">
        <div class="sku-badge">SKU: {{ material.sku || 'N/A' }}</div>
        <div class="actions">
          <button @click="editMaterial" class="btn btn-primary">Modifica</button>
          <button @click="goBack" class="btn btn-secondary">Indietro</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">Nome:</div>
          <div class="detail-value">{{ material.name }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Descrizione:</div>
          <div class="detail-value">{{ material.description || 'Nessuna descrizione' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Link:</div>
          <div class="detail-value">
            <a v-if="material.link" :href="material.link" target="_blank" rel="noopener noreferrer">{{ material.link }}</a>
            <span v-else>Nessun link</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Unità di Misura:</div>
          <div class="detail-value">{{ material.unitOfMeasure }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Costo per Unità:</div>
          <div class="detail-value">€ {{ formatCost(material.costPerUnit) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Quantità Disponibile:</div>
          <div class="detail-value" :class="{ 'low-stock': isLowStock(material) }">
            {{ material.currentStock }} {{ material.unitOfMeasure }}
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Livello Minimo di Scorta:</div>
          <div class="detail-value">{{ material.minStockLevel || 'Non impostato' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Fornitore:</div>
          <div class="detail-value">
            <router-link v-if="supplier && supplier.id" :to="`/suppliers/${supplier.id}/view`" class="supplier-link">
              {{ supplierName }}
            </router-link>
            <span v-else>{{ supplierName }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Data Creazione:</div>
          <div class="detail-value">{{ formatDate(material.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Ultimo Aggiornamento:</div>
          <div class="detail-value">{{ formatDate(material.updatedAt) }}</div>
        </div>
      </div>
      
      <h2 class="section-title">Storico Acquisti</h2>
      <div v-if="purchaseTransactions.length === 0" class="empty-transactions">
        Nessun acquisto registrato per questo materiale.
      </div>
      <div v-else class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Fornitore</th>
              <th>Quantità</th>
              <th>Prezzo Unitario</th>
              <th>Totale</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in paginatedPurchases" :key="transaction.id" :class="getStatusClass(transaction.status)">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>{{ transaction.supplierName || 'N/A' }}</td>
              <td>{{ transaction.quantity }} {{ material.unitOfMeasure }}</td>
              <td>€ {{ formatCost(transaction.unitPrice) }}</td>
              <td>€ {{ formatCost(transaction.totalPrice) }}</td>
              <td>{{ formatStatus(transaction.status) }}</td>
              <td>
                <router-link :to="`/transactions/${transaction.transactionId}`" class="btn btn-sm">Dettagli</router-link>
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
            Precedente
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
            Successivo
          </button>
        </div>
        
        <div class="pagination-info" v-if="purchaseTransactions.length > 0">
          Visualizzazione {{ startIndex + 1 }}-{{ endIndex }} di {{ totalItems || purchaseTransactions.length }} elementi
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import materialService from '../services/materialService';
import supplierService from '../services/supplierService';

export default {
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
      return this.supplier ? this.supplier.name : 'Nessun fornitore';
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
        this.error = 'Si è verificato un errore durante il recupero del materiale. Riprova più tardi.';
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
    
    formatCost(cost) {
      if (cost === undefined || cost === null) return '0.00';
      const numCost = typeof cost === 'number' ? cost : parseFloat(cost);
      return isNaN(numCost) ? '0.00' : numCost.toFixed(2);
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
        
        // Trasforma i dati per adattarli alla visualizzazione
        this.purchaseTransactions = data.transactions.map(transaction => {
          // Cerca gli elementi della transazione relativi a questo materiale
          const items = transaction.items ? transaction.items.filter(item => item.materialId === this.id) : [];
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
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.fetchPurchaseTransactions(page);
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
  background-color: #17a2b8;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
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
  background-color: #42b983;
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
  color: #3498db;
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
  background-color: #42b983;
  color: white;
}

.pagination-info {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-top: 10px;
}
</style>