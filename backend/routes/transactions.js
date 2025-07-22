import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Configura le rotte per la gestione delle transazioni
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function transactionsRoutes(pool, toCamelCase) {
  // GET /api/transactions - Ottieni tutte le transazioni con paginazione
  router.get('/', async (req, res) => {
    try {
      const { customerId, supplierId, type, page = 1, limit = 10, modelId } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT t.*, 
          s.name as supplier_name, 
          c.name as customer_name
        FROM transactions t 
        LEFT JOIN suppliers s ON t.supplier_id = s.id 
        LEFT JOIN customers c ON t.customer_id = c.id 
      `;
      
      let countQuery = `
        SELECT COUNT(*) FROM transactions t
      `;
      
      const params = [];
      const countParams = [];
      const conditions = [];
      const countConditions = [];
      
      if (customerId) {
        conditions.push(`t.customer_id = ${params.length + 1}`);
        countConditions.push(`t.customer_id = ${countParams.length + 1}`);
        params.push(customerId);
        countParams.push(customerId);
      }
      
      if (supplierId) {
        conditions.push(`t.supplier_id = ${params.length + 1}`);
        countConditions.push(`t.supplier_id = ${countParams.length + 1}`);
        params.push(supplierId);
        countParams.push(supplierId);
      }
      
      if (type) {
        conditions.push(`t.transaction_type = ${params.length + 1}`);
        countConditions.push(`t.transaction_type = ${countParams.length + 1}`);
        params.push(type);
        countParams.push(type);
      }
      
      // Se è specificato un modelId, filtra per le transazioni che contengono quel modello
      if (modelId) {
        query = `
          SELECT DISTINCT t.*, 
            s.name as supplier_name, 
            c.name as customer_name
          FROM transactions t 
          LEFT JOIN suppliers s ON t.supplier_id = s.id 
          LEFT JOIN customers c ON t.customer_id = c.id 
          JOIN transaction_items ti ON t.id = ti.transaction_id
          WHERE ti.product_model_id = ${params.length + 1}
        `;
        
        countQuery = `
          SELECT COUNT(DISTINCT t.id) FROM transactions t
          JOIN transaction_items ti ON t.id = ti.transaction_id
          WHERE ti.product_model_id = ${countParams.length + 1}
        `;
        
        params.push(modelId);
        countParams.push(modelId);
        
        // Aggiungi altre condizioni se presenti
        if (conditions.length > 0) {
          query += ' AND ' + conditions.join(' AND ');
          countQuery += ' AND ' + countConditions.join(' AND ');
        }
      } else if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
        countQuery += ' WHERE ' + countConditions.join(' AND ');
      }
      
      query += ' ORDER BY t.date DESC';
      
      // Aggiungi paginazione
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
      // Esegui le query
      const [transactionsResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams)
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      // Se abbiamo transazioni e c'è un customerId, supplierId o modelId, otteniamo anche i dettagli degli elementi
      if (transactionsResult.rows.length > 0 && (customerId || supplierId || modelId)) {
        const transactionIds = transactionsResult.rows.map(t => t.id);
        
        const itemsQuery = `
          SELECT ti.*, 
            ti.transaction_id,
            m.name as material_name, 
            m.unit_of_measure,
            pm.name as model_name
          FROM transaction_items ti 
          LEFT JOIN materials m ON ti.material_id = m.id 
          LEFT JOIN product_models pm ON ti.product_model_id = pm.id
          WHERE ti.transaction_id = ANY($1)
        `;
        
        const itemsResult = await pool.query(itemsQuery, [transactionIds]);
        
        // Mappa gli elementi alle loro transazioni
        const transactionsWithItems = transactionsResult.rows.map(transaction => {
          const items = itemsResult.rows.filter(item => item.transaction_id === transaction.id);
          return {
            ...transaction,
            items: items
          };
        });
        
        res.json({
          transactions: toCamelCase(transactionsWithItems),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
          }
        });
      } else {
        res.json({
          transactions: toCamelCase(transactionsResult.rows),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
          }
        });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/transactions/:id - Ottieni una transazione specifica con i suoi elementi
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Get transaction details
      const transactionResult = await pool.query(`
        SELECT t.*, 
          s.name as supplier_name, 
          c.name as customer_name 
        FROM transactions t 
        LEFT JOIN suppliers s ON t.supplier_id = s.id 
        LEFT JOIN customers c ON t.customer_id = c.id 
        WHERE t.id = $1
      `, [id]);

      if (transactionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Get transaction items
      const itemsResult = await pool.query(`
        SELECT ti.*, 
          m.name as material_name, 
          m.unit_of_measure as material_unit,
          pm.name as model_name
        FROM transaction_items ti 
        LEFT JOIN materials m ON ti.material_id = m.id 
        LEFT JOIN product_models pm ON ti.product_model_id = pm.id
        WHERE ti.transaction_id = $1
      `, [id]);

      const response = {
        transaction: toCamelCase(transactionResult.rows[0]),
        items: toCamelCase(itemsResult.rows)
      };

      res.json(response);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/transactions - Crea una nuova transazione
  router.post('/', async (req, res) => {
    try {
      const { transaction_type, date, supplier_id, customer_id, status, notes, items } = req.body;
      const id = uuidv4();
      const now = new Date();

      // Validazione dei campi obbligatori
      if (!transaction_type) {
        return res.status(400).json({ error: 'Il tipo di transazione è obbligatorio' });
      }

      if (!date) {
        return res.status(400).json({ error: 'La data è obbligatoria' });
      }

      if (transaction_type === 'purchase' && !supplier_id) {
        return res.status(400).json({ error: 'Il fornitore è obbligatorio per gli acquisti' });
      }

      if (transaction_type === 'sale' && !customer_id) {
        return res.status(400).json({ error: 'Il cliente è obbligatorio per le vendite' });
      }
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'La transazione deve contenere almeno un elemento' });
      }
      
      // Calculate total amount from items
      const total_amount = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      // Start a transaction
      await pool.query('BEGIN');

      // Insert the transaction
      const transactionResult = await pool.query(
        'INSERT INTO transactions (id, transaction_type, date, supplier_id, customer_id, total_amount, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, transaction_type, date, supplier_id, customer_id, total_amount, status, notes, now, now]
      );

      // Insert the transaction items
      if (items && items.length > 0) {
        for (const item of items) {
          const itemId = uuidv4();
          await pool.query(
            'INSERT INTO transaction_items (id, transaction_id, material_id, product_model_id, quantity, unit_price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [itemId, id, item.material_id, item.product_model_id, item.quantity, item.unit_price, now, now]
          );
          
          // Non aggiorniamo più l'inventario qui, ma solo quando la transazione viene completata
        }
      }

      await pool.query('COMMIT');

      res.status(201).json(toCamelCase(transactionResult.rows[0]));
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error creating transaction:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/transactions/:id - Aggiorna una transazione esistente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const now = new Date();
      
      // Start a transaction
      await pool.query('BEGIN');
      
      // Ottieni i dettagli della transazione corrente
      const currentTransactionResult = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
      
      if (currentTransactionResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const currentTransaction = currentTransactionResult.rows[0];
      const oldStatus = currentTransaction.status;
      
      // Se lo stato sta cambiando da "pending" a "completed", aggiorna l'inventario
      if (oldStatus === 'pending' && status === 'completed') {
        // Ottieni gli elementi della transazione
        const itemsResult = await pool.query('SELECT * FROM transaction_items WHERE transaction_id = $1', [id]);
        const items = itemsResult.rows;
        
        // Aggiorna l'inventario in base al tipo di transazione
        for (const item of items) {
          // Converti la quantità in un numero intero
          const quantity = parseInt(item.quantity, 10);
          
          if (currentTransaction.transaction_type === 'purchase' && item.material_id) {
            // Per gli acquisti completati, aumenta lo stock del materiale
            await pool.query(
              'UPDATE materials SET current_stock = current_stock + $1, updated_at = $2 WHERE id = $3',
              [quantity, now, item.material_id]
            );
          } else if (currentTransaction.transaction_type === 'sale' && item.product_model_id) {
            // Per le vendite completate, diminuisci lo stock dell'inventario
            // Trova un articolo di inventario per questo modello
            const inventoryResult = await pool.query(
              'SELECT id FROM inventory_items WHERE model_id = $1 ORDER BY created_at ASC LIMIT 1',
              [item.product_model_id]
            );
            
            if (inventoryResult.rows.length > 0) {
              // Aggiorna l'articolo di inventario trovato
              await pool.query(
                'UPDATE inventory_items SET quantity = quantity - $1, updated_at = $2 WHERE id = $3',
                [quantity, now, inventoryResult.rows[0].id]
              );
            } else {
              // Se non esiste un articolo di inventario per questo modello, segnala un errore
              await pool.query('ROLLBACK');
              return res.status(400).json({ error: `Non c'è abbastanza inventario per il modello ${item.product_model_id}` });
            }
          }
        }
      }
      
      // Aggiorna lo stato della transazione
      const result = await pool.query(
        'UPDATE transactions SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [status, now, id]
      );
      
      await pool.query('COMMIT');
      
      res.json(toCamelCase(result.rows[0]));
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error updating transaction:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/transactions/:id - Elimina una transazione
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Start a transaction
      await pool.query('BEGIN');
      
      // Prima otteniamo i dettagli della transazione e dei suoi elementi
      const transactionResult = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
      
      if (transactionResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const transaction = transactionResult.rows[0];
      
      // Otteniamo gli elementi della transazione
      const itemsResult = await pool.query('SELECT * FROM transaction_items WHERE transaction_id = $1', [id]);
      const items = itemsResult.rows;
      
      // Ripristina l'inventario in base al tipo di transazione
      for (const item of items) {
        // Converti la quantità in un numero intero
        const quantity = parseInt(item.quantity, 10);
        
        if (transaction.transaction_type === 'purchase' && item.material_id) {
          // Per gli acquisti, diminuisci lo stock del materiale
          await pool.query(
            'UPDATE materials SET current_stock = current_stock - $1 WHERE id = $2',
            [quantity, item.material_id]
          );
        } else if (transaction.transaction_type === 'sale' && item.product_model_id) {
          // Per le vendite, aumenta lo stock dell'inventario
          // Trova un articolo di inventario per questo modello
          const inventoryResult = await pool.query(
            'SELECT id FROM inventory_items WHERE model_id = $1 LIMIT 1',
            [item.product_model_id]
          );
          
          if (inventoryResult.rows.length > 0) {
            // Aggiorna l'articolo di inventario trovato
            await pool.query(
              'UPDATE inventory_items SET quantity = quantity + $1 WHERE id = $2',
              [quantity, inventoryResult.rows[0].id]
            );
          } else {
            // Se non esiste un articolo di inventario per questo modello, creane uno nuovo
            const inventoryId = uuidv4();
            const now = new Date();
            
            await pool.query(
              'INSERT INTO inventory_items (id, model_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
              [inventoryId, item.product_model_id, quantity, now, now]
            );
          }
        }
      }
      
      // Elimina gli elementi della transazione
      await pool.query('DELETE FROM transaction_items WHERE transaction_id = $1', [id]);
      
      // Elimina la transazione
      await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
      
      await pool.query('COMMIT');
      
      res.status(204).send();
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error deleting transaction:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}