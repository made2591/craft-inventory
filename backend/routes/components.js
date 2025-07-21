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
 * Configura le rotte per la gestione dei componenti
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function componentsRoutes(pool, toCamelCase) {
  // GET /api/components - Ottieni tutti i componenti
  router.get('/', async (_, res) => {
    try {
      const result = await pool.query('SELECT * FROM components ORDER BY name');
      res.json(toCamelCase(result.rows));
    } catch (err) {
      console.error('Error fetching components:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/components/:id - Ottieni un componente specifico con i suoi materiali
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const componentResult = await pool.query('SELECT * FROM components WHERE id = $1', [id]);

      if (componentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Component not found' });
      }

      const materialsResult = await pool.query(
        `SELECT cm.*, m.name as material_name, m.unit_of_measure, m.cost_per_unit as material_cost_per_unit
         FROM component_materials cm 
         JOIN materials m ON cm.material_id = m.id 
         WHERE cm.component_id = $1`,
        [id]
      );

      const response = {
        component: toCamelCase(componentResult.rows[0]),
        materials: toCamelCase(materialsResult.rows)
      };

      res.json(response);
    } catch (err) {
      console.error('Error fetching component:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/components - Crea un nuovo componente
  router.post('/', async (req, res) => {
    try {
      const { name, description, materials } = req.body;

      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del componente è obbligatorio' });
      }

      const id = uuidv4();
      const now = new Date();

      // Start a transaction
      await pool.query('BEGIN');

      // Genera uno SKU univoco
      let sku = generateSKU();
      let isUnique = false;
      
      // Verifica che lo SKU sia univoco
      while (!isUnique) {
        const skuCheck = await pool.query('SELECT id FROM components WHERE sku = $1', [sku]);
        if (skuCheck.rows.length === 0) {
          isUnique = true;
        } else {
          sku = generateSKU(); // Genera un nuovo SKU se quello attuale esiste già
        }
      }
      
      // Insert the component with SKU
      const componentResult = await pool.query(
        'INSERT INTO components (id, name, description, sku, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id, name, description, sku, now, now]
      );

      // Insert the materials for this component
      if (materials && materials.length > 0) {
        for (const material of materials) {
          const materialId = uuidv4(); // Generate a unique ID for each component_material relationship
          // Supporta sia materialId (camelCase) che material_id (snake_case)
          const materialIdValue = material.materialId || material.material_id;
          
          if (!materialIdValue) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Material ID is required for each material' });
          }
          
          const useMaterialCost = material.useMaterialCost !== undefined ? material.useMaterialCost : (material.use_material_cost !== false);
          const customCost = useMaterialCost ? null : (material.customCost || material.custom_cost);
          
          await pool.query(
            'INSERT INTO component_materials (id, component_id, material_id, quantity, custom_cost, use_material_cost, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [materialId, id, materialIdValue, material.quantity, customCost, useMaterialCost, now, now]
          );
        }
      }

      await pool.query('COMMIT');

      res.status(201).json(toCamelCase(componentResult.rows[0]));
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error creating component:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/components/:id - Aggiorna un componente esistente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, materials } = req.body;
      const now = new Date();

      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del componente è obbligatorio' });
      }

      // Start a transaction
      await pool.query('BEGIN');

      // Update the component
      const componentResult = await pool.query(
        'UPDATE components SET name = $1, description = $2, updated_at = $3 WHERE id = $4 RETURNING *',
        [name, description, now, id]
      );

      if (componentResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Component not found' });
      }

      // If materials are provided, update them
      if (materials) {
        // Delete existing component_materials
        await pool.query('DELETE FROM component_materials WHERE component_id = $1', [id]);

        // Insert new component_materials
        for (const material of materials) {
          const materialId = uuidv4();
          // Supporta sia materialId (camelCase) che material_id (snake_case)
          const materialIdValue = material.materialId || material.material_id;
          
          if (!materialIdValue) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Material ID is required for each material' });
          }
          
          const useMaterialCost = material.useMaterialCost !== undefined ? material.useMaterialCost : (material.use_material_cost !== false);
          const customCost = useMaterialCost ? null : (material.customCost || material.custom_cost);
          
          await pool.query(
            'INSERT INTO component_materials (id, component_id, material_id, quantity, custom_cost, use_material_cost, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [materialId, id, materialIdValue, material.quantity, customCost, useMaterialCost, now, now]
          );
        }
      }

      await pool.query('COMMIT');

      res.json(toCamelCase(componentResult.rows[0]));
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error updating component:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/components/:id - Elimina un componente
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Start a transaction
      await pool.query('BEGIN');

      // Check if the component is used in any model
      const modelComponentsResult = await pool.query(
        'SELECT * FROM model_components WHERE component_id = $1 LIMIT 1',
        [id]
      );

      if (modelComponentsResult.rows.length > 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Impossibile eliminare il componente perché è utilizzato in uno o più modelli' 
        });
      }

      // Delete related component_materials
      await pool.query('DELETE FROM component_materials WHERE component_id = $1', [id]);

      // Delete the component
      const result = await pool.query('DELETE FROM components WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Component not found' });
      }

      await pool.query('COMMIT');

      res.status(204).send();
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error deleting component:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/components/:id/cost - Calcola il costo totale di un componente
  router.get('/:id/cost', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verifica che il componente esista
      const componentResult = await pool.query('SELECT * FROM components WHERE id = $1', [id]);

      if (componentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Component not found' });
      }

      // Calcola il costo totale del componente
      const costResult = await pool.query(`
        SELECT 
          cm.material_id,
          m.name as material_name,
          cm.quantity,
          m.cost_per_unit as material_cost_per_unit,
          cm.custom_cost,
          cm.use_material_cost,
          CASE 
            WHEN cm.use_material_cost THEN cm.quantity * m.cost_per_unit
            ELSE cm.quantity * cm.custom_cost
          END as total_cost
        FROM component_materials cm
        JOIN materials m ON cm.material_id = m.id
        WHERE cm.component_id = $1
      `, [id]);

      // Calcola il costo totale sommando i costi di tutti i materiali
      const totalCost = costResult.rows.reduce((sum, item) => sum + parseFloat(item.total_cost), 0);

      res.json({
        componentId: id,
        componentName: componentResult.rows[0].name,
        materials: toCamelCase(costResult.rows),
        totalCost
      });
    } catch (err) {
      console.error('Error calculating component cost:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}