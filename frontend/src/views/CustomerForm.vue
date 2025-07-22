<template>
  <div class="customer-form">
    <h1>{{ isEditing ? $t('customers.editCustomer') : $t('customers.newCustomer') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveCustomer">
      <div class="form-group">
        <label for="name">{{ $t('customers.name') }} *</label>
        <input 
          type="text" 
          id="name" 
          v-model="customer.name" 
          required
          :placeholder="$t('customers.namePlaceholder')"
        >
      </div>
      
      <div class="form-group">
        <label for="customerType">{{ $t('customers.customerType') }} *</label>
        <select 
          id="customerType" 
          v-model="customer.customerType" 
          required
        >
          <option value="">-- {{ $t('common.selectType') }} --</option>
          <option value="private">{{ $t('customers.private') }}</option>
          <option value="online">{{ $t('customers.online') }}</option>
          <option value="store">{{ $t('customers.store') }}</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="contactPerson">{{ $t('customers.contactPerson') }}</label>
        <input 
          type="text" 
          id="contactPerson" 
          v-model="customer.contactPerson" 
          :placeholder="$t('customers.contactPersonPlaceholder')"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="email">{{ $t('customers.email') }}</label>
          <input 
            type="email" 
            id="email" 
            v-model="customer.email" 
            :placeholder="$t('customers.emailPlaceholder')"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">{{ $t('customers.phone') }}</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="customer.phone" 
            :placeholder="$t('customers.phonePlaceholder')"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="address">{{ $t('customers.address') }}</label>
        <textarea 
          id="address" 
          v-model="customer.address" 
          :placeholder="$t('customers.addressPlaceholder')"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="link">{{ $t('common.link') }}</label>
        <input 
          type="url" 
          id="link" 
          v-model="customer.link" 
          :placeholder="$t('common.linkPlaceholder')"
        >
      </div>
      
      <div class="form-group">
        <label for="notes">{{ $t('common.notes') }}</label>
        <textarea 
          id="notes" 
          v-model="customer.notes" 
          :placeholder="$t('common.additionalNotesPlaceholder')"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary">{{ isEditing ? $t('common.update') : $t('common.save') }}</button>
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
        customerType: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        link: '',
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