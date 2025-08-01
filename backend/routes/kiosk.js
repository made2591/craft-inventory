import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configura le rotte per la modalità kiosk
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function kioskRoutes(pool, toCamelCase) {
  
  // Funzione per inizializzare i dati di test
  const initTestData = async () => {
    try {
      console.log('🔄 API: Initializing test data...');

      // Percorso del file di seed del database
      const seedDbFile = path.join(__dirname, '..', 'init-db', '02-seed-data.sql');

      // Verifica che il file esista
      if (!fs.existsSync(seedDbFile)) {
        throw new Error('File di seed del database non trovato');
      }

      // Leggi ed esegui il file di seed
      console.log('🔄 API: Executing seed data file...');
      const seedSql = fs.readFileSync(seedDbFile, 'utf8');
      
      // Dividi il file SQL in singole istruzioni per evitare conflitti
      const statements = seedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--'));
      
      await pool.query('BEGIN');
      
      try {
        for (const statement of statements) {
          if (statement) {
            await pool.query(statement);
          }
        }
        
        await pool.query('COMMIT');
        console.log('✅ API: Test data initialization completed successfully');
        
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
      
    } catch (err) {
      console.error('❌ API: Error initializing test data:', err);
      throw err;
    }
  };

  // Funzione per resettare il database
  const resetDatabase = async () => {
    console.log('🔄 API: Resetting database...');

    // Prima, elimina tutti i dati dalle tabelle (mantenendo la struttura)
    await pool.query('BEGIN');
    
    try {
      // Disabilita temporaneamente i vincoli di chiave esterna
      await pool.query('SET session_replication_role = replica;');
      
      // Elimina tutti i dati dalle tabelle principali
      const tablesToClear = [
        'transaction_items',
        'transactions',
        'model_components',
        'product_models',
        'component_materials',
        'components',
        'materials',
        'suppliers',
        'customers',
        'users'
      ];
      
      for (const table of tablesToClear) {
        await pool.query(`DELETE FROM ${table};`);
      }
      
      // Riabilita i vincoli di chiave esterna
      await pool.query('SET session_replication_role = DEFAULT;');
      
      await pool.query('COMMIT');
      console.log('✅ API: Database cleared successfully');
      
      // Ora inizializza con i dati di test
      await initTestData();
      
      return true;
      
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  };

  // POST /api/kiosk/reset - Reset manuale del database
  router.post('/reset', async (req, res) => {
    try {
      const KIOSK_MODE = process.env.KIOSK_MODE === 'true';
      
      // Verifica se il KIOSK_MODE è abilitato
      if (!KIOSK_MODE) {
        return res.status(403).json({ 
          error: 'Reset manuale non consentito: KIOSK_MODE non è abilitato',
          kioskMode: false
        });
      }
      
      console.log('🔧 API: Manual database reset requested');
      await resetDatabase();
      
      res.json({ 
        message: 'Database resettato con successo',
        timestamp: new Date().toISOString(),
        kioskMode: true
      });
      
    } catch (err) {
      console.error('❌ API: Error resetting database:', err);
      res.status(500).json({ 
        error: 'Errore durante il reset del database',
        details: err.message
      });
    }
  });

  // GET /api/kiosk/status - Ottieni lo stato del KIOSK_MODE
  router.get('/status', (req, res) => {
    const KIOSK_MODE = process.env.KIOSK_MODE === 'true';
    const KIOSK_RESET_INTERVAL_MINUTES = parseInt(process.env.KIOSK_RESET_INTERVAL_MINUTES) || 15;
    const kioskState = global.kioskState || {};
    
    const now = Date.now();
    const response = {
      kioskMode: KIOSK_MODE,
      resetInterval: KIOSK_MODE ? `${KIOSK_RESET_INTERVAL_MINUTES} minuti` : null,
      resetIntervalMinutes: KIOSK_MODE ? KIOSK_RESET_INTERVAL_MINUTES : null,
      resetIntervalMs: KIOSK_MODE ? KIOSK_RESET_INTERVAL_MINUTES * 60 * 1000 : null,
      status: KIOSK_MODE ? 'ATTIVO - Reset automatico abilitato' : 'DISATTIVO - Reset automatico disabilitato',
      message: KIOSK_MODE 
        ? `Il database viene automaticamente resettato ogni ${KIOSK_RESET_INTERVAL_MINUTES} minuti`
        : 'Per abilitare la modalità kiosk, imposta KIOSK_MODE=true nel docker-compose',
      configuration: KIOSK_MODE ? {
        configuredInterval: `${KIOSK_RESET_INTERVAL_MINUTES} minuti`,
        environmentVariable: 'KIOSK_RESET_INTERVAL_MINUTES',
        defaultValue: '15 minuti',
        currentValue: KIOSK_RESET_INTERVAL_MINUTES,
        validRange: '1-1440 minuti (1 minuto - 24 ore)'
      } : null,
      features: {
        automaticReset: KIOSK_MODE,
        testDataReload: KIOSK_MODE,
        manualReset: KIOSK_MODE,
        configurableInterval: true
      },
      timestamp: new Date().toISOString()
    };

    if (KIOSK_MODE && kioskState.startTime) {
      const uptimeMs = now - kioskState.startTime;
      const nextResetIn = kioskState.nextReset ? Math.max(0, kioskState.nextReset - now) : null;
      
      response.statistics = {
        uptime: `${Math.floor(uptimeMs / 1000 / 60)} minuti`,
        uptimeMs: uptimeMs,
        resetCount: kioskState.resetCount || 0,
        lastReset: kioskState.lastReset ? new Date(kioskState.lastReset).toISOString() : null,
        nextReset: kioskState.nextReset ? new Date(kioskState.nextReset).toISOString() : null,
        nextResetIn: nextResetIn ? `${Math.floor(nextResetIn / 1000 / 60)} minuti e ${Math.floor((nextResetIn % (1000 * 60)) / 1000)} secondi` : null,
        nextResetInMs: nextResetIn
      };
    }
    
    res.json(response);
  });

  // POST /api/kiosk/test-data - Reload solo i dati di test (per debug)
  router.post('/test-data', async (req, res) => {
    try {
      const KIOSK_MODE = process.env.KIOSK_MODE === 'true';
      
      if (!KIOSK_MODE) {
        return res.status(403).json({ 
          error: 'Test data reload non consentito: KIOSK_MODE non è abilitato',
          kioskMode: false
        });
      }
      
      console.log('🔧 API: Manual test data reload requested');
      await initTestData();
      
      res.json({ 
        message: 'Dati di test ricaricati con successo',
        timestamp: new Date().toISOString(),
        kioskMode: true
      });
      
    } catch (error) {
      console.error('❌ API: Error reloading test data:', error);
      res.status(500).json({ 
        error: 'Errore durante il reload dei dati di test',
        details: error.message
      });
    }
  });

  return router;
}
