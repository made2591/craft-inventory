<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">
        <i class="fas fa-plus-circle mr-2"></i>
        {{ $t('transactions.newTransaction') }}
      </h1>
    </div>
    
    <div v-if="loading" class="card text-center">
      <div class="loading">
        <div class="spinner"></div>
        {{ $t('common.loading') }}
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveTransaction" class="transaction-form-content">
      <!-- General Information Card -->
      <div class="card">
        <div class="card-header">
          <h2 class="flex items-center gap-2">
            <i class="fas fa-info-circle text-primary"></i>
            {{ $t('transactions.generalInfo') }}
          </h2>
        </div>
        <div class="card-body">
          <div class="grid grid-auto gap-4">
            <div class="form-group">
              <label for="transaction_type" class="form-label required">
                <i class="fas fa-exchange-alt mr-2"></i>
                {{ $t('transactions.transactionType') }}
              </label>
              <div class="select-wrapper">
                <select 
                  id="transaction_type" 
                  v-model="transaction.transaction_type" 
                  required
                  @change="resetRelatedFields"
                  class="form-select"
                >
                  <option value="">-- {{ $t('transactions.selectType') }} --</option>
                  <option value="purchase">
                    <i class="fas fa-arrow-down"></i> {{ $t('transactions.purchase') }}
                  </option>
                  <option value="sale">
                    <i class="fas fa-arrow-up"></i> {{ $t('transactions.sale') }}
                  </option>
                </select>
                <i class="fas fa-chevron-down select-icon"></i>
              </div>
            </div>
            
            <div class="form-group">
              <label for="date" class="form-label required">
                <i class="fas fa-calendar mr-2"></i>
                {{ $t('transactions.date') }}
              </label>
              <input 
                type="date" 
                id="date" 
                v-model="formattedDate" 
                required
                class="form-input"
              >
            </div>
          </div>
          
          <div class="grid grid-auto gap-4">
            <div class="form-group" v-if="transaction.transaction_type === 'purchase'">
              <label for="supplier_id" class="form-label required">
                <i class="fas fa-truck mr-2"></i>
                {{ $t('transactions.supplier') }}
              </label>
              <div class="select-wrapper">
                <select 
                  id="supplier_id" 
                  v-model="transaction.supplier_id" 
                  required
                  class="form-select"
                >
                  <option value="">-- {{ $t('transactions.selectSupplier') }} --</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </option>
                </select>
                <i class="fas fa-chevron-down select-icon"></i>
              </div>
            </div>
            
            <div class="form-group" v-if="transaction.transaction_type === 'sale'">
              <label for="customer_id" class="form-label required">
                <i class="fas fa-user mr-2"></i>
                {{ $t('transactions.customer') }}
              </label>
              <div class="select-wrapper">
                <select 
                  id="customer_id" 
                  v-model="transaction.customer_id" 
                  required
                  class="form-select"
                >
                  <option value="">-- {{ $t('transactions.selectCustomer') }} --</option>
                  <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                  </option>
                </select>
                <i class="fas fa-chevron-down select-icon"></i>
              </div>
            </div>
            
            <div class="form-group">
              <label for="status" class="form-label required">
                <i class="fas fa-tasks mr-2"></i>
                {{ $t('transactions.status') }}
              </label>
              <div class="select-wrapper">
                <select 
                  id="status" 
                  v-model="transaction.status" 
                  required
                  class="form-select"
                >
                  <option value="pending">{{ $t('transactions.pending') }}</option>
                  <option value="completed">{{ $t('transactions.completed') }}</option>
                </select>
                <i class="fas fa-chevron-down select-icon"></i>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="notes" class="form-label">
              <i class="fas fa-sticky-note mr-2"></i>
              {{ $t('transactions.notes') }}
            </label>
            <textarea 
              id="notes" 
              v-model="transaction.notes" 
              rows="3"
              :placeholder="$t('transactions.additionalNotes')"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Transaction Items Card -->
      <div class="card">
        <div class="card-header">
          <h2 class="flex items-center gap-2">
            <i class="fas fa-list text-primary"></i>
            {{ $t('transactions.transactionItems') }}
          </h2>
          <p class="text-sm text-muted mt-2">
            <i class="fas fa-info-circle mr-2"></i>
            {{ $t('transactions.addItemsDescription') }}
          </p>
        </div>
        <div class="card-body">
          <div class="items-container">
            <div 
              v-for="(item, index) in transaction.items" 
              :key="index" 
              class="item-card"
            >
              <div class="item-header">
                <span class="item-number">{{ $t('transactions.item') }} {{ index + 1 }}</span>
                <button 
                  type="button" 
                  class="btn btn-danger btn-sm" 
                  @click="removeItem(index)"
                  :disabled="transaction.items.length === 1"
                  title="Remove item"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              
              <div class="grid grid-auto gap-4">
                <div class="form-group">
                  <label :for="`item_type_${index}`" class="form-label required">
                    <i class="fas fa-tag mr-2"></i>
                    {{ $t('transactions.itemType') }}
                  </label>
                  <div class="select-wrapper">
                    <select 
                      :id="`item_type_${index}`" 
                      v-model="item.type" 
                      required
                      @change="resetItemFields(item)"
                      class="form-select"
                    >
                      <option value="">-- {{ $t('transactions.selectType') }} --</option>
                      <option value="material">
                        <i class="fas fa-cube"></i> {{ $t('transactions.material') }}
                      </option>
                      <option value="model" v-if="transaction.transaction_type === 'sale'">
                        <i class="fas fa-box"></i> {{ $t('transactions.model') }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
                
                <div class="form-group" v-if="item.type === 'material'">
                  <label :for="`material_id_${index}`" class="form-label required">
                    <i class="fas fa-cube mr-2"></i>
                    {{ $t('transactions.material') }}
                  </label>
                  <div class="select-wrapper">
                    <select 
                      :id="`material_id_${index}`" 
                      v-model="item.material_id" 
                      required
                      @change="updateUnitPrice(item, 'material')"
                      class="form-select"
                    >
                      <option value="">-- {{ $t('transactions.selectMaterial') }} --</option>
                      <option v-for="material in materials" :key="material.id" :value="material.id">
                        {{ material.name }} ({{ material.unit_of_measure }})
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
                
                <div class="form-group" v-if="item.type === 'model'">
                  <label :for="`model_id_${index}`" class="form-label required">
                    <i class="fas fa-box mr-2"></i>
                    {{ $t('transactions.model') }}
                  </label>
                  <div class="select-wrapper">
                    <select 
                      :id="`model_id_${index}`" 
                      v-model="item.product_model_id" 
                      required
                      @change="updateUnitPrice(item, 'model')"
                      class="form-select"
                    >
                      <option value="">-- {{ $t('transactions.selectModel') }} --</option>
                      <option v-for="model in models" :key="model.id" :value="model.id">
                        {{ model.name }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-auto gap-4">
                <div class="form-group">
                  <label :for="`quantity_${index}`" class="form-label required">
                    <i class="fas fa-sort-numeric-up mr-2"></i>
                    {{ $t('transactions.quantity') }}
                  </label>
                  <input 
                    type="number" 
                    :id="`quantity_${index}`" 
                    v-model.number="item.quantity" 
                    required
                    min="0.01"
                    step="0.01"
                    @input="calculateItemTotal(item)"
                    class="form-input"
                  >
                </div>
                
                <div class="form-group">
                  <label :for="`unit_price_${index}`" class="form-label required">
                    <i class="fas fa-euro-sign mr-2"></i>
                    {{ $t('transactions.unitPrice') }}
                  </label>
                  <input 
                    type="number" 
                    :id="`unit_price_${index}`" 
                    v-model.number="item.unit_price" 
                    required
                    min="0"
                    step="0.01"
                    @input="calculateItemTotal(item)"
                    class="form-input"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calculator mr-2"></i>
                    {{ $t('transactions.total') }}
                  </label>
                  <div class="total-display">
                    € {{ item.total !== undefined ? item.total.toFixed(2) : '0.00' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="add-item-section">
            <button 
              type="button" 
              class="btn btn-secondary btn-block"
              @click="addItem"
            >
              <i class="fas fa-plus mr-2"></i>
              {{ $t('transactions.addItem') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Transaction Summary Card -->
      <div class="card summary-card">
        <div class="card-header">
          <h2 class="flex items-center gap-2">
            <i class="fas fa-chart-line text-primary"></i>
            {{ $t('transactions.summary') }}
          </h2>
        </div>
        <div class="card-body">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon">
                <i class="fas fa-list-ol"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">{{ $t('transactions.totalItems') }}</span>
                <span class="summary-value">{{ transaction.items.length }}</span>
              </div>
            </div>
            
            <div class="summary-item total-summary">
              <div class="summary-icon">
                <i class="fas fa-euro-sign"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">{{ $t('transactions.totalAmount') }}</span>
                <span class="summary-value total-amount">
                  € {{ calculateTotal() !== undefined ? calculateTotal().toFixed(2) : '0.00' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">
          <i class="fas fa-times mr-2"></i>
          {{ $t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary">
          <i class="fas fa-save mr-2"></i>
          {{ $t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import transactionService from '../services/transactionService';
import api from '../services/api';

export default {
  name: 'TransactionForm',
  data() {
    return {
      transaction: {
        transaction_type: '',
        date: new Date().toISOString(),
        supplier_id: '',
        customer_id: '',
        status: 'pending',
        notes: '',
        items: [this.createEmptyItem()]
      },
      suppliers: [],
      customers: [],
      materials: [],
      models: [],
      loading: false,
      error: null
    };
  },
  computed: {
    formattedDate: {
      get() {
        if (!this.transaction.date) return '';
        return this.transaction.date.split('T')[0];
      },
      set(value) {
        this.transaction.date = value ? `${value}T00:00:00Z` : null;
      }
    }
  },
  created() {
    this.fetchSuppliers();
    this.fetchCustomers();
    this.fetchMaterials();
    this.fetchModels();
  },
  methods: {
    createEmptyItem() {
      return {
        type: '',
        material_id: '',
        product_model_id: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      };
    },
    
    async fetchSuppliers() {
      try {
        const response = await api.get('/api/suppliers');
        this.suppliers = response.data;
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        this.error = this.$t('errors.fetchSuppliers');
      }
    },
    
    async fetchCustomers() {
      try {
        const response = await api.get('/api/customers');
        this.customers = response.data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        this.error = this.$t('errors.fetchCustomers');
      }
    },
    
    async fetchMaterials() {
      try {
        const response = await api.get('/api/materials');
        this.materials = response.data;
      } catch (error) {
        console.error('Error fetching materials:', error);
        this.error = this.$t('errors.fetchMaterials');
      }
    },
    
    async fetchModels() {
      try {
        const response = await api.get('/api/models');
        this.models = response.data;
      } catch (error) {
        console.error('Error fetching models:', error);
        this.error = this.$t('errors.fetchModels');
      }
    },
    
    resetRelatedFields() {
      if (this.transaction.transaction_type === 'purchase') {
        this.transaction.customer_id = '';
        // Rimuovi gli elementi di tipo 'model' se presenti
        this.transaction.items = this.transaction.items.filter(item => item.type !== 'model');
        if (this.transaction.items.length === 0) {
          this.transaction.items.push(this.createEmptyItem());
        }
      } else if (this.transaction.transaction_type === 'sale') {
        this.transaction.supplier_id = '';
      }
    },
    
    resetItemFields(item) {
      item.material_id = '';
      item.product_model_id = '';
      item.unit_price = 0;
      item.total = 0;
    },
    
    async updateUnitPrice(item, type) {
      if (type === 'material') {
        try {
          // Ottieni i dettagli aggiornati del materiale direttamente dall'API
          const response = await api.get(`/api/materials/${item.material_id}`);
          const material = response.data;
          
          if (material) {
            // Per gli acquisti, usa il costo del materiale
            // Per le vendite, aggiungi un margine (es. 20%)
            item.unit_price = this.transaction.transaction_type === 'purchase' 
              ? material.costPerUnit 
              : material.costPerUnit * 1.2;
            
            // Aggiorna anche l'unità di misura per riferimento
            item.unit_of_measure = material.unitOfMeasure;
          }
        } catch (error) {
          console.error('Error fetching material details:', error);
          // Fallback al metodo precedente
          const material = this.materials.find(m => m.id === item.material_id);
          if (material) {
            item.unit_price = this.transaction.transaction_type === 'purchase' 
              ? material.cost_per_unit 
              : material.cost_per_unit * 1.2;
          }
        }
      } else if (type === 'model') {
        try {
          // Ottieni i dettagli aggiornati del modello direttamente dall'API
          const response = await api.get(`/api/models/${item.product_model_id}`);
          const model = response.data.model;
          
          if (model) {
            item.unit_price = model.sellingPrice;
          }
        } catch (error) {
          console.error('Error fetching model details:', error);
          // Fallback al metodo precedente
          const model = this.models.find(m => m.id === item.product_model_id);
          if (model) {
            item.unit_price = model.selling_price;
          }
        }
      }
      
      this.calculateItemTotal(item);
    },
    
    calculateItemTotal(item) {
      item.total = item.quantity * item.unit_price;
    },
    
    calculateTotal() {
      return this.transaction.items.reduce((sum, item) => sum + item.total, 0);
    },
    
    addItem() {
      this.transaction.items.push(this.createEmptyItem());
    },
    
    removeItem(index) {
      if (this.transaction.items.length > 1) {
        this.transaction.items.splice(index, 1);
      }
    },
    
    async saveTransaction() {
      // Validazione
      if (!this.transaction.transaction_type) {
        this.error = this.$t('errors.selectTransactionType');
        return;
      }
      
      if (this.transaction.transaction_type === 'purchase' && !this.transaction.supplier_id) {
        this.error = this.$t('errors.selectSupplier');
        return;
      }
      
      if (this.transaction.transaction_type === 'sale' && !this.transaction.customer_id) {
        this.error = this.$t('errors.selectCustomer');
        return;
      }
      
      // Verifica che tutti gli elementi abbiano un tipo e un riferimento valido
      for (const item of this.transaction.items) {
        if (!item.type) {
          this.error = this.$t('errors.selectItemType');
          return;
        }
        
        if (item.type === 'material' && !item.material_id) {
          this.error = this.$t('errors.selectMaterialForItem');
          return;
        }
        
        if (item.type === 'model' && !item.product_model_id) {
          this.error = this.$t('errors.selectModelForItem');
          return;
        }
        
        if (item.quantity <= 0) {
          this.error = this.$t('errors.quantityGreaterThanZero');
          return;
        }
        
        if (item.unit_price < 0) {
          this.error = this.$t('errors.unitPriceNotNegative');
          return;
        }
      }
      
      // Prepara i dati per l'invio
      const transactionData = {
        transaction_type: this.transaction.transaction_type,
        date: this.transaction.date,
        supplier_id: this.transaction.transaction_type === 'purchase' ? this.transaction.supplier_id : null,
        customer_id: this.transaction.transaction_type === 'sale' ? this.transaction.customer_id : null,
        status: this.transaction.status,
        notes: this.transaction.notes || null,
        items: this.transaction.items.map(item => ({
          material_id: item.type === 'material' ? item.material_id : null,
          product_model_id: item.type === 'model' ? item.product_model_id : null,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };
      
      this.loading = true;
      this.error = null;
      
      try {
        await transactionService.createTransaction(transactionData);
        this.$router.push('/transactions');
      } catch (error) {
        console.error('Error creating transaction:', error);
        if (error.response && error.response.data) {
          this.error = error.response.data;
        } else {
          this.error = this.$t('errors.saveTransaction');
        }
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.push('/transactions');
    }
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f1f3f4;
}

.transaction-form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-header p {
  margin: 0;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  font-size: 12px;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.item-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.item-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(226, 132, 19, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #cbd5e0;
}

.item-number {
  font-weight: 600;
  color: var(--primary);
  font-size: 1.1rem;
}

.total-display {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.add-item-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px dashed #e2e8f0;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid var(--primary);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
}

.summary-item.total-summary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-transparent);
  color: var(--primary);
  font-size: 20px;
}

.total-summary .summary-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.total-amount {
  color: var(--primary);
}

.total-summary .total-amount {
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #f1f3f4;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .transaction-form-content {
    gap: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .item-card {
    padding: 16px;
  }
  
  .grid-auto {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .summary-item {
    padding: 12px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .summary-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .summary-value {
    font-size: 1.1rem;
  }
}

/* Animation for adding/removing items */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-card {
  animation: slideIn 0.3s ease-out;
}

/* Focus states for accessibility */
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-color: var(--primary);
}

.btn:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Print styles */
@media print {
  .form-actions,
  .add-item-section {
    display: none !important;
  }
  
  .item-card {
    border: 1px solid #333 !important;
    box-shadow: none !important;
    background: white !important;
  }
  
  .summary-card {
    border: 2px solid #333 !important;
  }
  
  .total-display,
  .summary-item.total-summary {
    background: white !important;
    color: #333 !important;
    border: 1px solid #333 !important;
  }
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Error state styling */
.form-input.error,
.form-select.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

/* Success state styling */
.form-input.success,
.form-select.success {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-transparent);
}
</style>