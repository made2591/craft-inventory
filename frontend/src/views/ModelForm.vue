<template>
  <div class="model-form">
    <h1>{{ isEditing ? 'Modifica Modello' : 'Nuovo Modello di Prodotto' }}</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveModel">
      <div class="form-group">
        <label for="name">Nome *</label>
        <input 
          type="text" 
          id="name" 
          v-model="model.name" 
          required
          placeholder="Nome del modello"
        >
      </div>
      
      <div class="form-group">
        <label for="description">Descrizione</label>
        <textarea 
          id="description" 
          v-model="model.description" 
          placeholder="Descrizione del modello"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="selling_price">Prezzo di Vendita *</label>
          <input 
            type="number" 
            id="selling_price" 
            v-model.number="model.selling_price" 
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
        
        <div class="form-group">
          <label for="labor_time_minutes">Tempo di Lavoro (minuti) *</label>
          <input 
            type="number" 
            id="labor_time_minutes" 
            v-model.number="model.labor_time_minutes" 
            required
            min="0"
            step="1"
            placeholder="0"
          >
        </div>
      </div>
      
      <div class="materials-section">
        <h2>Materiali Necessari</h2>
        <p class="info">Aggiungi i materiali necessari per questo modello. Il costo di produzione verrà calcolato automaticamente.</p>
        
        <div v-if="materials.length === 0" class="empty-state">
          Nessun materiale disponibile. Aggiungi prima dei materiali.
        </div>
        
        <div v-else>
          <div 
            v-for="(materialItem, index) in model.materials" 
            :key="index" 
            class="material-item"
          >
            <div class="form-row">
              <div class="form-group material-select">
                <label :for="`material-${index}`">Materiale *</label>
                <select 
                  :id="`material-${index}`" 
                  v-model="materialItem.material_id" 
                  required
                >
                  <option value="">-- Seleziona un materiale --</option>
                  <option v-for="material in materials" :key="material.id" :value="material.id">
                    {{ material.name }} ({{ material.unit_of_measure }})
                  </option>
                </select>
              </div>
              
              <div class="form-group material-quantity">
                <label :for="`quantity-${index}`">Quantità *</label>
                <input 
                  type="number" 
                  :id="`quantity-${index}`" 
                  v-model.number="materialItem.quantity" 
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                >
              </div>
              
              <div class="material-actions">
                <button 
                  type="button" 
                  class="btn btn-danger btn-sm" 
                  @click="removeMaterial(index)"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="addMaterial"
          >
            Aggiungi Materiale
          </button>
        </div>
      </div>
      
      <div class="cost-summary" v-if="estimatedCost > 0">
        <h3>Riepilogo Costi</h3>
        <div class="cost-item">
          <span>Costo Materiali:</span>
          <span>€ {{ estimatedCost !== undefined ? estimatedCost.toFixed(2) : '0.00' }}</span>
        </div>
        <div class="cost-item">
          <span>Prezzo di Vendita:</span>
          <span>€ {{ model.selling_price !== undefined ? model.selling_price.toFixed(2) : '0.00' }}</span>
        </div>
        <div class="cost-item margin" :class="{ 'negative-margin': margin < 0 }">
          <span>Margine:</span>
          <span>{{ margin !== undefined ? margin.toFixed(1) : '0.0' }}%</span>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">Annulla</button>
        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Aggiorna' : 'Salva' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
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
        selling_price: 0,
        labor_time_minutes: 0,
        materials: [{ material_id: '', quantity: 1 }]
      },
      materials: [],
      loading: false,
      error: null
    };
  },
  computed: {
    isEditing() {
      return !!this.id;
    },
    estimatedCost() {
      return this.model.materials.reduce((total, item) => {
        const material = this.materials.find(m => m.id === item.material_id);
        if (material) {
          return total + (material.cost_per_unit * item.quantity);
        }
        return total;
      }, 0);
    },
    margin() {
      if (this.model.selling_price <= 0 || this.estimatedCost <= 0) return 0;
      return ((this.model.selling_price - this.estimatedCost) / this.model.selling_price) * 100;
    }
  },
  created() {
    this.fetchMaterials();
    if (this.isEditing) {
      this.fetchModel();
    }
  },
  methods: {
    async fetchMaterials() {
      try {
        const response = await api.get('/api/materials');
        this.materials = response.data;
      } catch (error) {
        console.error('Error fetching materials:', error);
        this.error = 'Si è verificato un errore durante il recupero dei materiali. Riprova più tardi.';
      }
    },
    
    async fetchModel() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/api/models/${this.id}`);
        const { model, materials } = response.data;
        
        this.model = {
          ...model,
          materials: materials.map(m => ({
            material_id: m.material_id,
            quantity: m.quantity
          }))
        };
        
        if (this.model.materials.length === 0) {
          this.model.materials = [{ material_id: '', quantity: 1 }];
        }
      } catch (error) {
        console.error('Error fetching model:', error);
        this.error = 'Si è verificato un errore durante il recupero del modello. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    addMaterial() {
      this.model.materials.push({ material_id: '', quantity: 1 });
    },
    
    removeMaterial(index) {
      if (this.model.materials.length > 1) {
        this.model.materials.splice(index, 1);
      }
    },
    
    async saveModel() {
      // Validazione dei materiali
      const validMaterials = this.model.materials.filter(m => m.material_id && m.quantity > 0);
      if (validMaterials.length === 0) {
        this.error = 'Devi aggiungere almeno un materiale al modello.';
        return;
      }
      
      this.model.materials = validMaterials;
      this.loading = true;
      this.error = null;
      
      try {
        if (this.isEditing) {
          // Per l'aggiornamento, inviamo solo i campi che possono essere aggiornati
          const updateData = {
            name: this.model.name,
            description: this.model.description,
            selling_price: this.model.selling_price,
            labor_time_minutes: this.model.labor_time_minutes
          };
          
          await api.put(`/api/models/${this.id}`, updateData);
        } else {
          await api.post('/api/models', this.model);
        }
        
        this.$router.push('/models');
      } catch (error) {
        console.error('Error saving model:', error);
        this.error = 'Si è verificato un errore durante il salvataggio del modello. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.push('/models');
    }
  }
};
</script>

<style scoped>
.model-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3 {
  margin-bottom: 20px;
}

h2 {
  font-size: 1.5rem;
  margin-top: 30px;
}

h3 {
  font-size: 1.2rem;
  margin-top: 20px;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error {
  color: #dc3545;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.materials-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info {
  font-style: italic;
  color: #6c757d;
  margin-bottom: 20px;
}

.material-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.material-select {
  flex: 2;
}

.material-quantity {
  flex: 1;
}

.material-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
}

.cost-summary {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 16px;
}

.margin {
  font-weight: bold;
  font-size: 18px;
}

.negative-margin {
  color: #dc3545;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
</style>