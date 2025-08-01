import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const router = express.Router();

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura multer per l'upload dei file
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite di 50MB
  fileFilter: (_, file, cb) => {
    // Accetta solo file .sql
    if (path.extname(file.originalname).toLowerCase() !== '.sql') {
      return cb(new Error('Solo i file SQL sono consentiti'));
    }
    cb(null, true);
  }
});

/**
 * Configura le rotte per la gestione del database
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function databaseRoutes(_, __) {
  // GET /api/database/export - Esporta il database come file SQL
  router.get('/export', async (req, res) => {
    try {
      // Controlla se l'utente vuole esportare solo i dati o lo schema completo
      const dataOnly = req.query.dataOnly === 'true';
      
      // Ottieni le credenziali del database dalla stringa di connessione
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;

      // Crea la directory per i backup se non esiste
      const backupDir = path.join(__dirname, '../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        // Assicurati che la directory abbia i permessi corretti
        fs.chmodSync(backupDir, 0o755);
      }

      // Genera un nome file univoco per il backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

      // Prepara le opzioni per pg_dump
      const pgDumpArgs = [
        '-h', host,
        '-p', port,
        '-U', user,
        '-d', database,
        '-f', backupFile,
        '--inserts'       // Usa INSERT invece di COPY per maggiore compatibilità
      ];
      
      // Aggiungi opzioni in base alla modalità di export
      if (dataOnly) {
        // Solo dati, senza schema
        pgDumpArgs.push('--data-only');
        console.log('Creating SQL dump file with data only...');
      } else {
        // Schema completo con dati
        pgDumpArgs.push(
          '--no-owner',     // Non includere i comandi per impostare il proprietario
          '--no-acl',       // Non includere i comandi per impostare i privilegi
          '--clean',        // Includi comandi DROP prima dei CREATE
          '--if-exists'     // Usa IF EXISTS nei comandi DROP
        );
        console.log('Creating complete SQL dump file with schema and data...');
      }
      
      // Utilizziamo spawn invece di exec per gestire meglio l'output
      const pgDumpProcess = spawn('pg_dump', pgDumpArgs, {
        env: { ...process.env, PGPASSWORD: password }
      });

      let stderr = '';

      pgDumpProcess.stdout.on('data', (data) => {
        console.log(`pg_dump stdout: ${data}`);
      });

      pgDumpProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`pg_dump stderr: ${data}`);
      });

      pgDumpProcess.on('error', (error) => {
        console.error('Error executing pg_dump:', error);
        return res.status(500).json({
          error: 'Errore durante l\'esportazione del database',
          details: error.message
        });
      });

      pgDumpProcess.on('close', (code) => {
        if (code === 0) {
          console.log('pg_dump completed successfully');
          console.log('Backup file created:', backupFile);
          
          // Verifica che il file esista e abbia dimensioni > 0
          if (!fs.existsSync(backupFile) || fs.statSync(backupFile).size === 0) {
            return res.status(500).json({
              error: 'Errore durante l\'esportazione del database',
              details: 'Il file di backup è vuoto o non è stato creato'
            });
          }
          
          console.log('File size:', fs.statSync(backupFile).size);
          
          // Aggiungi informazioni sul database al file
          const dbInfo = `-- Database: ${database}\n-- Host: ${host}\n-- Exported at: ${new Date().toISOString()}\n\n`;
          
          try {
            const fileContent = fs.readFileSync(backupFile, 'utf8');
            fs.writeFileSync(backupFile, dbInfo + fileContent);
          } catch (err) {
            console.error('Error adding metadata to backup file:', err);
          }

          // Invia il file al client
          res.download(backupFile, `craft-inventory-backup-${timestamp}.sql`, (err) => {
            if (err) {
              console.error('Error sending file:', err);
            }

            // Elimina il file temporaneo dopo l'invio
            fs.unlink(backupFile, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting temporary file:', unlinkErr);
              }
            });
          });
        } else {
          console.error(`pg_dump process exited with code ${code}`);
          return res.status(500).json({
            error: 'Errore durante l\'esportazione del database',
            details: stderr || `pg_dump process exited with code ${code}`
          });
        }
      });
    } catch (err) {
      console.error('Error in database export:', err);
      res.status(500).json({ error: 'Errore durante l\'esportazione del database', details: err.message });
    }
  });

  // POST /api/database/import - Importa un file SQL nel database
  router.post('/import', upload.single('sqlFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato' });
      }

      console.log('File uploaded:', req.file.path);
      console.log('File size:', fs.statSync(req.file.path).size);
      
      // Verifica che il file non sia vuoto
      if (fs.statSync(req.file.path).size === 0) {
        fs.unlink(req.file.path, () => { });
        return res.status(400).json({ error: 'Il file caricato è vuoto' });
      }
      
      // Controlla se l'utente vuole preservare lo schema esistente
      const preserveSchema = req.body.preserveSchema === 'true';

      // Ottieni le credenziali del database dalla stringa di connessione
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        // Elimina il file temporaneo in caso di errore
        fs.unlink(req.file.path, () => { });
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;
      
      // Funzione per procedere con l'importazione
      const proceedWithImport = () => {
        console.log('Proceeding with import...');
        
        // Importiamo il file SQL
        const psqlProcess = spawn('psql', [
          '-h', host,
          '-p', port,
          '-U', user,
          '-d', database,
          '-v', 'ON_ERROR_STOP=1', // Ferma l'esecuzione al primo errore
          '-f', req.file.path
        ], {
          env: { ...process.env, PGPASSWORD: password }
        });
      
        let stdout = '';
        let stderr = '';

        psqlProcess.stdout.on('data', (data) => {
          stdout += data.toString();
          console.log(`psql stdout: ${data}`);
        });

        psqlProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error(`psql stderr: ${data}`);
        });

        psqlProcess.on('error', (error) => {
          console.error('Error executing psql:', error);
          // Elimina il file temporaneo in caso di errore
          fs.unlink(req.file.path, () => { });
          return res.status(500).json({
            error: 'Errore durante l\'importazione del database',
            details: error.message
          });
        });

        psqlProcess.on('close', (code) => {
          // Elimina il file temporaneo
          fs.unlink(req.file.path, () => { });

          if (code === 0) {
            console.log('psql import completed successfully');
            
            // Esegui una query di verifica per assicurarsi che le tabelle siano state create
            const checkProcess = spawn('psql', [
              '-h', host,
              '-p', port,
              '-U', user,
              '-d', database,
              '-c', '\\dt'
            ], {
              env: { ...process.env, PGPASSWORD: password }
            });
            
            let checkOutput = '';
            
            checkProcess.stdout.on('data', (data) => {
              checkOutput += data.toString();
            });
            
            checkProcess.on('close', () => {
              console.log('Database tables after import:', checkOutput);
              res.json({ 
                message: 'Database importato con successo',
                tables: checkOutput
              });
            });
          } else {
            console.error(`psql process exited with code ${code}`);
            res.status(500).json({
              error: 'Errore durante l\'importazione del database',
              details: stderr || `Process exited with code ${code}`
            });
          }
        });
      };
      
      // Se preserveSchema è true, procedi direttamente con l'importazione
      // altrimenti, esegui prima il DROP SCHEMA
      if (preserveSchema) {
        // Se preserviamo lo schema, prima svuotiamo solo i dati dalle tabelle
        console.log('Preserving schema, truncating tables only...');
        
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
            
            if (tables.length === 0) {
              console.log('No tables found, proceeding with import...');
              proceedWithImport();
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
                proceedWithImport();
              } else {
                console.error('Error truncating tables');
                fs.unlink(req.file.path, () => { });
                return res.status(500).json({
                  error: 'Errore durante la preparazione del database',
                  details: 'Impossibile svuotare le tabelle'
                });
              }
            });
          } else {
            console.error('Error listing tables');
            fs.unlink(req.file.path, () => { });
            return res.status(500).json({
              error: 'Errore durante la preparazione del database',
              details: 'Impossibile ottenere l\'elenco delle tabelle'
            });
          }
        });
      } else {
        // Se non preserviamo lo schema, eseguiamo un DROP SCHEMA completo
        console.log('Dropping existing schema...');
        const dropProcess = spawn('psql', [
          '-h', host,
          '-p', port,
          '-U', user,
          '-d', database,
          '-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
        ], {
          env: { ...process.env, PGPASSWORD: password }
        });
        
        let dropStderr = '';
        
        dropProcess.stderr.on('data', (data) => {
          dropStderr += data.toString();
          console.error(`psql drop stderr: ${data}`);
        });
        
        dropProcess.on('error', (error) => {
          console.error('Error executing drop schema:', error);
          fs.unlink(req.file.path, () => { });
          return res.status(500).json({
            error: 'Errore durante la preparazione del database',
            details: error.message
          });
        });
        
        dropProcess.on('close', (dropCode) => {
          if (dropCode !== 0) {
            console.error(`psql drop process exited with code ${dropCode}`);
            fs.unlink(req.file.path, () => { });
            return res.status(500).json({
              error: 'Errore durante la preparazione del database',
              details: dropStderr || `Process exited with code ${dropCode}`
            });
          }
          
          console.log('Schema dropped successfully');
          proceedWithImport();
        });
      }
    } catch (err) {
      console.error('Error in database import:', err);
      // Elimina il file temporaneo in caso di errore
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => { });
      }
      res.status(500).json({ error: 'Errore durante l\'importazione del database', details: err.message });
    }
  });

  // POST /api/database/reset - Ripristina il database mantenendo gli schemi ma eliminando i dati
  router.post('/reset', async (req, res) => {
    try {
      // Ottieni le credenziali del database dalla stringa di connessione
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;

      console.log('Resetting database (keeping schema, removing data)...');
      
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
      
      let listTablesStderr = '';
      
      listTablesProcess.stderr.on('data', (data) => {
        listTablesStderr += data.toString();
        console.error(`psql list tables stderr: ${data}`);
      });
      
      listTablesProcess.on('error', (error) => {
        console.error('Error listing tables:', error);
        return res.status(500).json({
          error: 'Errore durante il reset del database',
          details: error.message
        });
      });
      
      listTablesProcess.on('close', (code) => {
        if (code === 0) {
          // Estrai i nomi delle tabelle
          const tables = tablesList
            .split('\n')
            .map(table => table.trim())
            .filter(table => table);
          
          if (tables.length === 0) {
            console.log('No tables found, nothing to reset');
            return res.json({ message: 'Nessuna tabella trovata, niente da resettare' });
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
          
          let truncateStderr = '';
          
          truncateProcess.stderr.on('data', (data) => {
            truncateStderr += data.toString();
            console.error(`psql truncate stderr: ${data}`);
          });
          
          truncateProcess.on('error', (error) => {
            console.error('Error truncating tables:', error);
            return res.status(500).json({
              error: 'Errore durante il reset del database',
              details: error.message
            });
          });
          
          truncateProcess.on('close', (truncateCode) => {
            if (truncateCode === 0) {
              console.log('Tables truncated successfully');
              res.json({ message: 'Database resettato con successo (dati eliminati, schema mantenuto)' });
            } else {
              console.error(`psql truncate process exited with code ${truncateCode}`);
              res.status(500).json({
                error: 'Errore durante il reset del database',
                details: truncateStderr || `Process exited with code ${truncateCode}`
              });
            }
          });
        } else {
          console.error(`psql list tables process exited with code ${code}`);
          res.status(500).json({
            error: 'Errore durante il reset del database',
            details: listTablesStderr || `Process exited with code ${code}`
          });
        }
      });
    } catch (err) {
      console.error('Error in database reset:', err);
      res.status(500).json({ error: 'Errore durante il reset del database', details: err.message });
    }
  });
  
  // POST /api/test-data/init - Inizializza il database con dati di test
  router.post('/test-data/init', async (req, res) => {
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

  // GET /api/database/schema - Ottieni lo schema della tabella inventory_items
  router.get('/schema', async (req, res) => {
    try {
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;

      const psqlProcess = spawn('psql', [
        '-h', host,
        '-p', port,
        '-U', user,
        '-d', database,
        '-c', '\\d inventory_items'
      ], {
        env: { ...process.env, PGPASSWORD: password }
      });

      let stdout = '';
      let stderr = '';

      psqlProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      psqlProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      psqlProcess.on('close', (code) => {
        if (code === 0) {
          res.json({ schema: stdout });
        } else {
          res.status(500).json({ error: 'Errore durante il recupero dello schema', details: stderr });
        }
      });
    } catch (err) {
      console.error('Error fetching schema:', err);
      res.status(500).json({ error: 'Errore interno del server' });
    }
  });

  return router;
}