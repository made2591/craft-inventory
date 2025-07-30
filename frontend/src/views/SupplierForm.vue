<template>
  <div class="supplier-form">
    <h1>{{ isEditing ? $t('suppliers.editSupplier') : $t('suppliers.newSupplier') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveSupplier">
      <div class="form-group">
        <label for="name">{{ $t('suppliers.name') }} *</label>
        <input 
          type="text" 
          id="name" 
          v-model="supplier.name" 
          required
          :placeholder="$t('suppliers.namePlaceholder')"
        >
      </div>
      
      <div class="form-group">
        <label for="contactPerson">{{ $t('suppliers.contactPerson') }}</label>
        <input 
          type="text" 
          id="contactPerson" 
          v-model="supplier.contactPerson" 
          :placeholder="$t('suppliers.contactPersonPlaceholder')"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="email">{{ $t('suppliers.email') }}</label>
          <input 
            type="email" 
            id="email" 
            v-model="supplier.email" 
            :placeholder="$t('suppliers.emailPlaceholder')"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">{{ $t('suppliers.phone') }}</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="supplier.phone" 
            :placeholder="$t('suppliers.phonePlaceholder')"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="address">{{ $t('suppliers.address') }}</label>
        <textarea 
          id="address" 
          v-model="supplier.address" 
          :placeholder="$t('suppliers.addressPlaceholder')"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="link">{{ $t('common.link') }}</label>
        <input 
          type="url" 
          id="link" 
          v-model="supplier.link" 
          :placeholder="$t('suppliers.linkPlaceholder')"
        >
      </div>
      
      <div class="form-group">
        <label for="notes">{{ $t('common.notes') }}</label>
        <textarea 
          id="notes" 
          v-model="supplier.notes" 
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
        this.error = this.$t('errors.fetchSupplier');
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
        this.error = this.$t('errors.saveSupplier');
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