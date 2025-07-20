import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Configura le rotte per la gestione dell'inventario
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function inventoryRoutes(pool, toCamelCase) {
  // GET /api/inventory - Ottieni tutti gli articoli in inventario
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT i.*, p.name as model_name FROM inventory_items i JOIN product_models p ON i.model_id = p.id ORDER BY i.created_at DESC'
      );
      res.json(toCamelCase(result.rows));
    } catch (err) {
      console.error('Error fetching inventory:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/inventory/:id - Ottieni un articolo specifico dell'inventario
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT i.*, p.name as model_name FROM inventory_items i JOIN product_models p ON i.model_id = p.id WHERE i.id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error fetching inventory item:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inventory - Crea un nuovo articolo in inventario
  router.post('/', async (req, res) => {
    try {
      const { model_id, quantity, production_date, notes } = req.body;
      
      // Validate required fields
      if (!model_id) {
        return res.status(400).json({ error: 'Il modello è obbligatorio' });
      }
      
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'La quantità deve essere maggiore di zero' });
      }
      
      const id = uuidv4();
      const now = new Date();

      const result = await pool.query(
        'INSERT INTO inventory_items (id, model_id, quantity, production_date, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, model_id, quantity, production_date, notes, now, now]
      );

      res.status(201).json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error creating inventory item:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/inventory/:id - Aggiorna un articolo esistente dell'inventario
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, notes } = req.body;
      const now = new Date();

      const result = await pool.query(
        'UPDATE inventory_items SET quantity = $1, notes = $2, updated_at = $3 WHERE id = $4 RETURNING *',
        [quantity, notes, now, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error updating inventory item:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/inventory/:id - Elimina un articolo dell'inventario
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}