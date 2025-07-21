<template>
  <div class="inventory-form">
    <h1>{{ isEditing ? 'Modifica Articolo' : 'Nuovo Articolo in Magazzino' }}</h1>

    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <form v-else @submit.prevent="saveItem">
      <div class="form-group">
        <label for="modelId">Modello *</label>
        <select id="modelId" v-model="item.modelId" required>
          <option value="">-- Seleziona un modello --</option>
          <option v-for="model in models" :key="model.id" :value="model.id" :selected="model.id == item.modelId">
            {{ model.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="quantity">Quantità *</label>
        <input type="number" id="quantity" v-model.number="item.quantity" required min="1" step="1" placeholder="1">
      </div>

      <div class="form-group">
        <label for="productionDate">Data di Produzione</label>
        <input type="date" id="productionDate" v-model="formattedDate">
      </div>

      <div class="form-group">
        <label for="notes">Note</label>
        <textarea id="notes" v-model="item.notes" placeholder="Note aggiuntive sull'articolo" rows="3"></textarea>
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
  name: 'InventoryForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      item: {
        modelId: '',
        quantity: 1,
        productionDate: new Date().toISOString(),
        notes: ''
      },
      models: [],
      loading: false,
      error: null
    };
  },
  computed: {
    isEditing() {
      return !!this.id;
    },
    formattedDate: {
      get() {
        // Usa solo snake_case per coerenza
        const date = this.item.productionDate;
        if (!date) return '';

        // Gestisci diversi formati di data
        if (typeof date === 'string') {
          return date.split('T')[0];
        }

        // Se è un oggetto Date
        if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        }

        return '';
      },
      set(value) {
        // Imposta solo snake_case per coerenza
        const formattedDate = value ? `${value}T00:00:00.000Z` : null;
        this.item.productionDate = formattedDate;
      }
    }
  },
  created() {
    this.fetchModels();
    if (this.isEditing) {
      this.fetchItem();
    }
  },
  methods: {
    async fetchModels() {
      try {
        const response = await api.get('/api/models');
        this.models = response.data;
      } catch (error) {
        console.error('Error fetching models:', error);
        this.error = 'Si è verificato un errore durante il recupero dei modelli. Riprova più tardi.';
      }
    },

    async fetchItem() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/api/inventory/${this.id}`);
        this.item = response.data;
      } catch (error) {
        console.error('Error fetching inventory item:', error);
        this.error = 'Si è verificato un errore durante il recupero dell\'articolo. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },

    async saveItem() {
      this.loading = true;
      this.error = null;

      try {
        // Prepara i dati da inviare
        const itemData = {
          modelId: this.item.modelId,
          quantity: this.item.quantity,
          productionDate: this.formattedDate ? `${this.formattedDate}T00:00:00.000Z` : null,
          notes: this.item.notes
        };

        console.log('Saving inventory item with data:', itemData);

        if (this.isEditing) {
          // Includi anche la data di produzione nell'aggiornamento
          await api.put(`/api/inventory/${this.id}`, {
            quantity: this.item.quantity,
            productionDate: this.formattedDate ? `${this.formattedDate}T00:00:00.000Z` : null,
            notes: this.item.notes
          });
        } else {
          await api.post('/api/inventory', itemData);
        }

        this.$router.push('/inventory');
      } catch (error) {
        console.error('Error saving inventory item:', error);
        this.error = 'Si è verificato un errore durante il salvataggio dell\'articolo. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.push('/inventory');
    }
  }
};
</script>

<style scoped>
.inventory-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.loading,
.error {
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

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
textarea,
select {
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