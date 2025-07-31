<template>
  <div class="material-form">
    <h1>{{ isEditing ? $t('materials.editMaterial') : $t('materials.newMaterial') }}</h1>
    
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="saveMaterial">
      <div class="form-group">
        <label for="name">{{ $t('materials.name') }} *</label>
        <input 
          type="text" 
          id="name" 
          v-model="material.name" 
          required
          :placeholder="$t('materials.namePlaceholder')"
        >
      </div>
      
      <div class="form-group">
        <label for="description">{{ $t('materials.description') }}</label>
        <textarea 
          id="description" 
          v-model="material.description" 
          :placeholder="$t('materials.descriptionPlaceholder')"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="link">{{ $t('materials.link') }}</label>
        <input 
          type="url" 
          id="link" 
          v-model="material.link" 
          :placeholder="$t('materials.linkPlaceholder')"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="unitOfMeasure">{{ $t('materials.unitOfMeasure') }} *</label>
          <input 
            type="text" 
            id="unitOfMeasure" 
            v-model="material.unitOfMeasure" 
            required
            :placeholder="$t('materials.unitOfMeasurePlaceholder')"
          >
        </div>
        
        <div class="form-group">
          <label for="costPerUnit">{{ $t('materials.costPerUnit') }} *</label>
          <input 
            type="number" 
            id="costPerUnit" 
            v-model.number="material.costPerUnit" 
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="currentStock">{{ $t('materials.currentStock') }} *</label>
          <input 
            type="number" 
            id="currentStock" 
            v-model.number="material.currentStock" 
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
        
        <div class="form-group">
          <label for="minStockLevel">{{ $t('materials.minStockLevel') }}</label>
          <input 
            type="number" 
            id="minStockLevel" 
            v-model.number="material.minStockLevel" 
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="supplierId">{{ $t('materials.supplier') }}</label>
        <select id="supplierId" v-model="material.supplierId">
          <option value="">-- {{ $t('common.selectSupplier') }} --</option>
          <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }}
          </option>
        </select>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary">{{ isEditing ? $t('common.update') : $t('common.save') }}</button>
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
        link: '',
        unitOfMeasure: '',
        costPerUnit: 0,
        currentStock: 0,
        minStockLevel: null,
        supplierId: null
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
        this.error = this.$t('errors.fetchSuppliers');
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
        this.error = this.$t('errors.fetchMaterial');
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
        this.error = this.$t('errors.saveMaterial');
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

.btn-primary {
  background-color: var(--secondary);
  color: var(--surface);
}

.btn-secondary {
  background-color: var(--oxford-blue-muted);
  color: var(--surface);
}
</style>