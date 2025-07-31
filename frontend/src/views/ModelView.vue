<template>
  <div class="model-view">
    <h1>{{ $t('models.viewTitle') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="model-details">
      <div class="detail-header">
        <div class="sku-badge">{{ $t('models.sku') }}: {{ model.sku || 'N/A' }}</div>
        <div class="actions">
          <button @click="editModel" class="btn btn-primary">{{ $t('common.edit') }}</button>
          <button @click="goBack" class="btn btn-secondary">{{ $t('common.back') }}</button>
        </div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">{{ $t('models.name') }}:</div>
          <div class="detail-value">{{ model.name }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('models.description') }}:</div>
          <div class="detail-value">{{ model.description || $t('common.noDescription') }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('models.productionCost') }}:</div>
          <div class="detail-value">{{ $formatCost(model.productionCost) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('models.sellingPrice') }}:</div>
          <div class="detail-value">{{ $formatCost(model.sellingPrice) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('models.laborTime') }}:</div>
          <div class="detail-value">{{ formatTime(model.laborTimeMinutes) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('models.margin') }}:</div>
          <div class="detail-value">{{ calculateMargin(model) }}%</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.createdAt') }}:</div>
          <div class="detail-value">{{ formatDate(model.createdAt) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">{{ $t('common.updatedAt') }}:</div>
          <div class="detail-value">{{ formatDate(model.updatedAt) }}</div>
        </div>
      </div>
      
      <h2>{{ $t('models.componentsUsed') }}</h2>
      <div v-if="components.length === 0" class="empty-components">
        {{ $t('models.noComponentsAssociated') }}
      </div>
      <div v-else class="components-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('models.component') }}</th>
              <th>{{ $t('common.quantity') }}</th>
              <th>{{ $t('common.unitCost') }}</th>
              <th>{{ $t('common.totalCost') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in components" :key="component.id">
              <td>
                <router-link :to="`/components/${component.componentId}/view`">
                  {{ component.componentName }}
                </router-link>
              </td>
              <td>{{ $formatQuantity(component.quantity) }}</td>
              <td>{{ $formatCost(component.componentCost) }}</td>
              <td>{{ $formatCost(component.totalCost) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">{{ $t('models.totalComponentsCost') }}:</td>
              <td class="total-value">{{ $formatCost(totalComponentsCost) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <h2>{{ $t('models.inventoryItems') }}</h2>
      <div v-if="inventoryItems.length === 0" class="empty-inventory">
        {{ $t('models.noInventoryItems') }}
      </div>
      <div v-else class="inventory-table">
        <table>
          <thead>
            <tr>
              <th>{{ $t('common.id') }}</th>
              <th>{{ $t('common.quantity') }}</th>
              <th>{{ $t('inventory.productionDate') }}</th>
              <th>{{ $t('common.notes') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventoryItems" :key="item.id">
              <td>
                <router-link :to="`/inventory/${item.id}/view`">
                  {{ item.id.substring(0, 8) }}...
                </router-link>
              </td>
              <td>{{ $formatQuantity(item.quantity) }}</td>
              <td>{{ formatDate(item.productionDate) }}</td>
              <td>{{ item.notes || $t('common.noNotes') }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="1" class="total-label">{{ $t('models.totalItems') }}:</td>
              <td colspan="3">{{ totalInventoryItems }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'ModelView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      model: {},
      components: [],
      inventoryItems: [],
      loading: true,
      error: null
    };
  },
  computed: {
    totalComponentsCost() {
      return this.components.reduce((total, component) => total + (component.totalCost || 0), 0);
    },
    totalInventoryItems() {
      return this.inventoryItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }
  },
  created() {
    this.fetchModel();
  },
  methods: {
    async fetchModel() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch model details
        const modelResponse = await api.get(`/api/models/${this.id}`);
        this.model = modelResponse.data.model;
        
        // Get components from the model response
        this.components = modelResponse.data.components || [];
        
        // Calculate component costs
        this.components = this.components.map(component => {
          // Fetch component cost (this would ideally be done in the backend)
          return {
            ...component,
            componentId: component.componentId,
            componentName: component.componentName,
            quantity: component.quantity || 0,
            componentCost: 0, // We'll need to calculate this separately
            totalCost: 0 // We'll calculate this after getting component costs
          };
        });
        
        // Fetch component costs
        await this.fetchComponentCosts();
        
        // Fetch inventory items for this model
        await this.fetchInventoryItems();
      } catch (error) {
        console.error('Error fetching model:', error);
        this.error = this.$t('errors.fetchModel');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchComponentCosts() {
      // For each component, fetch its cost
      for (const component of this.components) {
        try {
          const response = await api.get(`/api/components/${component.componentId}/cost`);
          component.componentCost = response.data.totalCost || 0;
          component.totalCost = component.componentCost * component.quantity;
        } catch (error) {
          console.error(this.$t('errors.fetchComponentCost', { componentId: component.componentId }), error);
          component.componentCost = 0;
          component.totalCost = 0;
        }
      }
    },
    
    async fetchInventoryItems() {
      try {
        const response = await api.get(`/api/inventory?modelId=${this.id}`);
        this.inventoryItems = response.data || [];
      } catch (error) {
        console.error(this.$t('errors.fetchInventoryItems'), error);
      }
    },
    
    formatTime(minutes) {
      if (minutes === undefined || minutes === null) return '0m';
      
      // Assicurati che minutes sia un numero
      const mins = typeof minutes === 'number' ? minutes : Number(minutes);
      if (isNaN(mins)) return '0m';
      
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      
      if (hours > 0) {
        return `${hours}h ${remainingMins}m`;
      }
      return `${remainingMins}m`;
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
    
    calculateMargin(model) {
      // Supporta sia camelCase che snake_case
      const sellingPrice = model.sellingPrice !== undefined ? model.sellingPrice : model.selling_price;
      const productionCost = model.productionCost !== undefined ? model.productionCost : model.production_cost;
      
      if (!sellingPrice || !productionCost || sellingPrice === 0) {
        return '0.0';
      }
      const margin = ((sellingPrice - productionCost) / sellingPrice) * 100;
      return margin.toFixed(1);
    },
    
    editModel() {
      this.$router.push(`/models/${this.id}`);
    },
    
    goBack() {
      this.$router.push('/models');
    }
  }
};
</script>

<style scoped>
.model-view {
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

.empty-components, .empty-inventory {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
  margin-bottom: 20px;
}

.components-table, .inventory-table {
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

tfoot {
  font-weight: bold;
}

.total-label {
  text-align: right;
}

.total-value {
  font-weight: bold;
  color: var(--secondary);
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>