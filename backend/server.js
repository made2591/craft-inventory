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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // Abilita SSL in produzione
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

// Funzione per resettare il database e ripopolarlo con i dati di test
const resetDatabase = async () => {
  try {
    console.log('🔄 KIOSK MODE: Resetting database...');

    // Leggi i file di inizializzazione
    const initDbDir = path.join(__dirname, 'init-db');
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
        'transaction_materials',
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
        console.log(`🔄 KIOSK MODE: Executing init file: ${file}`);
        
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
      console.log('✅ KIOSK MODE: Database reset completed successfully');
      
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
    
  } catch (err) {
    console.error('❌ KIOSK MODE: Error resetting database:', err);
  }
};

// Configurazione KIOSK MODE
const KIOSK_MODE = process.env.KIOSK_MODE === 'true';
const KIOSK_RESET_INTERVAL = 15 * 60 * 1000; // 15 minuti in millisecondi

if (KIOSK_MODE) {
  console.log('🏪 KIOSK MODE ENABLED: Database will be reset every 15 minutes');
  
  // Esegui il primo reset dopo 15 minuti dall'avvio
  setTimeout(() => {
    resetDatabase();
    
    // Poi impostalo per ripetersi ogni 15 minuti
    setInterval(resetDatabase, KIOSK_RESET_INTERVAL);
  }, KIOSK_RESET_INTERVAL);
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

// Configura i router per tutte le API
setupRoutes(app, pool, toCamelCase);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});