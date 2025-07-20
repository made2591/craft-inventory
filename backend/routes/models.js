import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Configura le rotte per la gestione dei modelli di prodotto
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function modelsRoutes(pool, toCamelCase) {
  // GET /api/models - Ottieni tutti i modelli
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM product_models ORDER BY name');
      res.json(toCamelCase(result.rows));
    } catch (err) {
      console.error('Error fetching models:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/models/:id - Ottieni un modello specifico con i suoi materiali
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const modelResult = await pool.query('SELECT * FROM product_models WHERE id = $1', [id]);

      if (modelResult.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const materialsResult = await pool.query(
        'SELECT mm.*, m.name as material_name, m.unit_of_measure FROM model_materials mm JOIN materials m ON mm.material_id = m.id WHERE mm.model_id = $1',
        [id]
      );

      const response = {
        model: toCamelCase(modelResult.rows[0]),
        materials: toCamelCase(materialsResult.rows)
      };

      res.json(response);
    } catch (err) {
      console.error('Error fetching model:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/models - Crea un nuovo modello
  router.post('/', async (req, res) => {
    try {
      const { name, description, sellingPrice, laborTimeMinutes, materials } = req.body;

      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del modello è obbligatorio' });
      }

      // Imposta valori predefiniti per i campi obbligatori
      const defaultSellingPrice = sellingPrice !== undefined ? sellingPrice : 0;
      const defaultLaborTimeMinutes = laborTimeMinutes !== undefined ? laborTimeMinutes : 0;

      // Calcola il costo di produzione in base ai materiali o imposta un valore predefinito
      let productionCost = 0;
      if (materials && materials.length > 0) {
        // Qui dovremmo calcolare il costo di produzione in base ai materiali,
        // ma per semplicità impostiamo un valore predefinito
        productionCost = 0;
      }

      const id = uuidv4();
      const now = new Date();

      // Start a transaction
      await pool.query('BEGIN');

      // Insert the model
      const modelResult = await pool.query(
        'INSERT INTO product_models (id, name, description, production_cost, selling_price, labor_time_minutes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id, name, description, productionCost, defaultSellingPrice, defaultLaborTimeMinutes, now, now]
      );

      // Insert the materials for this model
      if (materials && materials.length > 0) {
        for (const material of materials) {
          const materialId = uuidv4(); // Generate a unique ID for each model_material relationship
          await pool.query(
            'INSERT INTO model_materials (id, model_id, material_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [materialId, id, material.material_id, material.quantity, now, now]
          );
        }
      }

      await pool.query('COMMIT');

      res.status(201).json(toCamelCase(modelResult.rows[0]));
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error creating model:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/models/:id - Aggiorna un modello esistente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, sellingPrice, laborTimeMinutes } = req.body;
      const now = new Date();

      const result = await pool.query(
        'UPDATE product_models SET name = $1, description = $2, selling_price = $3, labor_time_minutes = $4, updated_at = $5 WHERE id = $6 RETURNING *',
        [name, description, sellingPrice, laborTimeMinutes, now, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error updating model:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/models/:id - Elimina un modello
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Start a transaction
      await pool.query('BEGIN');

      // Delete related model materials
      await pool.query('DELETE FROM model_materials WHERE model_id = $1', [id]);

      // Delete the model
      const result = await pool.query('DELETE FROM product_models WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Model not found' });
      }

      await pool.query('COMMIT');

      res.status(204).send();
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error deleting model:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}