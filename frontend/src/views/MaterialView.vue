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
      loading: true,
      error: null
    };
  },
  computed: {
    supplierName() {
      return this.supplier ? this.supplier.name : 'Nessun fornitore';
    }
  },
  created() {
    this.fetchMaterial();
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
</style>