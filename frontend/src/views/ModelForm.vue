<template>
  <div class="model-form">
    <h1>{{ isNewModel ? 'Nuovo Modello' : 'Modifica Modello' }}</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveModel" class="form">
      <div v-if="!isNewModel" class="form-group">
        <label for="sku">SKU</label>
        <input type="text" id="sku" v-model="model.sku" disabled class="form-control form-control-disabled">
        <small class="form-text text-muted">Il codice SKU viene generato automaticamente alla creazione</small>
      </div>
      
      <div class="form-group">
        <label for="name">Nome *</label>
        <input 
          type="text" 
          id="name" 
          v-model="model.name" 
          required 
          class="form-control"
        >
      </div>
      
      <div class="form-group">
        <label for="description">Descrizione</label>
        <textarea 
          id="description" 
          v-model="model.description" 
          class="form-control"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="selling-price">Prezzo di Vendita *</label>
        <div class="input-group">
          <span class="input-group-text">€</span>
          <input 
            type="number" 
            id="selling-price" 
            v-model.number="model.sellingPrice" 
            required 
            min="0" 
            step="0.01" 
            class="form-control"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="labor-time">Tempo di Lavoro (minuti) *</label>
        <input 
          type="number" 
          id="labor-time" 
          v-model.number="model.laborTimeMinutes" 
          required 
          min="0" 
          class="form-control"
        >
      </div>
      
      <h2>Componenti</h2>
      <div v-if="loadingComponents" class="loading">
        Caricamento componenti in corso...
      </div>
      <div v-else>
        <div class="components-list">
          <div v-for="(component, index) in model.components" :key="index" class="component-item">
            <div class="component-header">
              <h3>Componente {{ index + 1 }}</h3>
              <button type="button" @click="removeComponent(index)" class="btn btn-sm btn-danger">
                Rimuovi
              </button>
            </div>
            
            <div class="form-group">
              <label :for="`component-${index}`">Componente *</label>
              <select 
                :id="`component-${index}`" 
                v-model="component.component_id" 
                required 
                class="form-control"
                @change="updateComponentCost(index)"
              >
                <option value="">Seleziona un componente</option>
                <option 
                  v-for="availableComponent in availableComponents" 
                  :key="availableComponent.id" 
                  :value="availableComponent.id"
                >
                  {{ availableComponent.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label :for="`quantity-${index}`">Quantità *</label>
              <input 
                type="number" 
                :id="`quantity-${index}`" 
                v-model.number="component.quantity" 
                required 
                min="1" 
                step="1" 
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label :for="`use-component-cost-${index}`">Usa costo calcolato</label>
              <div class="checkbox-container">
                <input type="checkbox" :id="`use-component-cost-${index}`" v-model="component.useCalculatedCost" @change="updateComponentCostType(index)">
              </div>
            </div>
            
            <div v-if="!component.useCalculatedCost" class="form-group">
              <label :for="`custom-cost-${index}`">Costo personalizzato per unità *</label>
              <div class="input-group">
                <span class="input-group-text">€</span>
                <input 
                  type="number" 
                  :id="`custom-cost-${index}`" 
                  v-model.number="component.customCost" 
                  required 
                  min="0" 
                  step="0.01" 
                  class="form-control"
                >
              </div>
            </div>
            
            <div v-if="component.component_id && component.quantity" class="cost-summary">
              <div v-if="component.useCalculatedCost && componentCosts[component.component_id]">
                <p>
                  <strong>Costo totale:</strong> 
                  € {{ (componentCosts[component.component_id] * component.quantity).toFixed(2) }}
                  ({{ component.quantity }} × € {{ componentCosts[component.component_id].toFixed(2) }})
                </p>
              </div>
              <div v-else-if="component.useCalculatedCost">
                <button type="button" @click="loadComponentCost(component.component_id)" class="btn btn-sm btn-secondary">
                  Calcola costo
                </button>
              </div>
              <div v-else>
                <p>
                  <strong>Costo totale (personalizzato):</strong> 
                  € {{ ((component.customCost || 0) * component.quantity).toFixed(2) }}
                  ({{ component.quantity }} × € {{ (component.customCost || 0).toFixed(2) }})
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <button type="button" @click="addComponent" class="btn btn-secondary">
          Aggiungi Componente
        </button>
      </div>
      
      <div class="production-cost" v-if="calculateTotalCost() > 0">
        <h3>Costo di Produzione: € {{ calculateTotalCost().toFixed(2) }}</h3>
        <p v-if="model.sellingPrice">
          Margine: {{ calculateMargin().toFixed(1) }}%
        </p>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Salvataggio in corso...' : 'Salva' }}
        </button>
        <button type="button" @click="cancel" class="btn btn-secondary">
          Annulla
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import componentService from '../services/componentService';
import api from '../services/api';

export default {
  name: 'ModelForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      model: {
        name: '',
        description: '',
        sellingPrice: 0,
        laborTimeMinutes: 0,
        components: []
      },
      availableComponents: [],
      componentCosts: {}, // Memorizza i costi dei componenti
      loading: false,
      loadingComponents: false,
      saving: false,
      error: null
    };
  },
  computed: {
    isNewModel() {
      return !this.id;
    }
  },
  created() {
    this.fetchComponents();
    if (!this.isNewModel) {
      this.fetchModel();
    } else {
      // Aggiungi un componente vuoto per iniziare
      this.addComponent();
    }
  },
  methods: {
    async fetchModel() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/api/models/${this.id}`);
        const modelData = response.data.model;
        const components = response.data.components || [];
        
        this.model = {
          ...modelData,
          components: components.map(component => ({
            component_id: component.component_id,
            quantity: component.quantity,
            useCalculatedCost: component.useCalculatedCost !== undefined ? component.useCalculatedCost : true,
            customCost: component.customCost || 0
          }))
        };
        
        // Se non ci sono componenti, aggiungi un componente vuoto
        if (this.model.components.length === 0) {
          this.addComponent();
        }
        
        // Carica i costi dei componenti
        for (const component of this.model.components) {
          if (component.component_id) {
            await this.loadComponentCost(component.component_id);
          }
        }
      } catch (error) {
        console.error('Error fetching model:', error);
        this.error = 'Si è verificato un errore durante il recupero del modello. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchComponents() {
      this.loadingComponents = true;
      
      try {
        const response = await componentService.getAllComponents();
        this.availableComponents = response.data;
      } catch (error) {
        console.error('Error fetching components:', error);
        this.error = 'Si è verificato un errore durante il recupero dei componenti. Riprova più tardi.';
      } finally {
        this.loadingComponents = false;
      }
    },
    
    addComponent() {
      this.model.components.push({
        component_id: '',
        quantity: 1,
        useCalculatedCost: true,
        customCost: 0
      });
    },
    
    removeComponent(index) {
      this.model.components.splice(index, 1);
    },
    
    async loadComponentCost(componentId) {
      try {
        const response = await componentService.getComponentCost(componentId);
        // In Vue 3, possiamo usare l'assegnazione diretta per proprietà reattive
        this.componentCosts = { 
          ...this.componentCosts, 
          [componentId]: response.data.totalCost 
        };
      } catch (error) {
        console.error('Error fetching component cost:', error);
        this.componentCosts = { 
          ...this.componentCosts, 
          [componentId]: 0 
        };
      }
    },
    
    updateComponentCost(index) {
      const component = this.model.components[index];
      if (component.component_id && !this.componentCosts[component.component_id]) {
        this.loadComponentCost(component.component_id);
      }
    },
    
    updateComponentCostType(index) {
      const component = this.model.components[index];
      if (component.useCalculatedCost && component.component_id) {
        // Se si passa a "usa costo calcolato", carica il costo del componente
        if (!this.componentCosts[component.component_id]) {
          this.loadComponentCost(component.component_id);
        }
      }
    },
    
    calculateTotalCost() {
      return this.model.components.reduce((total, component) => {
        let unitCost = 0;
        
        if (component.useCalculatedCost) {
          // Usa il costo calcolato dal sistema
          unitCost = this.componentCosts[component.component_id] || 0;
        } else {
          // Usa il costo personalizzato
          unitCost = component.customCost || 0;
        }
        
        return total + (unitCost * component.quantity);
      }, 0);
    },
    
    calculateMargin() {
      const totalCost = this.calculateTotalCost();
      if (totalCost === 0 || !this.model.sellingPrice) {
        return 0;
      }
      
      return ((this.model.sellingPrice - totalCost) / this.model.sellingPrice) * 100;
    },
    
    async saveModel() {
      // Validazione
      if (!this.model.name) {
        alert('Il nome del modello è obbligatorio.');
        return;
      }
      
      if (this.model.sellingPrice < 0) {
        alert('Il prezzo di vendita non può essere negativo.');
        return;
      }
      
      if (this.model.laborTimeMinutes < 0) {
        alert('Il tempo di lavoro non può essere negativo.');
        return;
      }
      
      // Verifica che ci sia almeno un componente
      if (this.model.components.length === 0) {
        alert('Aggiungi almeno un componente al modello.');
        return;
      }
      
      // Verifica che tutti i componenti abbiano un ID e una quantità
      const invalidComponent = this.model.components.find(
        component => !component.component_id || !component.quantity
      );
      
      if (invalidComponent) {
        alert('Tutti i componenti devono avere un componente selezionato e una quantità maggiore di zero.');
        return;
      }
      
      this.saving = true;
      
      try {
        const modelData = {
          name: this.model.name,
          description: this.model.description,
          sellingPrice: this.model.sellingPrice,
          laborTimeMinutes: this.model.laborTimeMinutes,
          components: this.model.components
        };
        
        if (this.isNewModel) {
          await api.post('/api/models', modelData);
        } else {
          await api.put(`/api/models/${this.id}`, modelData);
        }
        
        this.$router.push('/models');
      } catch (error) {
        console.error('Error saving model:', error);
        alert('Si è verificato un errore durante il salvataggio del modello. Riprova più tardi.');
      } finally {
        this.saving = false;
      }
    },
    
    cancel() {
      this.$router.push('/models');
    }
  }
};
</script>

<style scoped>
.model-form {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group-text {
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.input-group .form-control {
  border-radius: 0 4px 4px 0;
}

.components-list {
  margin-bottom: 20px;
}

.component-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.component-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.cost-summary {
  margin-top: 10px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.production-cost {
  margin-top: 20px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 4px;
  text-align: right;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
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
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>