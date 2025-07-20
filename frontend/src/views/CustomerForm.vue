<template>
  <div class="customer-form">
    <h1>{{ isEditing ? 'Modifica Cliente' : 'Nuovo Cliente' }}</h1>
    
    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveCustomer">
      <div class="form-group">
        <label for="name">Nome *</label>
        <input 
          type="text" 
          id="name" 
          v-model="customer.name" 
          required
          placeholder="Nome del cliente"
        >
      </div>
      
      <div class="form-group">
        <label for="customer_type">Tipo Cliente *</label>
        <select 
          id="customer_type" 
          v-model="customer.customer_type" 
          required
        >
          <option value="">-- Seleziona un tipo --</option>
          <option value="private">Privato</option>
          <option value="online">Online</option>
          <option value="store">Negozio</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="contact_person">Persona di Contatto</label>
        <input 
          type="text" 
          id="contact_person" 
          v-model="customer.contact_person" 
          placeholder="Nome della persona di contatto"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="customer.email" 
            placeholder="Email"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Telefono</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="customer.phone" 
            placeholder="Numero di telefono"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="address">Indirizzo</label>
        <textarea 
          id="address" 
          v-model="customer.address" 
          placeholder="Indirizzo completo"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="notes">Note</label>
        <textarea 
          id="notes" 
          v-model="customer.notes" 
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
  name: 'CustomerForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      customer: {
        name: '',
        customer_type: '',
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
      this.fetchCustomer();
    }
  },
  methods: {
    async fetchCustomer() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/api/customers/${this.id}`);
        this.customer = response.data;
      } catch (error) {
        console.error('Error fetching customer:', error);
        this.error = 'Si è verificato un errore durante il recupero del cliente. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    async saveCustomer() {
      this.loading = true;
      this.error = null;
      
      try {
        if (this.isEditing) {
          await api.put(`/api/customers/${this.id}`, this.customer);
        } else {
          await api.post('/api/customers', this.customer);
        }
        
        this.$router.push('/customers');
      } catch (error) {
        console.error('Error saving customer:', error);
        this.error = 'Si è verificato un errore durante il salvataggio del cliente. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.push('/customers');
    }
  }
};
</script>

<style scoped>
.customer-form {
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