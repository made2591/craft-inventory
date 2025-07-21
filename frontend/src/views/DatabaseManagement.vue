<template>
  <div class="database-management">
    <h1>Gestione Database</h1>
    
    <!-- Sezione Backup e Ripristino -->
    <div class="card">
      <div class="card-header">
        <h2>Backup e Ripristino</h2>
      </div>
      <div class="card-body">
        <p>
          Esporta il database come file SQL per il backup o importa un file SQL per ripristinare il database.
        </p>
        
        <div class="action-buttons action-buttons-row">
          <button 
            @click="exportDatabase" 
            class="btn btn-primary action-button" 
            :disabled="loading"
          >
            {{ loading && operation === 'export' ? 'Esportazione in corso...' : 'Esporta Database' }}
          </button>
          
          <label for="import-file" class="btn btn-secondary action-button" :class="{ disabled: loading }">
            {{ loading && operation === 'import' ? 'Importazione in corso...' : 'Importa Database' }}
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
        <h2>Reset Database</h2>
      </div>
      <div class="card-body">
        <p>
          Ripristina il database allo stato iniziale, eliminando tutti i dati esistenti.
          <strong>Attenzione:</strong> Questa operazione è irreversibile.
        </p>
        
        <div class="action-buttons action-buttons-row">
          <button 
            @click="resetDatabase" 
            class="btn btn-danger action-button" 
            :disabled="loading"
          >
            {{ loading && operation === 'reset' ? 'Reset in corso...' : 'Reset Database' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sezione Inizializzazione Dati di Test -->
    <div class="card">
      <div class="card-header">
        <h2>Inizializzazione Dati di Test</h2>
      </div>
      <div class="card-body">
        <p>
          Questa funzione inizializza il database con dati di test per facilitare lo sviluppo e il testing dell'applicazione.
          <strong>Attenzione:</strong> Questa operazione eliminerà tutti i dati esistenti nel database e li sostituirà con dati di test.
        </p>
        
        <div class="test-data-summary">
          <h3>Dati che verranno creati:</h3>
          <ul>
            <li><strong>3 Fornitori</strong>: Fornitore Legno, Fornitore Metalli, Fornitore Tessuti</li>
            <li><strong>3 Materiali</strong>: Legno di Quercia, Acciaio Inox, Tessuto Cotone</li>
            <li><strong>2 Componenti</strong>: Gamba Tavolo, Piano Tavolo</li>
            <li><strong>2 Modelli</strong>: Tavolo Moderno, Tavolo Rustico</li>
            <li><strong>4 Articoli in Magazzino</strong>: 2 per ogni modello</li>
          </ul>
        </div>
        
        <div class="action-buttons action-buttons-row">
          <button 
            @click="initTestData" 
            class="btn btn-warning action-button" 
            :disabled="loading"
          >
            {{ loading && operation === 'init' ? 'Inizializzazione in corso...' : 'Inizializza Dati di Test' }}
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
      selectedFile: null
    };
  },
  methods: {
    async exportDatabase() {
      this.loading = true;
      this.operation = 'export';
      this.message = '';
      
      try {
        // Richiedi il download del file di backup
        window.location.href = '/api/database/export';
        this.message = 'Esportazione del database avviata. Il download dovrebbe iniziare a breve.';
        this.messageType = 'success';
      } catch (error) {
        console.error('Error exporting database:', error);
        this.message = 'Si è verificato un errore durante l\'esportazione del database. Riprova più tardi.';
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
        this.message = 'Nessun file selezionato.';
        this.messageType = 'error';
        return;
      }
      
      if (!confirm('Sei sicuro di voler importare questo file SQL? Tutti i dati esistenti verranno sovrascritti.')) {
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
        
        const response = await api.post('/api/database/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.message = response.data.message || 'Database importato con successo.';
        this.messageType = 'success';
      } catch (error) {
        console.error('Error importing database:', error);
        this.message = 'Si è verificato un errore durante l\'importazione del database. Riprova più tardi.';
        this.messageType = 'error';
      } finally {
        this.loading = false;
        this.operation = null;
        this.$refs.fileInput.value = null;
        this.selectedFile = null;
      }
    },
    
    async resetDatabase() {
      if (!confirm('Sei sicuro di voler ripristinare il database allo stato iniziale? Tutti i dati esistenti verranno eliminati.')) {
        return;
      }
      
      this.loading = true;
      this.operation = 'reset';
      this.message = '';
      
      try {
        const response = await api.post('/api/database/reset');
        this.message = response.data.message || 'Database ripristinato con successo.';
        this.messageType = 'success';
      } catch (error) {
        console.error('Error resetting database:', error);
        this.message = 'Si è verificato un errore durante il ripristino del database. Riprova più tardi.';
        this.messageType = 'error';
      } finally {
        this.loading = false;
        this.operation = null;
      }
    },
    
    async initTestData() {
      if (!confirm('Sei sicuro di voler inizializzare il database con dati di test? Tutti i dati esistenti verranno eliminati.')) {
        return;
      }
      
      this.loading = true;
      this.operation = 'init';
      this.message = '';
      
      try {
        const response = await api.post('/api/test-data/init');
        this.message = `Inizializzazione completata con successo! Creati: ${response.data.data.suppliers} fornitori, ${response.data.data.materials} materiali, ${response.data.data.components} componenti, ${response.data.data.models} modelli e ${response.data.data.inventoryItems} articoli in magazzino.`;
        this.messageType = 'success';
      } catch (error) {
        console.error('Error initializing test data:', error);
        this.message = 'Si è verificato un errore durante l\'inizializzazione dei dati di test. Riprova più tardi.';
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

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  font-weight: bold;
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
</style>