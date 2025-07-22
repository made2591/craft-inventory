<template>
  <div class="transaction-form">
    <h1>{{ $t('transactions.newTransaction') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveTransaction">
      <div class="form-section">
        <h2>{{ $t('transactions.generalInfo') }}</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="transaction_type">{{ $t('transactions.transactionType') }}</label>
            <select 
              id="transaction_type" 
              v-model="transaction.transaction_type" 
              required
              @change="resetRelatedFields"
            >
              <option value="">-- {{ $t('transactions.selectType') }} --</option>
              <option value="purchase">{{ $t('transactions.purchase') }}</option>
              <option value="sale">{{ $t('transactions.sale') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="date">{{ $t('transactions.date') }} *</label>
            <input 
              type="date" 
              id="date" 
              v-model="formattedDate" 
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group" v-if="transaction.transaction_type === 'purchase'">
            <label for="supplier_id">{{ $t('transactions.supplier') }} *</label>
            <select 
              id="supplier_id" 
              v-model="transaction.supplier_id" 
              required
            >
              <option value="">-- {{ $t('transactions.selectType') }} --</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group" v-if="transaction.transaction_type === 'sale'">
            <label for="customer_id">{{ $t('transactions.customer') }} *</label>
            <select 
              id="customer_id" 
              v-model="transaction.customer_id" 
              required
            >
              <option value="">-- {{ $t('transactions.selectType') }} --</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="status">{{ $t('transactions.status') }} *</label>
            <select 
              id="status" 
              v-model="transaction.status" 
              required
            >
              <option value="pending">{{ $t('transactions.pending') }}</option>
              <option value="completed">{{ $t('transactions.completed') }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="notes">{{ $t('transactions.notes') }}</label>
          <textarea 
            id="notes" 
            v-model="transaction.notes" 
            rows="3"
            :placeholder="$t('transactions.additionalNotes')"
          ></textarea>
        </div>
      </div>
      
      <div class="form-section">
        <h2>{{ $t('transactions.transactionItems') }}</h2>
        <p class="info">{{ $t('transactions.addItemsDescription') }}</p>
        
        <div 
          v-for="(item, index) in transaction.items" 
          :key="index" 
          class="transaction-item"
        >
          <div class="form-row">
            <div class="form-group item-type">
              <label :for="`item_type_${index}`">{{ $t('transactions.itemType') }}</label>
              <select 
                :id="`item_type_${index}`" 
                v-model="item.type" 
                required
                @change="resetItemFields(item)"
              >
                <option value="">-- {{ $t('transactions.selectType') }} --</option>
                <option value="material">{{ $t('transactions.material') }}</option>
                <option value="model" v-if="transaction.transaction_type === 'sale'">{{ $t('transactions.model') }}</option>
              </select>
            </div>
            
            <div class="form-group item-select" v-if="item.type === 'material'">
              <label :for="`material_id_${index}`">{{ $t('transactions.material') }} *</label>
              <select 
                :id="`material_id_${index}`" 
                v-model="item.material_id" 
                required
                @change="updateUnitPrice(item, 'material')"
              >
                <option value="">-- {{ $t('transactions.selectMaterial') }} --</option>
                <option v-for="material in materials" :key="material.id" :value="material.id">
                  {{ material.name }} ({{ material.unit_of_measure }})
                </option>
              </select>
            </div>
            
            <div class="form-group item-select" v-if="item.type === 'model'">
              <label :for="`model_id_${index}`">{{ $t('transactions.model') }} *</label>
              <select 
                :id="`model_id_${index}`" 
                v-model="item.product_model_id" 
                required
                @change="updateUnitPrice(item, 'model')"
              >
                <option value="">-- {{ $t('transactions.selectModel') }} --</option>
                <option v-for="model in models" :key="model.id" :value="model.id">
                  {{ model.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group item-quantity">
              <label :for="`quantity_${index}`">{{ $t('transactions.quantity') }} *</label>
              <input 
                type="number" 
                :id="`quantity_${index}`" 
                v-model.number="item.quantity" 
                required
                min="0.01"
                step="0.01"
                @input="calculateItemTotal(item)"
              >
            </div>
            
            <div class="form-group item-price">
              <label :for="`unit_price_${index}`">{{ $t('transactions.unitPrice') }} *</label>
              <input 
                type="number" 
                :id="`unit_price_${index}`" 
                v-model.number="item.unit_price" 
                required
                min="0"
                step="0.01"
                @input="calculateItemTotal(item)"
              >
            </div>
            
            <div class="item-total">
              <label>{{ $t('transactions.total') }}</label>
              <p>€ {{ item.total !== undefined ? item.total.toFixed(2) : '0.00' }}</p>
            </div>
            
            <div class="item-actions">
              <button 
                type="button" 
                class="btn btn-danger btn-sm" 
                @click="removeItem(index)"
                :disabled="transaction.items.length === 1"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <button 
          type="button" 
          class="btn btn-secondary" 
          @click="addItem"
        >
          <i class="fas fa-plus"></i> {{ $t('transactions.addItem') }}
        </button>
      </div>
      
      <div class="transaction-summary">
        <h2>{{ $t('transactions.summary') }}</h2>
        <div class="summary-row">
          <span>{{ $t('transactions.totalItems') }}:</span>
          <span>{{ transaction.items.length }}</span>
        </div>
        <div class="summary-row">
          <span>{{ $t('transactions.totalAmount') }}:</span>
          <span class="total-amount">€ {{ calculateTotal() !== undefined ? calculateTotal().toFixed(2) : '0.00' }}</span>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary">{{ $t('common.save') }}</button>
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
.transaction-form {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2 {
  margin-bottom: 20px;
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.info {
  font-style: italic;
  color: #6c757d;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.transaction-item {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.item-type {
  flex: 1;
  min-width: 150px;
}

.item-select {
  flex: 2;
  min-width: 200px;
}

.item-quantity, .item-price {
  flex: 1;
  min-width: 100px;
}

.item-total {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 100px;
}

.item-total label {
  font-weight: bold;
  margin-bottom: 5px;
}

.item-total p {
  font-weight: bold;
  font-size: 16px;
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
}

.transaction-summary {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.summary-row:last-child {
  border-bottom: none;
  font-weight: bold;
  font-size: 18px;
}

.total-amount {
  color: #42b983;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
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
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
</style>