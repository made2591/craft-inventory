import express from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const router = express.Router();

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configura le rotte per la gestione dei dati di test
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function testDataRoutes(_, __) {
  // POST /api/test-data/init - Inizializza il database con dati di test
  router.post('/init', async (req, res) => {
    try {
      // Ottieni le credenziali del database dalla stringa di connessione
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;

      // Percorsi dei file di inizializzazione e seed del database
      const initDbFile = path.join(__dirname, '../init-db/01-init.sql');
      const seedDbFile = path.join(__dirname, '../init-db/02-seed-data.sql');

      // Verifica che i file esistano
      if (!fs.existsSync(initDbFile)) {
        return res.status(500).json({ error: 'File di inizializzazione del database non trovato' });
      }

      if (!fs.existsSync(seedDbFile)) {
        return res.status(500).json({ error: 'File di seed del database non trovato' });
      }

      console.log('Init DB file found:', initDbFile);
      console.log('Init file size:', fs.statSync(initDbFile).size);
      console.log('Seed DB file found:', seedDbFile);
      console.log('Seed file size:', fs.statSync(seedDbFile).size);

      // Prima svuotiamo tutte le tabelle esistenti
      console.log('Truncating existing tables...');
      
      // Ottieni l'elenco delle tabelle
      const listTablesProcess = spawn('psql', [
        '-h', host,
        '-p', port,
        '-U', user,
        '-d', database,
        '-t', // Output in formato tabulare
        '-c', "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
      ], {
        env: { ...process.env, PGPASSWORD: password }
      });
      
      let tablesList = '';
      
      listTablesProcess.stdout.on('data', (data) => {
        tablesList += data.toString();
      });
      
      listTablesProcess.on('close', (code) => {
        if (code === 0) {
          // Estrai i nomi delle tabelle
          const tables = tablesList
            .split('\n')
            .map(table => table.trim())
            .filter(table => table);
          
          const truncateTables = () => {
            if (tables.length === 0) {
              console.log('No tables found, proceeding with initialization...');
              initializeDatabase();
              return;
            }
            
            console.log('Tables to truncate:', tables);
            
            // Crea un comando per svuotare tutte le tabelle
            const truncateCommand = `TRUNCATE TABLE ${tables.join(', ')} CASCADE;`;
            
            const truncateProcess = spawn('psql', [
              '-h', host,
              '-p', port,
              '-U', user,
              '-d', database,
              '-c', truncateCommand
            ], {
              env: { ...process.env, PGPASSWORD: password }
            });
            
            truncateProcess.on('close', (truncateCode) => {
              if (truncateCode === 0) {
                console.log('Tables truncated successfully');
                initializeDatabase();
              } else {
                console.error('Error truncating tables');
                return res.status(500).json({
                  error: 'Errore durante l\'inizializzazione dei dati di test',
                  details: 'Impossibile svuotare le tabelle'
                });
              }
            });
          };
          
          const initializeDatabase = () => {
            // Ora esegui il file di inizializzazione se necessario
            const checkTablesProcess = spawn('psql', [
              '-h', host,
              '-p', port,
              '-U', user,
              '-d', database,
              '-t',
              '-c', "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
            ], {
              env: { ...process.env, PGPASSWORD: password }
            });
            
            let tablesCount = '';
            
            checkTablesProcess.stdout.on('data', (data) => {
              tablesCount += data.toString();
            });
            
            checkTablesProcess.on('close', (checkCode) => {
              if (checkCode === 0) {
                const count = parseInt(tablesCount.trim(), 10);
                
                if (count === 0) {
                  // Non ci sono tabelle, esegui il file di inizializzazione
                  console.log('No tables found, executing init script...');
                  
                  const initProcess = spawn('psql', [
                    '-h', host,
                    '-p', port,
                    '-U', user,
                    '-d', database,
                    '-f', initDbFile
                  ], {
                    env: { ...process.env, PGPASSWORD: password }
                  });
                  
                  let initStderr = '';
                  
                  initProcess.stderr.on('data', (data) => {
                    initStderr += data.toString();
                    console.error(`psql init stderr: ${data}`);
                  });
                  
                  initProcess.on('close', (initCode) => {
                    if (initCode === 0) {
                      console.log('Database schema initialized successfully');
                      seedDatabase();
                    } else {
                      console.error(`psql init process exited with code ${initCode}`);
                      return res.status(500).json({
                        error: 'Errore durante l\'inizializzazione dei dati di test',
                        details: initStderr || `Init process exited with code ${initCode}`
                      });
                    }
                  });
                } else {
                  // Le tabelle esistono già, procedi con il seeding
                  console.log('Tables already exist, proceeding with seeding...');
                  seedDatabase();
                }
              } else {
                console.error('Error checking tables count');
                return res.status(500).json({
                  error: 'Errore durante l\'inizializzazione dei dati di test',
                  details: 'Impossibile verificare la presenza di tabelle'
                });
              }
            });
          };
          
          const seedDatabase = () => {
            // Esegui il file di seed
            console.log('Seeding database...');
            
            const seedProcess = spawn('psql', [
              '-h', host,
              '-p', port,
              '-U', user,
              '-d', database,
              '-f', seedDbFile
            ], {
              env: { ...process.env, PGPASSWORD: password }
            });
            
            let seedStderr = '';
            
            seedProcess.stderr.on('data', (data) => {
              seedStderr += data.toString();
              console.error(`psql seed stderr: ${data}`);
            });
            
            seedProcess.on('close', (seedCode) => {
              if (seedCode === 0) {
                console.log('Database seeded successfully');
                res.json({ message: 'Dati di test inizializzati con successo' });
              } else {
                console.error(`psql seed process exited with code ${seedCode}`);
                res.status(500).json({
                  error: 'Errore durante l\'inizializzazione dei dati di test',
                  details: seedStderr || `Seed process exited with code ${seedCode}`
                });
              }
            });
          };
          
          // Avvia il processo
          truncateTables();
        } else {
          console.error('Error listing tables');
          return res.status(500).json({
            error: 'Errore durante l\'inizializzazione dei dati di test',
            details: 'Impossibile ottenere l\'elenco delle tabelle'
          });
        }
      });
    } catch (err) {
      console.error('Error initializing test data:', err);
      res.status(500).json({ error: 'Errore durante l\'inizializzazione dei dati di test', details: err.message });
    }
  });

  return router;
}