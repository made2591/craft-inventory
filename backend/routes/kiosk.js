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
  
  // Funzione per resettare il database
  const resetDatabase = async () => {
    console.log('🔄 API: Resetting database...');

    // Leggi i file di inizializzazione
    const initDbDir = path.join(__dirname, '..', 'init-db');
    const initFiles = fs.readdirSync(initDbDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordina i file per nome

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
      
      // Esegui i file di inizializzazione per ripopolare il database
      for (const file of initFiles) {
        console.log(`🔄 API: Executing init file: ${file}`);
        
        const filePath = path.join(initDbDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Dividi il file SQL in singole istruzioni per evitare conflitti
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          if (statement) {
            try {
              await pool.query(statement);
            } catch (err) {
              // Ignora errori per tabelle/vincoli già esistenti
              if (!err.message.includes('already exists') && 
                  !err.message.includes('does not exist') &&
                  !err.message.includes('duplicate key')) {
                console.warn(`Warning executing statement: ${err.message}`);
              }
            }
          }
        }
      }
      
      await pool.query('COMMIT');
      console.log('✅ API: Database reset completed successfully');
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
    const KIOSK_RESET_INTERVAL = 15; // minuti
    
    res.json({
      kioskMode: KIOSK_MODE,
      resetInterval: KIOSK_MODE ? `${KIOSK_RESET_INTERVAL} minuti` : null,
      status: KIOSK_MODE ? 'ATTIVO - Reset automatico abilitato' : 'DISATTIVO - Reset automatico disabilitato',
      message: KIOSK_MODE 
        ? `Il database viene automaticamente resettato ogni ${KIOSK_RESET_INTERVAL} minuti`
        : 'Per abilitare la modalità kiosk, imposta KIOSK_MODE=true nel docker-compose'
    });
  });

  return router;
}
