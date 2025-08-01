#!/usr/bin/env node

/**
 * Script per esportare il database in un file SQL
 * Uso: node db-export.js [nome_file_output]
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Carica le variabili d'ambiente
dotenv.config();

// Ottieni il percorso corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crea la directory backups se non esiste
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Ottieni il nome del file di output o usa un nome predefinito con timestamp
const outputFileName = process.argv[2] || `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
const outputFilePath = path.join(backupsDir, outputFileName);

// Estrai le informazioni di connessione dall'URL del database
const parseDbUrl = (url) => {
  try {
    const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = url.match(regex);
    if (!match) throw new Error('Invalid database URL format');
    
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5]
    };
  } catch (error) {
    console.error('Error parsing database URL:', error.message);
    process.exit(1);
  }
};

// Ottieni le informazioni di connessione
const dbUrl = process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb';
const dbConfig = parseDbUrl(dbUrl);

console.log(`Esportazione del database ${dbConfig.database} in corso...`);

// Esegui pg_dump per esportare il database
const pgDump = spawn('pg_dump', [
  '-h', dbConfig.host,
  '-p', dbConfig.port,
  '-U', dbConfig.user,
  '-d', dbConfig.database,
  '-F', 'p', // Formato plain text SQL
  '-f', outputFilePath,
  '--no-owner', // Non includere i comandi per impostare il proprietario
  '--no-acl',   // Non includere i comandi per impostare i privilegi
  '--clean',    // Includi comandi DROP prima dei CREATE
  '--if-exists' // Usa IF EXISTS nei comandi DROP
]);

// Imposta la password per pg_dump
pgDump.env = { ...process.env, PGPASSWORD: dbConfig.password };

pgDump.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pgDump.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pgDump.on('close', (code) => {
  if (code === 0) {
    console.log(`Esportazione completata con successo! File salvato in: ${outputFilePath}`);
    
    // Aggiungi informazioni sul database al file
    const dbInfo = `-- Database: ${dbConfig.database}\n-- Host: ${dbConfig.host}\n-- Exported at: ${new Date().toISOString()}\n\n`;
    
    try {
      const fileContent = fs.readFileSync(outputFilePath, 'utf8');
      fs.writeFileSync(outputFilePath, dbInfo + fileContent);
      
      console.log('Informazioni sul database aggiunte al file di backup.');
      console.log(`\nPer importare questo backup, esegui: node db-import.js ${outputFileName}`);
    } catch (err) {
      console.error('Errore durante l'aggiunta delle informazioni al file:', err);
    }
  } else {
    console.error(`Esportazione fallita con codice di uscita ${code}`);
  }
});