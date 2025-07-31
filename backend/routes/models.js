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
 * Configura le rotte per la gestione dei modelli di prodotto
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function modelsRoutes(pool, toCamelCase) {
  // GET /api/models - Ottieni tutti i modelli
  router.get('/', async (_, res) => {
    try {
      const result = await pool.query('SELECT * FROM product_models ORDER BY name');
      
      // Converti i dati in camelCase
      const models = toCamelCase(result.rows);
      
      // Assicurati che i campi numerici siano effettivamente numeri
      models.forEach(model => {
        // Converti esplicitamente in numeri usando Number() per assicurarsi che siano numeri JavaScript
        model.productionCost = Number(model.productionCost);
        model.sellingPrice = Number(model.sellingPrice);
        model.laborTimeMinutes = Number(model.laborTimeMinutes);
        
        // Assicurati che i campi non siano NaN
        if (isNaN(model.productionCost)) model.productionCost = 0;
        if (isNaN(model.sellingPrice)) model.sellingPrice = 0;
        if (isNaN(model.laborTimeMinutes)) model.laborTimeMinutes = 0;
      });
      
      res.json(models);
    } catch (err) {
      console.error('Error fetching models:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/models/:id - Ottieni un modello specifico con i suoi componenti
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const modelResult = await pool.query('SELECT * FROM product_models WHERE id = $1', [id]);

      if (modelResult.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }

      // Ottieni i componenti del modello
      const componentsResult = await pool.query(
        `SELECT mc.*, c.name as component_name, c.sku as component_sku
         FROM model_components mc 
         JOIN components c ON mc.component_id = c.id 
         WHERE mc.model_id = $1`,
        [id]
      );

      // Ottieni anche i materiali diretti del modello (per retrocompatibilità)
      const materialsResult = await pool.query(
        `SELECT mm.*, m.name as material_name, m.unit_of_measure 
         FROM model_materials mm 
         JOIN materials m ON mm.material_id = m.id 
         WHERE mm.model_id = $1`,
        [id]
      );

      const response = {
        model: toCamelCase(modelResult.rows[0]),
        components: toCamelCase(componentsResult.rows),
        materials: toCamelCase(materialsResult.rows) // Per retrocompatibilità
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
      const { name, description, sellingPrice, laborTimeMinutes, components, materials } = req.body;

      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del modello è obbligatorio' });
      }

      // Imposta valori predefiniti per i campi obbligatori
      const defaultSellingPrice = sellingPrice !== undefined ? sellingPrice : 0;
      const defaultLaborTimeMinutes = laborTimeMinutes !== undefined ? laborTimeMinutes : 0;

      // Calcola il costo di produzione in base ai componenti e materiali
      let productionCost = 0;

      // Start a transaction
      await pool.query('BEGIN');

      // Calcola il costo dei componenti
      if (components && components.length > 0) {
        for (const component of components) {
          // Ottieni il costo del componente
          const componentCostResult = await pool.query(`
            SELECT 
              CASE 
                WHEN cm.use_material_cost THEN cm.quantity * m.cost_per_unit
                ELSE cm.quantity * cm.custom_cost
              END as cost
            FROM component_materials cm
            JOIN materials m ON cm.material_id = m.id
            WHERE cm.component_id = $1
          `, [component.componentId]);

          // Somma il costo di tutti i materiali del componente
          const componentCost = componentCostResult.rows.reduce((sum, item) => sum + parseFloat(item.cost), 0);
          
          // Moltiplica per la quantità del componente nel modello
          productionCost += componentCost * component.quantity;
        }
      }

      // Calcola il costo dei materiali diretti (per retrocompatibilità)
      if (materials && materials.length > 0) {
        for (const material of materials) {
          // Ottieni il costo del materiale
          const materialCostResult = await pool.query(
            'SELECT cost_per_unit FROM materials WHERE id = $1',
            [material.material_id]
          );

          if (materialCostResult.rows.length > 0) {
            const materialCost = parseFloat(materialCostResult.rows[0].cost_per_unit);
            productionCost += materialCost * material.quantity;
          }
        }
      }

      const id = uuidv4();
      const now = new Date();
      
      // Genera uno SKU univoco
      let sku = generateSKU();
      let isUnique = false;
      
      // Verifica che lo SKU sia univoco
      while (!isUnique) {
        const skuCheck = await pool.query('SELECT id FROM product_models WHERE sku = $1', [sku]);
        if (skuCheck.rows.length === 0) {
          isUnique = true;
        } else {
          sku = generateSKU(); // Genera un nuovo SKU se quello attuale esiste già
        }
      }

      // Insert the model with SKU
      const modelResult = await pool.query(
        'INSERT INTO product_models (id, name, description, sku, production_cost, selling_price, labor_time_minutes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [id, name, description, sku, productionCost, defaultSellingPrice, defaultLaborTimeMinutes, now, now]
      );

      // Insert the components for this model
      if (components && components.length > 0) {
        for (const component of components) {
          const componentId = uuidv4(); // Generate a unique ID for each model_component relationship
          // Supporta sia componentId (camelCase) che componentId (snake_case)
          const componentIdValue = component.componentId;
          
          if (!componentIdValue) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Component ID is required for each component' });
          }
          
          await pool.query(
            'INSERT INTO model_components (id, model_id, component_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [componentId, id, componentIdValue, component.quantity, now, now]
          );
        }
      }

      // Insert the materials for this model (per retrocompatibilità)
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
      const { name, description, sellingPrice, laborTimeMinutes, components, materials } = req.body;

      // Validazione dei campi obbligatori
      if (!name) {
        return res.status(400).json({ error: 'Il nome del modello è obbligatorio' });
      }

      // Calcola il costo di produzione in base ai componenti e materiali
      let productionCost = 0;

      // Start a transaction
      await pool.query('BEGIN');

      // Calcola il costo dei componenti
      if (components && components.length > 0) {
        for (const component of components) {
          // Ottieni il costo del componente
          const componentCostResult = await pool.query(`
            SELECT 
              CASE 
                WHEN cm.use_material_cost THEN cm.quantity * m.cost_per_unit
                ELSE cm.quantity * cm.custom_cost
              END as cost
            FROM component_materials cm
            JOIN materials m ON cm.material_id = m.id
            WHERE cm.component_id = $1
          `, [component.componentId]);

          // Somma il costo di tutti i materiali del componente
          const componentCost = componentCostResult.rows.reduce((sum, item) => sum + parseFloat(item.cost), 0);
          
          // Moltiplica per la quantità del componente nel modello
          productionCost += componentCost * component.quantity;
        }
      }

      // Calcola il costo dei materiali diretti (per retrocompatibilità)
      if (materials && materials.length > 0) {
        for (const material of materials) {
          // Ottieni il costo del materiale
          const materialCostResult = await pool.query(
            'SELECT cost_per_unit FROM materials WHERE id = $1',
            [material.material_id]
          );

          if (materialCostResult.rows.length > 0) {
            const materialCost = parseFloat(materialCostResult.rows[0].cost_per_unit);
            productionCost += materialCost * material.quantity;
          }
        }
      }

      const now = new Date();

      // Update the model
      const modelResult = await pool.query(
        'UPDATE product_models SET name = $1, description = $2, production_cost = $3, selling_price = $4, labor_time_minutes = $5, updated_at = $6 WHERE id = $7 RETURNING *',
        [name, description, productionCost, sellingPrice, laborTimeMinutes, now, id]
      );

      if (modelResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Model not found' });
      }

      // Update components if provided
      if (components !== undefined) {
        // Delete existing model_components
        await pool.query('DELETE FROM model_components WHERE model_id = $1', [id]);

        // Insert new model_components
        if (components && components.length > 0) {
          for (const component of components) {
            const componentId = uuidv4();
            // Supporta sia componentId (camelCase) che component_id (snake_case)
            const componentIdValue = component.componentId;
            
            if (!componentIdValue) {
              await pool.query('ROLLBACK');
              return res.status(400).json({ error: 'Component ID is required for each component' });
            }
            
            await pool.query(
              'INSERT INTO model_components (id, model_id, component_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
              [componentId, id, componentIdValue, component.quantity, now, now]
            );
          }
        }
      }

      // Update materials if provided (per retrocompatibilità)
      if (materials !== undefined) {
        // Delete existing model_materials
        await pool.query('DELETE FROM model_materials WHERE model_id = $1', [id]);

        // Insert new model_materials
        if (materials && materials.length > 0) {
          for (const material of materials) {
            const materialId = uuidv4();
            await pool.query(
              'INSERT INTO model_materials (id, model_id, material_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
              [materialId, id, material.material_id, material.quantity, now, now]
            );
          }
        }
      }

      await pool.query('COMMIT');

      res.json(toCamelCase(modelResult.rows[0]));
    } catch (err) {
      await pool.query('ROLLBACK');
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

      // Delete related model_components
      await pool.query('DELETE FROM model_components WHERE model_id = $1', [id]);

      // Delete related model_materials (per retrocompatibilità)
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