<template>
  <div class="component-view">
    <h1>{{ $t('components.viewTitle') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="component-details">
      <div class="detail-header">
        <div class="sku-badge">{{ $t('components.sku') }}: {{ component.sku || 'N/A' }}</div>
        <div class="actions">
          <button @click="editComponent" class="btn btn-primary">{{ $t('common.edit') }}</button>
          <button @click="goBack" class="btn btn-secondary">{{ $t('common.back') }}</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">{{ $t('components.name') }}:</div>
          <div class="detail-value">{{ component.name }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('components.description') }}:</div>
          <div class="detail-value">{{ component.description || $t('common.noDescription') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('components.quantity') }}:</div>
          <div class="detail-value">{{ component.quantity || 0 }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.totalCost') }}:</div>
          <div class="detail-value">
            <span v-if="loadingCost" class="loading-cost">
              <i class="loading-spinner"></i> {{ $t('common.calculating') }}
            </span>
            <span v-else>€ {{ formatCost(totalCost) }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.createdAt') }}:</div>
          <div class="detail-value">{{ formatDate(component.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.updatedAt') }}:</div>
          <div class="detail-value">{{ formatDate(component.updatedAt) }}</div>
        </div>
      </div>
      
      <h2>{{ $t('components.materialsUsed') }}</h2>
      <div v-if="materials.length === 0" class="empty-materials">
        {{ $t('components.noMaterialsAssociated') }}
      </div>
      <div v-else class="materials-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('materials.title') }}</th>
              <th>{{ $t('common.quantity') }}</th>
              <th>{{ $t('common.unitCost') }}</th>
              <th>{{ $t('common.totalCost') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in materials" :key="material.id">
              <td>
                <router-link :to="`/materials/${material.materialId}/view`">
                  {{ material.materialName }}
                </router-link>
              </td>
              <td>{{ material.quantity }}</td>
              <td>€ {{ formatCost(material.useMaterialCost ? material.materialCostPerUnit : material.customCost) }}</td>
              <td>€ {{ formatCost(material.totalCost) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">{{ $t('common.totalCost') }}:</td>
              <td class="total-value">€ {{ formatCost(totalCost) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import componentService from '../services/componentService';

export default {
  name: 'ComponentView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      component: {},
      materials: [],
      totalCost: 0,
      loading: true,
      loadingCost: false,
      error: null
    };
  },
  created() {
    this.fetchComponent();
  },
  methods: {
    async fetchComponent() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await componentService.getComponent(this.id);
        this.component = response.data.component;
        this.materials = response.data.materials || [];
        
        // Carica il costo del componente
        await this.fetchComponentCost();
      } catch (error) {
        console.error('Error fetching component:', error);
        this.error = this.$t('errors.fetchComponent');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchComponentCost() {
      this.loadingCost = true;
      
      try {
        const response = await componentService.getComponentCost(this.id);
        this.totalCost = response.data.totalCost;
        
        // Aggiorna i materiali con i dati di costo
        if (response.data.materials && response.data.materials.length > 0) {
          this.materials = response.data.materials;
        }
      } catch (error) {
        console.error(this.$t('errors.fetchComponentCost'), error);
      } finally {
        this.loadingCost = false;
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
    
    editComponent() {
      this.$router.push(`/components/${this.id}`);
    },
    
    goBack() {
      this.$router.push('/components');
    }
  }
};
</script>

<style scoped>
.component-view {
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

.empty-materials {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
}

.materials-table {
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

tfoot {
  font-weight: bold;
}

.total-label {
  text-align: right;
}

.total-value {
  font-weight: bold;
  color: #42b983;
}

.loading-cost {
  display: flex;
  align-items: center;
  color: #6c757d;
  font-size: 14px;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>