<template>
  <div class="database-management">
    <h1>Gestione Database</h1>
    
    <div class="card">
      <h2>Esportazione Database</h2>
      <p>Scarica un backup completo del database in formato SQL.</p>
      <div class="actions">
        <button @click="exportDatabase" class="btn btn-primary" :disabled="exporting">
          <span v-if="exporting">Esportazione in corso...</span>
          <span v-else>Esporta Database</span>
        </button>
      </div>
      <div v-if="exportError" class="error-message">
        {{ exportError }}
      </div>
    </div>
    
    <div class="card">
      <h2>Importazione Database</h2>
      <p>Carica un file SQL per ripristinare il database. <strong>Attenzione:</strong> questa operazione sovrascriverà i dati esistenti.</p>
      <div class="file-upload">
        <input type="file" id="sql-file" ref="fileInput" accept=".sql" @change="handleFileChange" />
        <label for="sql-file" class="file-label">
          <span v-if="selectedFile">{{ selectedFile.name }}</span>
          <span v-else>Seleziona file SQL</span>
        </label>
      </div>
      <div class="actions">
        <button @click="importDatabase" class="btn btn-danger" :disabled="importing || !selectedFile">
          <span v-if="importing">Importazione in corso...</span>
          <span v-else>Importa Database</span>
        </button>
      </div>
      <div v-if="importError" class="error-message">
        {{ importError }}
      </div>
      <div v-if="importSuccess" class="success-message">
        {{ importSuccess }}
      </div>
    </div>
    
    <div class="card">
      <h2>Reset Database</h2>
      <p><strong>Attenzione:</strong> questa operazione eliminerà tutti i dati e ripristinerà il database allo stato iniziale.</p>
      <div class="actions">
        <button @click="confirmReset" class="btn btn-danger" :disabled="resetting">
          <span v-if="resetting">Reset in corso...</span>
          <span v-else>Reset Database</span>
        </button>
      </div>
      <div v-if="resetError" class="error-message">
        {{ resetError }}
      </div>
      <div v-if="resetSuccess" class="success-message">
        {{ resetSuccess }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'DatabaseManagementView',
  data() {
    return {
      selectedFile: null,
      importing: false,
      exporting: false,
      resetting: false,
      importError: null,
      exportError: null,
      resetError: null,
      importSuccess: null,
      resetSuccess: null
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && file.name.endsWith('.sql')) {
        this.selectedFile = file;
        this.importError = null;
      } else {
        this.selectedFile = null;
        this.importError = 'Per favore seleziona un file SQL valido.';
      }
    },
    
    async exportDatabase() {
      this.exporting = true;
      this.exportError = null;
      
      try {
        const response = await api.get('/api/database/export', { responseType: 'blob' });
        
        // Crea un URL per il blob e avvia il download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Genera un nome file con data e ora corrente
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
        
        link.setAttribute('download', `craft-inventory-backup-${formattedDate}_${formattedTime}.sql`);
        document.body.appendChild(link);
        link.click();
        
        // Pulisci
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting database:', error);
        this.exportError = 'Si è verificato un errore durante l\'esportazione del database.';
      } finally {
        this.exporting = false;
      }
    },
    
    async importDatabase() {
      if (!this.selectedFile) {
        this.importError = 'Per favore seleziona un file SQL da importare.';
        return;
      }
      
      if (!confirm('Sei sicuro di voler importare questo database? Questa operazione sovrascriverà tutti i dati esistenti.')) {
        return;
      }
      
      this.importing = true;
      this.importError = null;
      this.importSuccess = null;
      
      try {
        const formData = new FormData();
        formData.append('sqlFile', this.selectedFile);
        
        await api.post('/api/database/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.importSuccess = 'Database importato con successo!';
        this.selectedFile = null;
        this.$refs.fileInput.value = '';
      } catch (error) {
        console.error('Error importing database:', error);
        this.importError = 'Si è verificato un errore durante l\'importazione del database.';
      } finally {
        this.importing = false;
      }
    },
    
    confirmReset() {
      if (confirm('ATTENZIONE: Stai per eliminare tutti i dati e ripristinare il database allo stato iniziale. Questa operazione non può essere annullata. Sei sicuro di voler procedere?')) {
        this.resetDatabase();
      }
    },
    
    async resetDatabase() {
      this.resetting = true;
      this.resetError = null;
      this.resetSuccess = null;
      
      try {
        await api.post('/api/database/reset');
        this.resetSuccess = 'Database ripristinato con successo allo stato iniziale!';
      } catch (error) {
        console.error('Error resetting database:', error);
        this.resetError = 'Si è verificato un errore durante il reset del database.';
      } finally {
        this.resetting = false;
      }
    }
  }
};
</script>

<style scoped>
.database-management {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.actions {
  margin-top: 15px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-size: 14px;
  min-width: 180px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.file-upload {
  margin: 15px 0;
}

.file-upload input[type="file"] {
  display: none;
}

.file-label {
  display: inline-block;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  min-width: 200px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.file-label:hover {
  background-color: #e9ecef;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
}

.success-message {
  color: #28a745;
  margin-top: 10px;
}
</style>