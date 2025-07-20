<template>
  <div class="supplier-form">
    <h1>{{ isEditing ? 'Modifica Fornitore' : 'Nuovo Fornitore' }}</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveSupplier">
      <div class="form-group">
        <label for="name">Nome *</label>
        <input 
          type="text" 
          id="name" 
          v-model="supplier.name" 
          required
          placeholder="Nome del fornitore"
        >
      </div>
      
      <div class="form-group">
        <label for="contact_person">Persona di Contatto</label>
        <input 
          type="text" 
          id="contact_person" 
          v-model="supplier.contact_person" 
          placeholder="Nome della persona di contatto"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="supplier.email" 
            placeholder="Email"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Telefono</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="supplier.phone" 
            placeholder="Numero di telefono"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="address">Indirizzo</label>
        <textarea 
          id="address" 
          v-model="supplier.address" 
          placeholder="Indirizzo completo"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="notes">Note</label>
        <textarea 
          id="notes" 
          v-model="supplier.notes" 
          placeholder="Note aggiuntive"
          rows="3"
        ></textarea>
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
  name: 'SupplierForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      supplier: {
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      },
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
    if (this.isEditing) {
      this.fetchSupplier();
    }
  },
  methods: {
    async fetchSupplier() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/api/suppliers/${this.id}`);
        this.supplier = response.data;
      } catch (error) {
        console.error('Error fetching supplier:', error);
        this.error = 'Si è verificato un errore durante il recupero del fornitore. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    async saveSupplier() {
      this.loading = true;
      this.error = null;
      
      try {
        if (this.isEditing) {
          await api.put(`/api/suppliers/${this.id}`, this.supplier);
        } else {
          await api.post('/api/suppliers', this.supplier);
        }
        
        this.$router.push('/suppliers');
      } catch (error) {
        console.error('Error saving supplier:', error);
        this.error = 'Si è verificato un errore durante il salvataggio del fornitore. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.push('/suppliers');
    }
  }
};
</script>

<style scoped>
.supplier-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>