<template>
  <div class="inventory-view">
    <h1>Dettaglio Articolo in Magazzino</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="inventory-details">
      <div class="detail-header">
        <h2>{{ item.modelName }}</h2>
        <div class="actions">
          <button @click="editItem" class="btn btn-primary">Modifica</button>
          <button @click="goBack" class="btn btn-secondary">Indietro</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">Modello:</div>
          <div class="detail-value">{{ item.modelName }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">SKU Modello:</div>
          <div class="detail-value">
            <router-link v-if="item.modelSku" :to="`/models/${item.modelId}/view`" class="sku-link">
              {{ item.modelSku }}
            </router-link>
            <span v-else>N/A</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Quantità:</div>
          <div class="detail-value">{{ item.quantity }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Data di Produzione:</div>
          <div class="detail-value">{{ formatDate(item.productionDate) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Note:</div>
          <div class="detail-value">{{ item.notes || 'Nessuna nota' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Data Creazione:</div>
          <div class="detail-value">{{ formatDate(item.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Ultimo Aggiornamento:</div>
          <div class="detail-value">{{ formatDate(item.updatedAt) }}</div>
        </div>
      </div>
      
      <h2>Componenti del Modello</h2>
      <div v-if="components.length === 0" class="empty-components">
        Nessun componente associato a questo modello.
      </div>
      <div v-else class="components-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nome</th>
              <th>Quantità</th>
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
              <td>{{ component.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
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
      error: null
    };
  },
  created() {
    this.fetchInventoryItem();
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
        }
      } catch (error) {
        console.error('Error fetching inventory item:', error);
        this.error = 'Si è verificato un errore durante il recupero dell\'articolo. Riprova più tardi.';
      } finally {
        this.loading = false;
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
  color: #3498db;
  text-decoration: none;
}

.sku-link:hover {
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
</style>