<template>
  <div class="component-form">
    <h1>{{ isNewComponent ? 'Nuovo Componente' : 'Modifica Componente' }}</h1>

    <div v-if="loading" class="loading">
      Caricamento in corso...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <form v-else @submit.prevent="saveComponent" class="form">
      <div v-if="!isNewComponent" class="form-group">
        <label for="sku">SKU</label>
        <input type="text" id="sku" v-model="component.sku" disabled class="form-control form-control-disabled">
        <small class="form-text text-muted">Il codice SKU viene generato automaticamente alla creazione</small>
      </div>

      <div class="form-group">
        <label for="name">Nome *</label>
        <input type="text" id="name" v-model="component.name" required class="form-control">
      </div>

      <div class="form-group">
        <label for="description">Descrizione</label>
        <textarea id="description" v-model="component.description" class="form-control" rows="3"></textarea>
      </div>

      <h2>Materiali</h2>
      <div v-if="loadingMaterials" class="loading">
        Caricamento materiali in corso...
      </div>
      <div v-else>
        <div class="materials-list">
          <div v-for="(material, index) in component.materials" :key="index" class="material-item">
            <div class="material-header">
              <h3>Materiale {{ index + 1 }}</h3>
              <button type="button" @click="removeMaterial(index)" class="btn btn-sm btn-danger">
                Rimuovi
              </button>
            </div>

            <div class="form-group">
              <label :for="`material-${index}`">Materiale *</label>
              <select :id="`material-${index}`" v-model="material.materialId" required class="form-control"
                @change="updateMaterialCost(index)">
                <option value="">Seleziona un materiale</option>
                <option v-for="availableMaterial in availableMaterials" :key="availableMaterial.id"
                  :value="availableMaterial.id">
                  {{ availableMaterial.name }} ({{ availableMaterial.unitOfMeasure }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label :for="`quantity-${index}`">Quantità *</label>
              <input type="number" :id="`quantity-${index}`" v-model.number="material.quantity" required min="0.01"
                step="0.01" class="form-control">
            </div>

            <div class="form-group">
              <label :for="`use-material-cost-${index}`">Usa costo del materiale</label>
              <div class="checkbox-container">
                <input type="checkbox" :id="`use-material-cost-${index}`" v-model="material.useMaterialCost">
              </div>
            </div>

            <div v-if="!material.useMaterialCost" class="form-group">
              <label :for="`custom-cost-${index}`">Costo personalizzato per unità *</label>
              <input type="number" :id="`custom-cost-${index}`" v-model.number="material.customCost" required min="0"
                step="0.01" class="form-control">
            </div>

            <div v-if="material.materialId && material.quantity" class="cost-summary">
              <p>
                <strong>Costo totale:</strong>
                € {{ (calculateMaterialCost(material) || 0).toFixed(2) }}
                ({{ material.quantity }} ×
                {{ material.useMaterialCost
                  ? `€ ${(this.getMaterialCost(material.materialId) || 0).toFixed(2)}`
                  : `€ ${material.customCost ? material.customCost.toFixed(2) : '0.00'}`
                }})
              </p>
            </div>
          </div>
        </div>

        <button type="button" @click="addMaterial" class="btn btn-secondary">
          Aggiungi Materiale
        </button>
      </div>

      <div class="total-cost" v-if="component.materials && component.materials.length > 0">
        <h3>Costo Totale del Componente: € {{ (calculateTotalCost() || 0).toFixed(2) }}</h3>
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
import materialService from '../services/materialService';

export default {
  name: 'ComponentForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      component: {
        name: '',
        description: '',
        materials: []
      },
      availableMaterials: [],
      materialCosts: {}, // Memorizza i costi dei materiali
      loading: false,
      loadingMaterials: false,
      saving: false,
      error: null
    };
  },
  computed: {
    isNewComponent() {
      return !this.id;
    }
  },
  created() {
    this.fetchMaterials();
    if (!this.isNewComponent) {
      this.fetchComponent();
    } else {
      // Aggiungi un materiale vuoto per iniziare
      this.addMaterial();
    }
  },
  methods: {
    async fetchComponent() {
      this.loading = true;
      this.error = null;

      try {
        const response = await componentService.getComponent(this.id);
        const componentData = response.data.component;
        const materials = response.data.materials || [];

        this.component = {
          ...componentData,
          materials: materials.map(material => ({
            materialId: material.materialId || material.material_id,
            quantity: material.quantity,
            customCost: material.customCost || material.custom_cost,
            useMaterialCost: material.useMaterialCost !== undefined ? material.useMaterialCost : material.use_material_cost
          }))
        };

        // Se non ci sono materiali, aggiungi un materiale vuoto
        if (this.component.materials.length === 0) {
          this.addMaterial();
        }
      } catch (error) {
        console.error('Error fetching component:', error);
        this.error = 'Si è verificato un errore durante il recupero del componente. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },

    async fetchMaterials() {
      this.loadingMaterials = true;

      try {
        const response = await materialService.getAllMaterials();
        this.availableMaterials = response.data;

        // Memorizza i costi dei materiali
        this.availableMaterials.forEach(material => {
          this.materialCosts[material.id] = material.costPerUnit;
        });
      } catch (error) {
        console.error('Error fetching materials:', error);
        this.error = 'Si è verificato un errore durante il recupero dei materiali. Riprova più tardi.';
      } finally {
        this.loadingMaterials = false;
      }
    },

    addMaterial() {
      this.component.materials.push({
        materialId: '',
        quantity: 1,
        useMaterialCost: true,
        customCost: 0
      });
    },

    removeMaterial(index) {
      this.component.materials.splice(index, 1);
    },

    updateMaterialCost(index) {
      const material = this.component.materials[index];
      if (material.materialId && material.useMaterialCost) {
        const materialCost = this.getMaterialCost(material.materialId);
        material.customCost = materialCost;
      }
    },

    getMaterialCost(materialId) {
      const material = this.availableMaterials.find(m => m.id === materialId);
      // Assicurati che il valore restituito sia un numero
      const cost = material ? material.costPerUnit : 0;
      return typeof cost === 'number' ? cost : parseFloat(cost) || 0;
    },

    calculateMaterialCost(material) {
      if (!material.materialId || !material.quantity) {
        return 0;
      }

      const unitCost = material.useMaterialCost
        ? this.getMaterialCost(material.materialId)
        : (material.customCost || 0);

      return unitCost * material.quantity;
    },

    calculateTotalCost() {
      return this.component.materials.reduce((total, material) => {
        return total + this.calculateMaterialCost(material);
      }, 0);
    },

    async saveComponent() {
      // Validazione
      if (!this.component.name) {
        alert('Il nome del componente è obbligatorio.');
        return;
      }

      // Verifica che ci sia almeno un materiale
      if (this.component.materials.length === 0) {
        alert('Aggiungi almeno un materiale al componente.');
        return;
      }

      // Verifica che tutti i materiali abbiano un ID e una quantità
      const invalidMaterial = this.component.materials.find(
        material => !material.materialId || !material.quantity
      );

      if (invalidMaterial) {
        alert('Tutti i materiali devono avere un materiale selezionato e una quantità maggiore di zero.');
        return;
      }

      // Verifica che i materiali con useMaterialCost = false abbiano un customCost
      const invalidCustomCost = this.component.materials.find(
        material => !material.useMaterialCost && (!material.customCost && material.customCost !== 0)
      );

      if (invalidCustomCost) {
        alert('I materiali con costo personalizzato devono avere un valore di costo specificato.');
        return;
      }

      this.saving = true;

      try {
        const componentData = {
          name: this.component.name,
          description: this.component.description,
          materials: this.component.materials
        };

        if (this.isNewComponent) {
          await componentService.createComponent(componentData);
        } else {
          await componentService.updateComponent(this.id, componentData);
        }

        this.$router.push('/components');
      } catch (error) {
        console.error('Error saving component:', error);
        alert('Si è verificato un errore durante il salvataggio del componente. Riprova più tardi.');
      } finally {
        this.saving = false;
      }
    },

    cancel() {
      this.$router.push('/components');
    }
  }
};
</script>

<style scoped>
.component-form {
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

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
}

.materials-list {
  margin-bottom: 20px;
}

.material-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.material-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.cost-summary {
  margin-top: 10px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.total-cost {
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>