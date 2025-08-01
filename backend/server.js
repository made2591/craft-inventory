// Importazione dei moduli
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import setupRoutes from './routes/index.js';

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb',
  max: 20, // Massimo numero di client nel pool
  idleTimeoutMillis: 30000, // Tempo massimo di inattività di un client prima di essere rilasciato
  connectionTimeoutMillis: 2000, // Tempo massimo di attesa per una connessione
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false // SSL controllato dalla variabile DATABASE_SSL
});

// Gestione degli eventi del pool
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL pool');
});

pool.on('error', (err, _) => {
  console.error('Unexpected error on idle client', err);
});

// Funzione per eseguire le migrazioni
const runMigrations = async () => {
  try {
    console.log('Running migrations...');

    // Percorso della directory delle migrazioni
    const migrationsDir = path.join(__dirname, 'migrations');

    // Leggi tutti i file di migrazione
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordina i file per nome

    console.log(`Found ${migrationFiles.length} migration files:`, migrationFiles);

    // Esegui ogni migrazione
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      try {
        await pool.query(migrationSql);
        console.log(`Migration ${file} completed successfully`);
      } catch (err) {
        // Se la migrazione fallisce perché la colonna esiste già, continua
        if (err.message.includes('already exists')) {
          console.log(`Column already exists, skipping migration ${file}`);
        } else {
          console.error(`Error executing migration ${file}:`, err.message);
          // Non interrompere l'esecuzione delle altre migrazioni
        }
      }
    }

    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Error running migrations:', err);
  }
};

// Funzione per inizializzare i dati di test
const initTestData = async () => {
  try {
    console.log('🔄 KIOSK MODE: Initializing test data...');
    const startTime = Date.now();

    // Percorso del file di seed del database
    const seedDbFile = path.join(__dirname, 'init-db/02-seed-data.sql');

    // Verifica che il file esista
    if (!fs.existsSync(seedDbFile)) {
      throw new Error(`File di seed del database non trovato: ${seedDbFile}`);
    }

    // Leggi ed esegui il file di seed
    console.log('🔄 KIOSK MODE: Reading seed data file...');
    const seedSql = fs.readFileSync(seedDbFile, 'utf8');
    console.log(`🔄 KIOSK MODE: Seed file size: ${seedSql.length} characters`);
    
    // Rimuovi commenti e righe vuote, poi dividi per semicolon
    const cleanedLines = seedSql
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('--') && line !== '');
    
    const cleanSql = cleanedLines.join('\n');
    console.log(`🔄 KIOSK MODE: Cleaned SQL size: ${cleanSql.length} characters`);
    
    // Dividi il file SQL in singole istruzioni
    const statements = cleanSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && stmt.length > 10); // Filter out very short statements
    
    console.log(`🔄 KIOSK MODE: Found ${statements.length} SQL statements to execute`);
    
    if (statements.length === 0) {
      console.log('⚠️  KIOSK MODE: No valid SQL statements found in seed file');
      console.log('🔍 KIOSK MODE: First 500 chars of seed file:');
      console.log(seedSql.substring(0, 500));
      return;
    }
    
    await pool.query('BEGIN');
    
    try {
      let executedCount = 0;
      for (const statement of statements) {
        if (statement) {
          console.log(`   ↳ Executing statement ${executedCount + 1}/${statements.length}: ${statement.substring(0, 60)}...`);
          const result = await pool.query(statement);
          console.log(`   ↳ Statement ${executedCount + 1} executed successfully (${result.rowCount || 0} rows affected)`);
          executedCount++;
        }
      }
      
      await pool.query('COMMIT');
      const duration = Date.now() - startTime;
      console.log(`✅ KIOSK MODE: Test data initialization completed successfully`);
      console.log(`✅ KIOSK MODE: Executed ${executedCount} SQL statements in ${duration}ms`);
      
      // Verify data was inserted by counting records in key tables
      console.log('🔍 KIOSK MODE: Verifying inserted data...');
      const verification = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM materials) as materials_count,
          (SELECT COUNT(*) FROM components) as components_count,
          (SELECT COUNT(*) FROM suppliers) as suppliers_count,
          (SELECT COUNT(*) FROM customers) as customers_count,
          (SELECT COUNT(*) FROM product_models) as models_count,
          (SELECT COUNT(*) FROM transactions) as transactions_count
      `);
      
      const counts = verification.rows[0];
      console.log('📊 KIOSK MODE: Data verification results:');
      console.log(`   ↳ Materials: ${counts.materials_count}`);
      console.log(`   ↳ Components: ${counts.components_count}`);
      console.log(`   ↳ Suppliers: ${counts.suppliers_count}`);
      console.log(`   ↳ Customers: ${counts.customers_count}`);
      console.log(`   ↳ Models: ${counts.models_count}`);
      console.log(`   ↳ Transactions: ${counts.transactions_count}`);
      
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('❌ KIOSK MODE: Error during SQL execution:', err.message);
      throw err;
    }
    
  } catch (err) {
    console.error('❌ KIOSK MODE: Error initializing test data:', err);
    console.error('❌ KIOSK MODE: Full error details:', err.stack);
    throw err;
  }
};

// Funzione per resettare il database e ripopolarlo con i dati di test
const resetDatabase = async () => {
  try {
    console.log('🔄 KIOSK MODE: Starting database reset...');
    const startTime = Date.now();

    // Update global state
    if (global.kioskState) {
      global.kioskState.resetCount++;
      global.kioskState.lastReset = startTime;
      global.kioskState.nextReset = startTime + global.kioskState.resetInterval;
    }

    // Prima, elimina tutti i dati dalle tabelle (mantenendo la struttura)
    await pool.query('BEGIN');
    
    try {
      // Disabilita temporaneamente i vincoli di chiave esterna
      await pool.query('SET session_replication_role = replica;');
      
      // Elimina tutti i dati dalle tabelle principali
      const tablesToClear = [
        'transaction_items',
        'transactions',
        'inventory_items',
        'model_components',
        'model_materials',
        'product_models',
        'component_materials',
        'components',
        'materials',
        'suppliers',
        'customers',
        'users'
      ];
      
      console.log('🗑️  KIOSK MODE: Clearing existing data from tables...');
      let totalRowsCleared = 0;
      for (const table of tablesToClear) {
        const result = await pool.query(`DELETE FROM ${table};`);
        const rowCount = result.rowCount || 0;
        totalRowsCleared += rowCount;
        console.log(`   ↳ Cleared ${rowCount} rows from ${table}`);
      }
      
      // Riabilita i vincoli di chiave esterna
      await pool.query('SET session_replication_role = DEFAULT;');
      
      await pool.query('COMMIT');
      console.log(`✅ KIOSK MODE: Database cleared successfully (${totalRowsCleared} total rows removed)`);
      
      // Ora inizializza con i dati di test
      console.log('🔄 KIOSK MODE: Reinitializing with test data...');
      await initTestData();
      
      const duration = Date.now() - startTime;
      console.log(`✅ KIOSK MODE: Database reset completed successfully in ${duration}ms`);
      if (global.kioskState) {
        console.log(`🏪 KIOSK MODE: Reset #${global.kioskState.resetCount} - Next reset scheduled for ${new Date(global.kioskState.nextReset).toLocaleString()}`);
      }
      
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
    
  } catch (err) {
    console.error('❌ KIOSK MODE: Error resetting database:', err);
    console.error('❌ KIOSK MODE: Full error details:', err.stack);
  }
};

// Configurazione KIOSK MODE
const KIOSK_MODE = process.env.KIOSK_MODE === 'true';
// Configurable reset interval - default to 15 minutes if not specified
const KIOSK_RESET_INTERVAL_MINUTES = parseInt(process.env.KIOSK_RESET_INTERVAL_MINUTES) || 15;
const KIOSK_RESET_INTERVAL = KIOSK_RESET_INTERVAL_MINUTES * 60 * 1000; // Convert to milliseconds

// Global state for kiosk mode tracking
global.kioskState = {
  mode: KIOSK_MODE,
  resetInterval: KIOSK_RESET_INTERVAL,
  resetIntervalMinutes: KIOSK_RESET_INTERVAL_MINUTES,
  lastReset: null,
  nextReset: null,
  resetCount: 0,
  startTime: Date.now()
};

if (KIOSK_MODE) {
  console.log(`🏪 KIOSK MODE ENABLED: Database will be reset every ${KIOSK_RESET_INTERVAL_MINUTES} minutes`);
  console.log(`🏪 KIOSK MODE: Reset interval set to ${KIOSK_RESET_INTERVAL_MINUTES} minutes (${KIOSK_RESET_INTERVAL}ms)`);
  
  // Validate reset interval
  if (KIOSK_RESET_INTERVAL_MINUTES < 1) {
    console.warn('⚠️  KIOSK MODE: Reset interval is less than 1 minute, using minimum of 1 minute');
    global.kioskState.resetIntervalMinutes = 1;
    global.kioskState.resetInterval = 60 * 1000;
  } else if (KIOSK_RESET_INTERVAL_MINUTES > 1440) {
    console.warn('⚠️  KIOSK MODE: Reset interval is more than 24 hours, consider if this is intended');
  }
  
  // Calculate when the first reset will happen
  global.kioskState.nextReset = Date.now() + global.kioskState.resetInterval;
  
  // Esegui il primo reset dopo l'intervallo configurato dall'avvio
  setTimeout(() => {
    console.log(`🏪 KIOSK MODE: Starting first scheduled reset (after ${KIOSK_RESET_INTERVAL_MINUTES} minutes)...`);
    resetDatabase();
    
    // Poi impostalo per ripetersi ogni intervallo configurato
    console.log(`🏪 KIOSK MODE: Setting up recurring reset timer (every ${KIOSK_RESET_INTERVAL_MINUTES} minutes)...`);
    setInterval(() => {
      console.log(`🏪 KIOSK MODE: Starting scheduled reset (${KIOSK_RESET_INTERVAL_MINUTES} minute interval)...`);
      resetDatabase();
    }, global.kioskState.resetInterval);
  }, global.kioskState.resetInterval);
  
  console.log(`🏪 KIOSK MODE: First reset scheduled in ${KIOSK_RESET_INTERVAL_MINUTES} minutes at ${new Date(global.kioskState.nextReset).toLocaleString()}`);
} else {
  console.log('🔒 KIOSK MODE DISABLED: Database will not be automatically reset');
}

// Test database connection e esegui le migrazioni in una funzione asincrona autoeseguita
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);

    // Esegui le migrazioni
    await runMigrations();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
})();

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-zA-Z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

// Manual reset endpoint for testing (only available in kiosk mode)
if (KIOSK_MODE) {
  app.post('/api/kiosk/reset', async (req, res) => {
    try {
      console.log('🔧 MANUAL KIOSK RESET: Reset requested via API');
      await resetDatabase();
      res.json({ 
        success: true, 
        message: 'Database reset and reinitialized successfully',
        timestamp: new Date().toISOString(),
        resetCount: global.kioskState.resetCount
      });
    } catch (error) {
      console.error('❌ MANUAL KIOSK RESET: Error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  app.get('/api/kiosk/status', (req, res) => {
    res.json({
      kioskMode: global.kioskState.mode,
      resetInterval: global.kioskState.resetIntervalMinutes,
      lastReset: global.kioskState.lastReset ? new Date(global.kioskState.lastReset).toISOString() : null,
      nextReset: global.kioskState.nextReset ? new Date(global.kioskState.nextReset).toISOString() : null,
      resetCount: global.kioskState.resetCount,
      uptime: Date.now() - global.kioskState.startTime
    });
  });
}

// Configura i router per tutte le API
setupRoutes(app, pool, toCamelCase);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});