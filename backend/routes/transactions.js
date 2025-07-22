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
  // GET /api/transactions - Ottieni tutte le transazioni
  router.get('/', async (req, res) => {
    try {
      const { customerId, supplierId, type } = req.query;
      
      let query = `
        SELECT t.*, 
          s.name as supplier_name, 
          c.name as customer_name
        FROM transactions t 
        LEFT JOIN suppliers s ON t.supplier_id = s.id 
        LEFT JOIN customers c ON t.customer_id = c.id 
      `;
      
      const params = [];
      const conditions = [];
      
      if (customerId) {
        conditions.push(`t.customer_id = $${params.length + 1}`);
        params.push(customerId);
      }
      
      if (supplierId) {
        conditions.push(`t.supplier_id = $${params.length + 1}`);
        params.push(supplierId);
      }
      
      if (type) {
        conditions.push(`t.transaction_type = $${params.length + 1}`);
        params.push(type);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY t.date DESC';
      
      const transactionsResult = await pool.query(query, params);
      
      // Se abbiamo transazioni e c'è un customerId o supplierId, otteniamo anche i dettagli degli elementi
      if (transactionsResult.rows.length > 0 && (customerId || supplierId)) {
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
        
        res.json(toCamelCase(transactionsWithItems));
      } else {
        res.json(toCamelCase(transactionsResult.rows));
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

          // Update inventory based on transaction type
          if (transaction_type === 'purchase' && item.material_id) {
            // Increase material stock for purchases
            await pool.query(
              'UPDATE materials SET current_stock = current_stock + $1, updated_at = $2 WHERE id = $3',
              [item.quantity, now, item.material_id]
            );
          } else if (transaction_type === 'sale' && item.product_model_id) {
            // Decrease inventory for sales
            // First, find the inventory item with enough quantity
            const inventoryResult = await pool.query(
              'SELECT id FROM inventory_items WHERE model_id = $1 AND quantity >= $2 ORDER BY created_at ASC LIMIT 1',
              [item.product_model_id, item.quantity]
            );
            
            if (inventoryResult.rows.length > 0) {
              // Update the found inventory item
              await pool.query(
                'UPDATE inventory_items SET quantity = quantity - $1, updated_at = $2 WHERE id = $3',
                [item.quantity, now, inventoryResult.rows[0].id]
              );
            } else {
              // Handle case where there's not enough inventory
              console.warn(`Not enough inventory for model ${item.product_model_id}`);
            }
          }
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

  return router;
}