import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Genera un codice SKU alfanumerico di 8 caratteri
 * @returns {string} SKU generato
 */
function generateSKU() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = '';
  for (let i = 0; i < 8; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
}

/**
 * Configura le rotte per la gestione dei materiali
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function materialsRoutes(pool, toCamelCase) {
  // GET /api/materials - Ottieni tutti i materiali
  router.get('/', async (req, res) => {
    try {
      const { supplierId } = req.query;
      
      let query = 'SELECT * FROM materials';
      const params = [];
      
      if (supplierId) {
        query += ' WHERE supplier_id = $1';
        params.push(supplierId);
      }
      
      query += ' ORDER BY name';
      
      const result = await pool.query(query, params);
      res.json(toCamelCase(result.rows));
    } catch (err) {
      console.error('Error fetching materials:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/materials/:id - Ottieni un materiale specifico
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM materials WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error fetching material:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/materials - Crea un nuovo materiale
  router.post('/', async (req, res) => {
    try {
      const { 
        name, 
        description, 
        unitOfMeasure, 
        costPerUnit, 
        currentStock, 
        minStockLevel, 
        supplierId,
        link
      } = req.body;
      
      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del materiale è obbligatorio' });
      }
      
      // Imposta valori predefiniti per i campi obbligatori se non sono presenti
      const defaultUnitOfMeasure = unitOfMeasure || 'pz'; // pezzi come unità di misura predefinita
      const defaultCostPerUnit = costPerUnit !== undefined ? costPerUnit : 0;
      const defaultCurrentStock = currentStock !== undefined ? currentStock : 0;
      const defaultMinStockLevel = minStockLevel !== undefined ? minStockLevel : 0;
      
      const id = uuidv4();
      const now = new Date();
      
      // Genera uno SKU univoco
      let sku = generateSKU();
      let isUnique = false;
      
      // Verifica che lo SKU sia univoco
      while (!isUnique) {
        const skuCheck = await pool.query('SELECT id FROM materials WHERE sku = $1', [sku]);
        if (skuCheck.rows.length === 0) {
          isUnique = true;
        } else {
          sku = generateSKU(); // Genera un nuovo SKU se quello attuale esiste già
        }
      }
      
      const result = await pool.query(
        'INSERT INTO materials (id, name, description, sku, unit_of_measure, cost_per_unit, current_stock, min_stock_level, supplier_id, link, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [id, name, description, sku, defaultUnitOfMeasure, defaultCostPerUnit, defaultCurrentStock, defaultMinStockLevel, supplierId, link, now, now]
      );
      
      res.status(201).json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error creating material:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/materials/:id - Aggiorna un materiale esistente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, unitOfMeasure, costPerUnit, currentStock, minStockLevel, supplierId, link } = req.body;
      const now = new Date();

      const result = await pool.query(
        'UPDATE materials SET name = $1, description = $2, unit_of_measure = $3, cost_per_unit = $4, current_stock = $5, min_stock_level = $6, supplier_id = $7, link = $8, updated_at = $9 WHERE id = $10 RETURNING *',
        [name, description, unitOfMeasure, costPerUnit, currentStock, minStockLevel, supplierId, link, now, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }

      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      console.error('Error updating material:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/materials/:id - Elimina un materiale
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM materials WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting material:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}