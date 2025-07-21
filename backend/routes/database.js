import express from 'express';
import { exec, spawn } from 'child_process';
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
  router.get('/export', async (_, res) => {
    try {
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
        fs.chmodSync(backupDir, 0o777);
      }

      // Genera un nome file univoco per il backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

      // Crea un file SQL con istruzioni CREATE e INSERT utilizzando pg_dump
      console.log('Creating SQL dump file...');
      console.log('Using pg_dump version:');
      exec('pg_dump --version', (_, stdout) => {
        console.log(stdout);
      });

      // Utilizziamo spawn invece di exec per gestire meglio l'output
      const pgDumpProcess = spawn('pg_dump', [
        '-h', host,
        '-p', port,
        '-U', user,
        '-d', database,
        '-f', backupFile,
        '--create',
        '--clean',
        '--if-exists',
        '--inserts'
      ], {
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
          console.log('File size:', fs.statSync(backupFile).size);

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

      // Ottieni le credenziali del database dalla stringa di connessione
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        // Elimina il file temporaneo in caso di errore
        fs.unlink(req.file.path, () => { });
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;

      // Utilizziamo spawn invece di exec per gestire meglio l'output
      const psqlProcess = spawn('psql', [
        '-h', host,
        '-p', port,
        '-U', user,
        '-d', database,
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
          res.json({ message: 'Database importato con successo' });
        } else {
          console.error(`psql process exited with code ${code}`);
          res.status(500).json({
            error: 'Errore durante l\'importazione del database',
            details: stderr || `Process exited with code ${code}`
          });
        }
      });
    } catch (err) {
      console.error('Error in database import:', err);
      // Elimina il file temporaneo in caso di errore
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => { });
      }
      res.status(500).json({ error: 'Errore durante l\'importazione del database', details: err.message });
    }
  });

  // POST /api/database/reset - Ripristina il database allo stato iniziale
  router.post('/reset', async (_, res) => {
    try {
      // Ottieni le credenziali del database dalla stringa di connessione
      const connectionString = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
      const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

      if (!match) {
        return res.status(500).json({ error: 'Impossibile analizzare la stringa di connessione del database' });
      }

      const [, user, password, host, port, database] = match;

      // Percorso del file di inizializzazione del database
      const initDbFile = path.join(__dirname, '../init-db/01-init.sql');

      // Verifica che il file di inizializzazione esista
      if (!fs.existsSync(initDbFile)) {
        return res.status(500).json({ error: 'File di inizializzazione del database non trovato' });
      }

      console.log('Init DB file found:', initDbFile);
      console.log('File size:', fs.statSync(initDbFile).size);

      // Utilizziamo spawn invece di exec per gestire meglio l'output
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
        return res.status(500).json({
          error: 'Errore durante il reset del database (drop schema)',
          details: error.message
        });
      });

      dropProcess.on('close', (dropCode) => {
        if (dropCode === 0) {
          console.log('Schema dropped successfully');

          // Ora esegui il file di inizializzazione
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

          initProcess.on('error', (error) => {
            console.error('Error executing init script:', error);
            return res.status(500).json({
              error: 'Errore durante il reset del database (init)',
              details: error.message
            });
          });

          initProcess.on('close', (initCode) => {
            if (initCode === 0) {
              console.log('Database initialized successfully');
              res.json({ message: 'Database ripristinato con successo' });
            } else {
              console.error(`psql init process exited with code ${initCode}`);
              res.status(500).json({
                error: 'Errore durante il reset del database (init)',
                details: initStderr || `Process exited with code ${initCode}`
              });
            }
          });
        } else {
          console.error(`psql drop process exited with code ${dropCode}`);
          res.status(500).json({
            error: 'Errore durante il reset del database (drop schema)',
            details: dropStderr || `Process exited with code ${dropCode}`
          });
        }
      });
    } catch (err) {
      console.error('Error in database reset:', err);
      res.status(500).json({ error: 'Errore durante il reset del database', details: err.message });
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