import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Configura le rotte per la gestione dei clienti
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function customersRoutes(pool, toCamelCase) {
  // GET /api/customers - Ottieni tutti i clienti
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM customers ORDER BY name');
      res.json(toCamelCase(result.rows));
    } catch (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/customers/:id - Ottieni un cliente specifico
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error fetching customer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/customers - Crea un nuovo cliente
  router.post('/', async (req, res) => {
    try {
      const { name, contact_person, customer_type, email, phone, address, notes } = req.body;
      const id = uuidv4();
      const now = new Date();
      
      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del cliente è obbligatorio' });
      }
      
      // Imposta un tipo cliente predefinito se non specificato
      const defaultCustomerType = customer_type || 'private';

      const result = await pool.query(
        'INSERT INTO customers (id, name, contact_person, customer_type, email, phone, address, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, name, contact_person, defaultCustomerType, email, phone, address, notes, now, now]
      );

      res.status(201).json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error creating customer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/customers/:id - Aggiorna un cliente esistente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contact_person, customer_type, email, phone, address, notes } = req.body;
      const now = new Date();

      const result = await pool.query(
        'UPDATE customers SET name = $1, contact_person = $2, customer_type = $3, email = $4, phone = $5, address = $6, notes = $7, updated_at = $8 WHERE id = $9 RETURNING *',
        [name, contact_person, customer_type, email, phone, address, notes, now, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error updating customer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/customers/:id - Elimina un cliente
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting customer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}