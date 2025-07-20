import materialsRoutes from './materials.js';
import modelsRoutes from './models.js';
import inventoryRoutes from './inventory.js';
import suppliersRoutes from './suppliers.js';
import customersRoutes from './customers.js';
import transactionsRoutes from './transactions.js';
import authRoutes from './auth.js';
import databaseRoutes from './database.js';

/**
 * Configura tutti i router per l'applicazione
 * @param {Object} app - Express app
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 */
export default function setupRoutes(app, pool, toCamelCase) {
  // Rotta di health check
  app.get('/health', (_, res) => {
    res.json({ status: 'OK' });
  });

  // Configura i router per ciascuna risorsa
  app.use('/api/materials', materialsRoutes(pool, toCamelCase));
  app.use('/api/models', modelsRoutes(pool, toCamelCase));
  app.use('/api/inventory', inventoryRoutes(pool, toCamelCase));
  app.use('/api/suppliers', suppliersRoutes(pool, toCamelCase));
  app.use('/api/customers', customersRoutes(pool, toCamelCase));
  app.use('/api/transactions', transactionsRoutes(pool, toCamelCase));
  app.use('/api/auth', authRoutes(pool, toCamelCase));
  app.use('/api/database', databaseRoutes(pool, toCamelCase));
}