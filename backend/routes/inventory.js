import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pagination } from '../middleware/security.js';
import {
  validateUUID,
  validateInventoryCreation,
  validateInventoryUpdate,
  validatePagination,
  validateSearch,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

/**
 * Configura le rotte per la gestione dell'inventario
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function inventoryRoutes(pool, toCamelCase) {
  // GET /api/inventory - Ottieni tutti gli articoli in inventario con paginazione
  router.get('/', 
    validatePagination, 
    validateSearch,
    handleValidationErrors, 
    pagination, 
    async (req, res) => {
      try {
        const { modelId, search, category, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        const { limit, offset } = req.pagination;
        
        // Build query with security in mind
        let baseQuery = `
          FROM inventory_items i 
          JOIN product_models p ON i.model_id = p.id
        `;
        
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;
        
        // Filter by modelId if specified
        if (modelId) {
          whereConditions.push(`i.model_id = $${paramIndex}`);
          queryParams.push(modelId);
          paramIndex++;
        }
        
        // Search functionality
        if (search) {
          whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR i.notes ILIKE $${paramIndex})`);
          queryParams.push(`%${search}%`);
          paramIndex++;
        }
        
        // Category filter (if applicable to your model)
        if (category) {
          whereConditions.push(`p.category = $${paramIndex}`);
          queryParams.push(category);
          paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Validate sort field to prevent SQL injection
        const allowedSortFields = {
          'created_at': 'i.created_at',
          'updated_at': 'i.updated_at',
          'name': 'p.name',
          'quantity': 'i.quantity',
          'production_date': 'i.production_date'
        };
        
        const sortField = allowedSortFields[sortBy] || 'i.created_at';
        const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        
        // Get total count
        const countQuery = `SELECT COUNT(*) ${baseQuery} ${whereClause}`;
        const countResult = await pool.query(countQuery, queryParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        // Get paginated results
        const dataQuery = `
          SELECT i.*, p.name as model_name, p.sku as model_sku 
          ${baseQuery} 
          ${whereClause}
          ORDER BY ${sortField} ${sortDirection}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        queryParams.push(limit, offset);
        const result = await pool.query(dataQuery, queryParams);

        // Convert dates and camelCase
        const items = toCamelCase(result.rows);
        items.forEach(item => {
          if (item.productionDate) {
            try {
              const date = new Date(item.productionDate);
              if (!isNaN(date.getTime())) {
                item.productionDate = date.toISOString();
              } else {
                item.productionDate = null;
              }
            } catch (error) {
              console.error('Error formatting production date:', error);
              item.productionDate = null;
            }
          }
        });

        res.json({
          items,
          pagination: {
            currentPage: req.pagination.page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: req.pagination.page < totalPages,
            hasPreviousPage: req.pagination.page > 1
          },
          filters: {
            modelId,
            search,
            category,
            sortBy,
            sortOrder
          }
        });
      } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // GET /api/inventory/:id - Ottieni un articolo specifico dell'inventario
  router.get('/:id', 
    validateUUID('id'), 
    handleValidationErrors, 
    async (req, res) => {
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
  
  // GET /api/inventory/:id/sales - Ottieni le vendite relative a un articolo specifico dell'inventario
  router.get('/:id/sales', async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      // Prima ottieni l'articolo di inventario per ottenere il model_id
      const inventoryResult = await pool.query(
        'SELECT model_id FROM inventory_items WHERE id = $1',
        [id]
      );

      if (inventoryResult.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      
      const modelId = inventoryResult.rows[0].model_id;
      
      // Ottieni le transazioni di vendita per questo modello
      const query = `
        SELECT DISTINCT t.*, 
          c.name as customer_name
        FROM transactions t 
        JOIN transaction_items ti ON t.id = ti.transaction_id
        LEFT JOIN customers c ON t.customer_id = c.id 
        WHERE ti.product_model_id = $1
        AND t.transaction_type = 'sale'
        ORDER BY t.date DESC
        LIMIT $2 OFFSET $3
      `;
      
      const countQuery = `
        SELECT COUNT(DISTINCT t.id) 
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        WHERE ti.product_model_id = $1
        AND t.transaction_type = 'sale'
      `;
      
      // Esegui le query
      const [salesResult, countResult] = await Promise.all([
        pool.query(query, [modelId, limit, offset]),
        pool.query(countQuery, [modelId])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      // Se abbiamo transazioni, ottieni anche i dettagli degli elementi
      if (salesResult.rows.length > 0) {
        const transactionIds = salesResult.rows.map(t => t.id);
        
        const itemsQuery = `
          SELECT ti.*, 
            ti.transaction_id,
            pm.name as model_name
          FROM transaction_items ti 
          LEFT JOIN product_models pm ON ti.product_model_id = pm.id
          WHERE ti.transaction_id = ANY($1)
          AND ti.product_model_id = $2
        `;
        
        const itemsResult = await pool.query(itemsQuery, [transactionIds, modelId]);
        
        // Mappa gli elementi alle loro transazioni
        const salesWithItems = salesResult.rows.map(transaction => {
          const items = itemsResult.rows.filter(item => item.transaction_id === transaction.id);
          return {
            ...transaction,
            items: items
          };
        });
        
        res.json({
          sales: toCamelCase(salesWithItems),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
          }
        });
      } else {
        res.json({
          sales: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: 0,
            totalPages: 0
          }
        });
      }
    } catch (err) {
      console.error('Error fetching inventory sales:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inventory - Crea un nuovo articolo in inventario
  router.post('/', 
    validateInventoryCreation, 
    handleValidationErrors, 
    async (req, res) => {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Supporta sia camelCase che snake_case per compatibilità
        const model_id = req.body.modelId || req.body.model_id;
        const quantity = req.body.quantity;
        const production_date = req.body.productionDate || req.body.production_date;
        const notes = req.body.notes;

        const now = new Date();

        // Verifica che il modello esista
        const modelCheck = await client.query('SELECT id FROM product_models WHERE id = $1', [model_id]);
        if (modelCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Il modello specificato non esiste' });
        }

        const id = uuidv4();

        // Assicurati che la data di produzione sia in un formato valido
        let formattedProductionDate = null;
        if (production_date) {
          try {
            formattedProductionDate = new Date(production_date);
            // Verifica se la data è valida
            if (isNaN(formattedProductionDate.getTime())) {
              await client.query('ROLLBACK');
              return res.status(400).json({ error: 'Formato data di produzione non valido' });
            }
          } catch (error) {
            console.error('Error parsing production date:', error);
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Formato data di produzione non valido' });
          }
        }

        // Verifica se esiste già un articolo per questo modello
        const existingItemResult = await client.query(
          'SELECT * FROM inventory_items WHERE model_id = $1 LIMIT 1',
          [model_id]
        );

        let result;
        
        if (existingItemResult.rows.length > 0) {
          // Se esiste già un articolo per questo modello, aggiorna la quantità e la data di produzione
          const existingItem = existingItemResult.rows[0];
          const newQuantity = parseInt(existingItem.quantity, 10) + parseInt(quantity, 10);
          
          result = await client.query(
            'UPDATE inventory_items SET quantity = $1, production_date = $2, notes = $3, updated_at = $4 WHERE id = $5 RETURNING *',
            [newQuantity, formattedProductionDate || existingItem.production_date, notes || existingItem.notes, now, existingItem.id]
          );
        } else {
          // Se non esiste un articolo per questo modello, creane uno nuovo
          result = await client.query(
            'INSERT INTO inventory_items (id, model_id, quantity, production_date, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, model_id, quantity, formattedProductionDate, notes, now, now]
          );
        }

        await client.query('COMMIT');
        
        res.status(201).json(toCamelCase(result.rows[0]));
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating inventory item:', err);
        res.status(500).json({ error: 'Internal server error' });
      } finally {
        client.release();
      }
    }
  );

  // PUT /api/inventory/:id - Aggiorna un articolo esistente dell'inventario
  router.put('/:id', 
    validateUUID('id'),
    validateInventoryUpdate,
    handleValidationErrors,
    async (req, res) => {
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