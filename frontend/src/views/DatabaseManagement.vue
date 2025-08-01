<template>
  <div class="database-management">
    <h1>{{ $t('database.title') }}</h1>
    
    <!-- Sezione Backup e Ripristino -->
    <div class="card">
      <div class="card-header">
        <h2>{{ $t('database.backup') }}</h2>
      </div>
      <div class="card-body">
        <p>
          {{ $t('database.backupDescription') }}
        </p>
        
        <div class="export-options">
          <h3>{{ $t('database.exportOptions') }}</h3>
          <div class="checkbox-group">
            <input type="checkbox" id="dataOnly" v-model="exportOptions.dataOnly">
            <label for="dataOnly">{{ $t('database.dataOnly') }}</label>
            <span class="tooltip" :title="$t('database.dataOnlyTooltip')">ℹ️</span>
          </div>
        </div>
        
        <div class="import-options">
          <h3>{{ $t('database.importOptions') }}</h3>
          <div class="checkbox-group">
            <input type="checkbox" id="preserveSchema" v-model="importOptions.preserveSchema">
            <label for="preserveSchema">{{ $t('database.preserveSchema') }}</label>
            <span class="tooltip" :title="$t('database.preserveSchemaTooltip')">ℹ️</span>
          </div>
        </div>
        
        <div class="action-buttons action-buttons-row">
          <button 
            @click="exportDatabase" 
            class="btn btn-primary action-button" 
            :disabled="loading"
          >
            {{ loading && operation === 'export' ? $t('database.exporting') : $t('database.export') }}
          </button>
          
          <label for="import-file" class="btn btn-secondary action-button" :class="{ disabled: loading }">
            {{ loading && operation === 'import' ? $t('database.importing') : $t('database.import') }}
          </label>
          <input 
            type="file" 
            id="import-file" 
            ref="fileInput" 
            accept=".sql" 
            @change="handleFileUpload" 
            style="display: none;"
          >
        </div>
      </div>
    </div>
    
    <!-- Sezione Reset Database -->
    <div class="card">
      <div class="card-header">
        <h2>{{ $t('database.reset') }}</h2>
      </div>
      <div class="card-body">
        <p>
          {{ $t('database.resetWarningFull') }}
        </p>
        
        <div class="action-buttons action-buttons-row">
          <button 
            @click="resetDatabase" 
            class="btn btn-danger action-button" 
            :disabled="loading"
          >
            {{ loading && operation === 'reset' ? $t('database.resetting') : $t('database.reset') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sezione Inizializzazione Dati di Test -->
    <div class="card">
      <div class="card-header">
        <h2>{{ $t('database.testData') }}</h2>
      </div>
      <div class="card-body">
        <p>
          {{ $t('database.testDataWarningFull') }}
        </p>
        
        <div class="test-data-summary">
          <h3>{{ $t('database.dataToCreate') }}:</h3>
          <ul>
            <li><strong>{{ $t('database.suppliersCount', { count: 3 }) }}</strong>: {{ $t('database.supplierNames') }}</li>
            <li><strong>{{ $t('database.materialsCount', { count: 3 }) }}</strong>: {{ $t('database.materialNames') }}</li>
            <li><strong>{{ $t('database.componentsCount', { count: 2 }) }}</strong>: {{ $t('database.componentNames') }}</li>
            <li><strong>{{ $t('database.modelsCount', { count: 2 }) }}</strong>: {{ $t('database.modelNames') }}</li>
            <li><strong>{{ $t('database.inventoryItemsCount', { count: 4 }) }}</strong>: {{ $t('database.inventoryItemDetails') }}</li>
          </ul>
        </div>
        
        <div class="action-buttons action-buttons-row">
          <button 
            @click="initTestData" 
            class="btn btn-warning action-button" 
            :disabled="loading"
          >
            {{ loading && operation === 'init' ? $t('database.initializing') : $t('database.initTestData') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Messaggi di feedback -->
    <div v-if="message" class="alert" :class="messageType === 'success' ? 'alert-success' : 'alert-error'">
      {{ message }}
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'DatabaseManagement',
  data() {
    return {
      loading: false,
      operation: null, // 'export', 'import', 'reset', 'init'
      message: '',
      messageType: 'success',
      selectedFile: null,
      exportOptions: {
        dataOnly: false
      },
      importOptions: {
        preserveSchema: false
      }
    };
  },
  methods: {
    async exportDatabase() {
      this.loading = true;
      this.operation = 'export';
      this.message = '';
      
      try {
        // Costruisci l'URL con i parametri di query in base alle opzioni selezionate
        let exportUrl = '/api/database/export';
        if (this.exportOptions.dataOnly) {
          exportUrl += '?dataOnly=true';
        }
        
        // Richiedi il download del file di backup
        window.location.href = exportUrl;
        
        const exportType = this.exportOptions.dataOnly ? 'solo dati' : 'completa';
        this.message = this.$t('database.exportStarted', { exportType: exportType });
        this.messageType = 'success';
      } catch (error) {
        console.error('Error exporting database:', error);
        this.message = this.$t('errors.exportDatabase');
        this.messageType = 'error';
      } finally {
        this.loading = false;
        this.operation = null;
      }
    },
    
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        this.importDatabase();
      }
    },
    
    async importDatabase() {
      if (!this.selectedFile) {
        this.message = this.$t('errors.noFileSelected');
        this.messageType = 'error';
        return;
      }
      
      // Personalizza il messaggio di conferma in base all'opzione selezionata
      let confirmMessage = this.importOptions.preserveSchema 
        ? this.$t('database.confirmImportPreserveSchema')
        : this.$t('database.confirmImportOverwrite');
      
      if (!confirm(confirmMessage)) {
        this.$refs.fileInput.value = null;
        this.selectedFile = null;
        return;
      }
      
      this.loading = true;
      this.operation = 'import';
      this.message = '';
      
      try {
        const formData = new FormData();
        formData.append('sqlFile', this.selectedFile);
        
        // Aggiungi l'opzione preserveSchema al FormData se selezionata
        if (this.importOptions.preserveSchema) {
          formData.append('preserveSchema', 'true');
        }
        
        const response = await api.post('/api/database/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Personalizza il messaggio di successo in base all'opzione selezionata
        const importType = this.importOptions.preserveSchema ? 'con preservazione dello schema' : 'completa';
        this.message = response.data.message || this.$t('database.importCompleted', { importType: importType });
        this.messageType = 'success';
      } catch (error) {
        console.error('Error importing database:', error);
        this.message = this.$t('errors.importDatabase');
        this.messageType = 'error';
      } finally {
        this.loading = false;
        this.operation = null;
        this.$refs.fileInput.value = null;
        this.selectedFile = null;
      }
    },
    
    async resetDatabase() {
      if (!confirm(this.$t('database.confirmReset'))) {
        return;
      }
      
      this.loading = true;
      this.operation = 'reset';
      this.message = '';
      
      try {
        const response = await api.post('/api/database/reset');
        this.message = response.data.message || this.$t('database.resetSuccess');
        this.messageType = 'success';
      } catch (error) {
        console.error('Error resetting database:', error);
        this.message = this.$t('errors.resetDatabase');
        this.messageType = 'error';
      } finally {
        this.loading = false;
        this.operation = null;
      }
    },
    
    async initTestData() {
      if (!confirm(this.$t('database.confirmInitTestData'))) {
        return;
      }
      
      this.loading = true;
      this.operation = 'init';
      this.message = '';
      
      try {
        const response = await api.post('/api/test-data/init');
        this.message = this.$t('database.initSuccess', { suppliers: response.data.data.suppliers, materials: response.data.data.materials, components: response.data.data.components, models: response.data.data.models, inventoryItems: response.data.data.inventoryItems });
        this.messageType = 'success';
      } catch (error) {
        console.error('Error initializing test data:', error);
        this.message = this.$t('errors.initTestData');
        this.messageType = 'error';
      } finally {
        this.loading = false;
        this.operation = null;
      }
    }
  }
};
</script>

<style scoped>
.database-management {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.card-body {
  padding: 20px;
}

.test-data-summary {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.test-data-summary h3 {
  margin-top: 0;
  font-size: 1.2rem;
}

.test-data-summary ul {
  margin-bottom: 0;
}

.action-buttons {
  margin-top: 20px;
  text-align: right;
}

.action-buttons-row {
  display: flex;
  justify-content: flex-end;
  gap: 15px; /* Spazio tra i pulsanti */
}

.action-button {
  min-width: 160px; /* Larghezza minima per uniformità */
  height: 44px; /* Altezza fissa per tutti i pulsanti */
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.export-options,
.import-options {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.export-options h3,
.import-options h3 {
  margin-top: 0;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  margin: 0;
  width: auto;
}

.tooltip {
  cursor: help;
  position: relative;
  display: inline-block;
}

.tooltip:hover::after {
  content: attr(title);
  position: absolute;
  left: 0;
  top: 100%;
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}
</style>