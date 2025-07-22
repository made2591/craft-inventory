<template>
  <div class="dashboard">
    <h1>{{ $t('dashboard.title') }}</h1>
    
    <div class="stats-cards">
      <router-link to="/materials" class="stat-card">
        <div class="stat-icon material-icon">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-content">
          <h3>{{ $t('navigation.materials') }}</h3>
          <p class="stat-value">{{ stats.materials || 0 }}</p>
        </div>
      </router-link>
      
      <router-link to="/models" class="stat-card">
        <div class="stat-icon model-icon">
          <i class="fas fa-cubes"></i>
        </div>
        <div class="stat-content">
          <h3>{{ $t('products.models') }}</h3>
          <p class="stat-value">{{ stats.models || 0 }}</p>
        </div>
      </router-link>
      
      <router-link to="/inventory" class="stat-card">
        <div class="stat-icon inventory-icon">
          <i class="fas fa-warehouse"></i>
        </div>
        <div class="stat-content">
          <h3>{{ $t('navigation.inventory') }}</h3>
          <p class="stat-value">{{ stats.inventoryItems || 0 }}</p>
        </div>
      </router-link>
      
      <router-link to="/suppliers" class="stat-card">
        <div class="stat-icon supplier-icon">
          <i class="fas fa-truck"></i>
        </div>
        <div class="stat-content">
          <h3>{{ $t('navigation.suppliers') }}</h3>
          <p class="stat-value">{{ stats.suppliers || 0 }}</p>
        </div>
      </router-link>
      
      <router-link to="/customers" class="stat-card">
        <div class="stat-icon customer-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ $t('navigation.customers') }}</h3>
          <p class="stat-value">{{ stats.customers || 0 }}</p>
        </div>
      </router-link>
    </div>
    
    <div class="charts-container">
      <div class="chart-card">
        <h2>{{ $t('dashboard.materialValueByCategory') }}</h2>
        <div class="chart-wrapper">
          <canvas ref="materialsChart"></canvas>
        </div>
      </div>
      
      <div class="chart-card">
        <h2>{{ $t('dashboard.inventoryByModel') }}</h2>
        <div class="chart-wrapper">
          <canvas ref="inventoryChart"></canvas>
        </div>
      </div>
    </div>
    
    <div class="quick-actions">
      <h2>{{ $t('dashboard.quickActions') }}</h2>
      <div class="actions-grid">
        <router-link to="/materials/new" class="action-btn">
          <i class="fas fa-plus"></i> {{ $t('dashboard.newMaterial') }}
        </router-link>
        <router-link to="/models/new" class="action-btn">
          <i class="fas fa-plus"></i> {{ $t('dashboard.newModel') }}
        </router-link>
        <router-link to="/inventory/new" class="action-btn">
          <i class="fas fa-plus"></i> {{ $t('dashboard.newInventoryItem') }}
        </router-link>
        <router-link to="/suppliers/new" class="action-btn">
          <i class="fas fa-plus"></i> {{ $t('dashboard.newSupplier') }}
        </router-link>
        <router-link to="/customers/new" class="action-btn">
          <i class="fas fa-plus"></i> {{ $t('dashboard.newCustomer') }}
        </router-link>
      </div>
    </div>
    
    <div class="low-stock-alert" v-if="lowStockMaterials.length > 0">
      <h2>{{ $t('dashboard.lowStockMaterials') }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ $t('materials.name') }}</th>
            <th>{{ $t('materials.currentQuantity') }}</th>
            <th>{{ $t('materials.minLevel') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="material in lowStockMaterials" :key="material.id">
            <td>{{ material.name }}</td>
            <td>{{ material.current_stock }} {{ material.unit_of_measure }}</td>
            <td>{{ material.min_stock_level }} {{ material.unit_of_measure }}</td>
            <td>
              <router-link :to="`/materials/${material.id}`" class="btn btn-sm">
                {{ $t('common.edit') }}
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import Chart from 'chart.js/auto';

export default {
  name: 'HomeView',
  data() {
    return {
      stats: {
        materials: 0,
        models: 0,
        inventoryItems: 0,
        suppliers: 0,
        customers: 0
      },
      materials: [],
      models: [],
      inventoryItems: [],
      lowStockMaterials: [],
      materialsChart: null,
      inventoryChart: null
    };
  },
  async created() {
    await this.fetchStats();
    await this.fetchLowStockMaterials();
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    async fetchStats() {
      try {
        // Fetch materials count
        const materialsResponse = await api.get('/api/materials');
        this.materials = materialsResponse.data;
        this.stats.materials = this.materials.length;
        
        // Fetch models count
        const modelsResponse = await api.get('/api/models');
        this.models = modelsResponse.data;
        this.stats.models = this.models.length;
        
        // Fetch inventory items count
        const inventoryResponse = await api.get('/api/inventory');
        this.inventoryItems = inventoryResponse.data;
        this.stats.inventoryItems = this.inventoryItems.length;
        
        // Fetch suppliers count
        const suppliersResponse = await api.get('/api/suppliers');
        this.stats.suppliers = suppliersResponse.data.length;
        
        // Fetch customers count
        const customersResponse = await api.get('/api/customers');
        this.stats.customers = customersResponse.data.length;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    },
    
    async fetchLowStockMaterials() {
      try {
        // Filter materials with current stock below min stock level
        this.lowStockMaterials = this.materials.filter(material => 
          material.min_stock_level && material.current_stock <= material.min_stock_level
        );
      } catch (error) {
        console.error('Error fetching low stock materials:', error);
      }
    },
    
    initCharts() {
      this.initMaterialsChart();
      this.initInventoryChart();
    },
    
    initMaterialsChart() {
      // Group materials by first letter of name and sum their values
      const materialsByCategory = {};
      
      this.materials.forEach(material => {
        const category = material.name.charAt(0).toUpperCase();
        const value = material.current_stock * material.cost_per_unit;
        
        if (!materialsByCategory[category]) {
          materialsByCategory[category] = 0;
        }
        
        materialsByCategory[category] += value;
      });
      
      const labels = Object.keys(materialsByCategory).sort();
      const data = labels.map(label => materialsByCategory[label]);
      
      // Create chart
      const ctx = this.$refs.materialsChart.getContext('2d');
      this.materialsChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: this.$t('charts.materialValue'),
            data: data,
            backgroundColor: [
              '#42b983', '#2c3e50', '#f87979', '#7f8c8d', '#3498db',
              '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#34495e'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  return `€ ${value.toFixed(2)}`;
                }
              }
            }
          }
        }
      });
    },
    
    initInventoryChart() {
      // Group inventory items by model and count them
      const inventoryByModel = {};
      
      this.inventoryItems.forEach(item => {
        const modelId = item.model_id;
        const model = this.models.find(m => m.id === modelId);
        const modelName = model ? model.name : this.$t('common.unknown');
        
        if (!inventoryByModel[modelName]) {
          inventoryByModel[modelName] = 0;
        }
        
        inventoryByModel[modelName] += item.quantity;
      });
      
      const labels = Object.keys(inventoryByModel);
      const data = labels.map(label => inventoryByModel[label]);
      
      // Create chart
      const ctx = this.$refs.inventoryChart.getContext('2d');
      this.inventoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: this.$t('charts.quantity'),
            data: data,
            backgroundColor: '#42b983'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 20px;
}

.material-icon {
  background-color: #42b983;
}

.model-icon {
  background-color: #3498db;
}

.inventory-icon {
  background-color: #f1c40f;
}

.supplier-icon {
  background-color: #9b59b6;
}

.customer-icon {
  background-color: #e74c3c;
}

.stat-content h3 {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0 0;
  color: #2c3e50;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-wrapper {
  height: 300px;
}

.quick-actions {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  display: block;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.low-stock-alert {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.low-stock-alert h2 {
  color: #e74c3c;
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

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  text-decoration: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 250px;
  }
}
</style>