// Importazione dei moduli
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Pool } from 'pg';
import setupRoutes from './routes/index.js';

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

// Test database connection in una funzione asincrona autoeseguita
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
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