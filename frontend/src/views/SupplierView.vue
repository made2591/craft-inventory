<template>
  <div class="supplier-view">
    <h1>Dettaglio Fornitore</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="supplier-details">
      <div class="detail-header">
        <h2>{{ supplier.name }}</h2>
        <div class="actions">
          <button @click="editSupplier" class="btn btn-primary">Modifica</button>
          <button @click="goBack" class="btn btn-secondary">Indietro</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">Persona di Contatto:</div>
          <div class="detail-value">{{ supplier.contactPerson || 'Non specificato' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Email:</div>
          <div class="detail-value">{{ supplier.email || 'Non specificato' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Telefono:</div>
          <div class="detail-value">{{ supplier.phone || 'Non specificato' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Indirizzo:</div>
          <div class="detail-value">{{ supplier.address || 'Non specificato' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Link:</div>
          <div class="detail-value">
            <a v-if="supplier.link" :href="supplier.link" target="_blank" rel="noopener noreferrer">{{ supplier.link }}</a>
            <span v-else>Non specificato</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Note:</div>
          <div class="detail-value">{{ supplier.notes || 'Nessuna nota' }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Data Creazione:</div>
          <div class="detail-value">{{ formatDate(supplier.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Ultimo Aggiornamento:</div>
          <div class="detail-value">{{ formatDate(supplier.updatedAt) }}</div>
        </div>
      </div>
      
      <h2>Materiali forniti</h2>
      <div v-if="materials.length === 0" class="empty-materials">
        Nessun materiale fornito da questo fornitore.
      </div>
      <div v-else class="materials-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nome</th>
              <th>Unità di Misura</th>
              <th>Costo per Unità</th>
              <th>Quantità Disponibile</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in materials" :key="material.id">
              <td>
                <router-link :to="`/materials/${material.id}/view`" class="sku-link">
                  {{ material.sku }}
                </router-link>
              </td>
              <td>{{ material.name }}</td>
              <td>{{ material.unitOfMeasure }}</td>
              <td>€ {{ formatCost(material.costPerUnit) }}</td>
              <td>{{ material.currentStock }} {{ material.unitOfMeasure }}</td>
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
  name: 'SupplierView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      supplier: {},
      materials: [],
      loading: true,
      error: null
    };
  },
  created() {
    this.fetchSupplier();
  },
  methods: {
    async fetchSupplier() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch supplier details
        const response = await api.get(`/api/suppliers/${this.id}`);
        this.supplier = response.data;
        
        // Fetch materials from this supplier
        await this.fetchMaterials();
      } catch (error) {
        console.error('Error fetching supplier:', error);
        this.error = 'Si è verificato un errore durante il recupero del fornitore. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchMaterials() {
      try {
        const response = await api.get(`/api/materials?supplierId=${this.id}`);
        this.materials = response.data || [];
      } catch (error) {
        console.error('Error fetching materials:', error);
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
    
    editSupplier() {
      this.$router.push(`/suppliers/${this.id}`);
    },
    
    goBack() {
      this.$router.push('/suppliers');
    }
  }
};
</script>

<style scoped>
.supplier-view {
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

.detail-value a {
  color: #3498db;
  text-decoration: none;
}

.detail-value a:hover {
  text-decoration: underline;
}

.empty-materials {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
  margin-bottom: 20px;
}

.materials-table {
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

.sku-link {
  color: #3498db;
  text-decoration: none;
}

.sku-link:hover {
  text-decoration: underline;
}
</style>