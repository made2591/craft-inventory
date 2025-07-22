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
      const { modelId } = req.query;
      
      let query = 'SELECT i.*, p.name as model_name, p.sku as model_sku FROM inventory_items i JOIN product_models p ON i.model_id = p.id';
      const params = [];
      
      // Filtra per modelId se specificato
      if (modelId) {
        query += ' WHERE i.model_id = $1';
        params.push(modelId);
      }
      
      query += ' ORDER BY i.created_at DESC';
      
      const result = await pool.query(query, params);

      // Converti i dati in camelCase
      const items = toCamelCase(result.rows);

      // Assicurati che le date siano stringhe ISO
      items.forEach(item => {
        // Converti la data di produzione in una stringa ISO
        if (item.production_date) {
          try {
            const date = new Date(item.production_date);
            if (!isNaN(date.getTime())) {
              item.production_date = date.toISOString();
            } else {
              item.production_date = null;
            }
          } catch (error) {
            console.error('Error formatting production date:', error);
            item.production_date = null;
          }
        }
      });

      res.json(items);
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
        'SELECT i.*, p.name as model_name, p.sku as model_sku FROM inventory_items i JOIN product_models p ON i.model_id = p.id WHERE i.id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Converti i dati in camelCase
      const item = toCamelCase(result.rows[0]);

      // Assicurati che la data di produzione sia una stringa ISO
      if (item.production_date) {
        try {
          const date = new Date(item.production_date);
          if (!isNaN(date.getTime())) {
            item.production_date = date.toISOString();
          } else {
            item.production_date = null;
          }
        } catch (error) {
          console.error('Error formatting production date:', error);
          item.production_date = null;
        }
      }

      res.json(item);
    } catch (err) {
      console.error('Error fetching inventory item:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inventory - Crea un nuovo articolo in inventario
  router.post('/', async (req, res) => {
    try {
      // Supporta sia camelCase che snake_case per compatibilità
      const model_id = req.body.modelId || req.body.model_id;
      const quantity = req.body.quantity;
      const production_date = req.body.productionDate || req.body.production_date;
      const notes = req.body.notes;

      // Validate required fields
      if (!model_id) {
        return res.status(400).json({ error: 'Il modello è obbligatorio' });
      }

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'La quantità deve essere maggiore di zero' });
      }

      const id = uuidv4();
      const now = new Date();

      // Verifica che il modello esista
      const modelCheck = await pool.query('SELECT id FROM product_models WHERE id = $1', [model_id]);
      if (modelCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Il modello selezionato non esiste' });
      }

      // Assicurati che la data di produzione sia in un formato valido
      let formattedProductionDate = null;
      if (production_date) {
        try {
          formattedProductionDate = new Date(production_date);
          // Verifica se la data è valida
          if (isNaN(formattedProductionDate.getTime())) {
            formattedProductionDate = now; // Usa la data corrente se la data fornita non è valida
          }
        } catch (error) {
          console.error('Error parsing production date:', error);
          formattedProductionDate = now; // Usa la data corrente in caso di errore
        }
      }

      const result = await pool.query(
        'INSERT INTO inventory_items (id, model_id, quantity, production_date, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, model_id, quantity, formattedProductionDate, notes, now, now]
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
      // Supporta sia camelCase che snake_case per la data di produzione
      const production_date = req.body.productionDate || req.body.production_date;
      const now = new Date();

      // Usa un array per i parametri e un array per le parti della query
      let updateParts = [];
      let queryParams = [];
      let paramIndex = 1;

      // Aggiungi i campi da aggiornare
      if (quantity !== undefined) {
        updateParts.push(`quantity = $${paramIndex}`);
        queryParams.push(quantity);
        paramIndex++;
      }

      if (notes !== undefined) {
        updateParts.push(`notes = $${paramIndex}`);
        queryParams.push(notes);
        paramIndex++;
      }

      // Gestisci la data di produzione
      if (production_date) {
        try {
          const formattedProductionDate = new Date(production_date);
          if (!isNaN(formattedProductionDate.getTime())) {
            updateParts.push(`production_date = $${paramIndex}`);
            queryParams.push(formattedProductionDate);
            paramIndex++;
          }
        } catch (error) {
          console.error('Error parsing production date:', error);
        }
      }

      // Aggiorna sempre il timestamp updated_at
      updateParts.push(`updated_at = $${paramIndex}`);
      queryParams.push(now);
      paramIndex++;

      // Se non ci sono campi da aggiornare, restituisci un errore
      if (updateParts.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Costruisci la query
      let queryText = `UPDATE inventory_items SET ${updateParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      // Aggiungi l'ID per la clausola WHERE
      queryParams.push(id);

      // Esegui la query
      const result = await pool.query(queryText, queryParams);

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