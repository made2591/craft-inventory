import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Configura le rotte per la gestione dei fornitori
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function suppliersRoutes(pool, toCamelCase) {
  // GET /api/suppliers - Ottieni tutti i fornitori
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
      res.json(toCamelCase(result.rows));
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/suppliers/:id - Ottieni un fornitore specifico
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error fetching supplier:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/suppliers - Crea un nuovo fornitore
  router.post('/', async (req, res) => {
    try {
      const { name, contact_person, email, phone, address, notes } = req.body;
      const id = uuidv4();
      const now = new Date();

      const result = await pool.query(
        'INSERT INTO suppliers (id, name, contact_person, email, phone, address, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [id, name, contact_person, email, phone, address, notes, now, now]
      );

      res.status(201).json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error creating supplier:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/suppliers/:id - Aggiorna un fornitore esistente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contact_person, email, phone, address, notes } = req.body;
      const now = new Date();

      const result = await pool.query(
        'UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, notes = $6, updated_at = $7 WHERE id = $8 RETURNING *',
        [name, contact_person, email, phone, address, notes, now, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error updating supplier:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/suppliers/:id - Elimina un fornitore
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}