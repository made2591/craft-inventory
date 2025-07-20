<template>
  <div class="material-form">
    <h1>{{ isEditing ? 'Modifica Materiale' : 'Nuovo Materiale' }}</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveMaterial">
      <div class="form-group">
        <label for="name">Nome *</label>
        <input 
          type="text" 
          id="name" 
          v-model="material.name" 
          required
          placeholder="Nome del materiale"
        >
      </div>
      
      <div class="form-group">
        <label for="description">Descrizione</label>
        <textarea 
          id="description" 
          v-model="material.description" 
          placeholder="Descrizione del materiale"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="unit_of_measure">Unità di Misura *</label>
          <input 
            type="text" 
            id="unit_of_measure" 
            v-model="material.unit_of_measure" 
            required
            placeholder="es. metri, kg, pezzi"
          >
        </div>
        
        <div class="form-group">
          <label for="cost_per_unit">Costo per Unità *</label>
          <input 
            type="number" 
            id="cost_per_unit" 
            v-model.number="material.cost_per_unit" 
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="current_stock">Quantità Disponibile *</label>
          <input 
            type="number" 
            id="current_stock" 
            v-model.number="material.current_stock" 
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
        
        <div class="form-group">
          <label for="min_stock_level">Livello Minimo di Scorta</label>
          <input 
            type="number" 
            id="min_stock_level" 
            v-model.number="material.min_stock_level" 
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="supplier_id">Fornitore</label>
        <select id="supplier_id" v-model="material.supplier_id">
          <option value="">-- Seleziona un fornitore --</option>
          <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }}
          </option>
        </select>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">Annulla</button>
        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Aggiorna' : 'Salva' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import materialService from '../services/materialService';
import supplierService from '../services/supplierService';

export default {
  name: 'MaterialForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      material: {
        name: '',
        description: '',
        unit_of_measure: '',
        cost_per_unit: 0,
        current_stock: 0,
        min_stock_level: null,
        supplier_id: null
      },
      suppliers: [],
      loading: false,
      error: null
    };
  },
  computed: {
    isEditing() {
      return !!this.id;
    }
  },
  created() {
    this.fetchSuppliers();
    if (this.isEditing) {
      this.fetchMaterial();
    }
  },
  methods: {
    async fetchSuppliers() {
      try {
        const response = await supplierService.getAllSuppliers();
        this.suppliers = response.data;
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        this.error = 'Si è verificato un errore durante il recupero dei fornitori. Riprova più tardi.';
      }
    },
    
    async fetchMaterial() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await materialService.getMaterialById(this.id);
        this.material = response.data;
      } catch (error) {
        console.error('Error fetching material:', error);
        this.error = 'Si è verificato un errore durante il recupero del materiale. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    async saveMaterial() {
      this.loading = true;
      this.error = null;
      
      try {
        if (this.isEditing) {
          await materialService.updateMaterial(this.id, this.material);
        } else {
          await materialService.createMaterial(this.material);
        }
        
        this.$router.push('/materials');
      } catch (error) {
        console.error('Error saving material:', error);
        this.error = 'Si è verificato un errore durante il salvataggio del materiale. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.push('/materials');
    }
  }
};
</script>

<style scoped>
.material-form {
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

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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
</style>