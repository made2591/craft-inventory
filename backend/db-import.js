#!/usr/bin/env node

/**
 * Script per importare un file SQL nel database
 * Uso: node db-import.js [nome_file_input]
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Carica le variabili d'ambiente
dotenv.config();

// Ottieni il percorso corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verifica se è stato fornito un nome di file
if (process.argv.length < 3) {
  console.error('Errore: Specificare il nome del file di backup da importare');
  console.error('Uso: node db-import.js [nome_file_input]');
  process.exit(1);
}

// Ottieni il nome del file di input
const inputFileName = process.argv[2];
const backupsDir = path.join(__dirname, 'backups');
const inputFilePath = path.join(backupsDir, inputFileName);

// Verifica se il file esiste
if (!fs.existsSync(inputFilePath)) {
  console.error(`Errore: Il file ${inputFilePath} non esiste`);
  
  // Elenca i file di backup disponibili
  console.log('\nBackup disponibili:');
  if (fs.existsSync(backupsDir)) {
    const files = fs.readdirSync(backupsDir).filter(file => file.endsWith('.sql'));
    if (files.length === 0) {
      console.log('Nessun file di backup trovato nella directory backups/');
    } else {
      files.forEach(file => console.log(`- ${file}`));
    }
  } else {
    console.log('La directory backups/ non esiste');
  }
  
  process.exit(1);
}

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

// Crea un'interfaccia readline per chiedere conferma
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`ATTENZIONE: Stai per sovrascrivere il database ${dbConfig.database}. Tutti i dati esistenti saranno persi. Continuare? (s/N) `, (answer) => {
  if (answer.toLowerCase() !== 's') {
    console.log('Operazione annullata.');
    rl.close();
    return;
  }
  
  console.log(`Importazione del file ${inputFilePath} nel database ${dbConfig.database} in corso...`);
  
  // Esegui psql per importare il file SQL
  const psql = spawn('psql', [
    '-h', dbConfig.host,
    '-p', dbConfig.port,
    '-U', dbConfig.user,
    '-d', dbConfig.database,
    '-f', inputFilePath
  ]);
  
  // Imposta la password per psql
  psql.env = { ...process.env, PGPASSWORD: dbConfig.password };
  
  psql.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  psql.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  
  psql.on('close', (code) => {
    if (code === 0) {
      console.log(`Importazione completata con successo!`);
    } else {
      console.error(`Importazione fallita con codice di uscita ${code}`);
      console.log('\nSuggerimenti per la risoluzione dei problemi:');
      console.log('1. Assicurati che PostgreSQL sia in esecuzione e accessibile');
      console.log('2. Verifica che le credenziali del database siano corrette');
      console.log('3. Controlla che il file di backup non sia danneggiato');
      console.log('4. Prova a eseguire manualmente il comando:');
      console.log(`   PGPASSWORD=${dbConfig.password} psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f ${inputFilePath}`);
    }
    
    rl.close();
  });
});