// Importazione dei moduli
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://craftuser:craftpassword@172.28.1.2:5432/craftdb',
  max: 20, // Massimo numero di client nel pool
  idleTimeoutMillis: 30000, // Tempo massimo di inattività di un client prima di essere rilasciato
  connectionTimeoutMillis: 2000, // Tempo massimo di attesa per una connessione
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // Abilita SSL in produzione
});

// Gestione degli eventi del pool
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Test database connection in una funzione asincrona autoeseguita
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
})();

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

// Routes
app.get('/health', (_, res) => {
  res.json({ status: 'OK' });
});

// Materials API
app.get('/api/materials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY name');
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/materials/:id', async (req, res) => {
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

app.post('/api/materials', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      unitOfMeasure, 
      costPerUnit, 
      currentStock, 
      minStockLevel, 
      supplierId 
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
    
    const result = await pool.query(
      'INSERT INTO materials (id, name, description, unit_of_measure, cost_per_unit, current_stock, min_stock_level, supplier_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [id, name, description, defaultUnitOfMeasure, defaultCostPerUnit, defaultCurrentStock, defaultMinStockLevel, supplierId, now, now]
    );
    
    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (err) {
    console.error('Error creating material:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, unitOfMeasure, costPerUnit, currentStock, minStockLevel, supplierId } = req.body;
    const now = new Date();

    const result = await pool.query(
      'UPDATE materials SET name = $1, description = $2, unit_of_measure = $3, cost_per_unit = $4, current_stock = $5, min_stock_level = $6, supplier_id = $7, updated_at = $8 WHERE id = $9 RETURNING *',
      [name, description, unitOfMeasure, costPerUnit, currentStock, minStockLevel, supplierId, now, id]
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

app.delete('/api/materials/:id', async (req, res) => {
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

// Product Models API
app.get('/api/models', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_models ORDER BY name');
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error('Error fetching models:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/models/:id', async (req, res) => {
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

app.post('/api/models', async (req, res) => {
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

app.put('/api/models/:id', async (req, res) => {
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

app.delete('/api/models/:id', async (req, res) => {
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

// Inventory API
app.get('/api/inventory', async (req, res) => {
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

app.get('/api/inventory/:id', async (req, res) => {
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

app.post('/api/inventory', async (req, res) => {
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

app.put('/api/inventory/:id', async (req, res) => {
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

app.delete('/api/inventory/:id', async (req, res) => {
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

// Suppliers API
app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
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

app.post('/api/suppliers', async (req, res) => {
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

app.put('/api/suppliers/:id', async (req, res) => {
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

app.delete('/api/suppliers/:id', async (req, res) => {
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

// Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(toCamelCase(result.rows[0]));
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, contact_person, customer_type, email, phone, address, notes } = req.body;
    const id = uuidv4();
    const now = new Date();
    
    // Validazione dei campi obbligatori
    if (!name) {
      return res.status(400).json({ error: 'Il nome del cliente è obbligatorio' });
    }
    
    // Imposta un tipo cliente predefinito se non specificato
    const defaultCustomerType = customer_type || 'private';

    const result = await pool.query(
      'INSERT INTO customers (id, name, contact_person, customer_type, email, phone, address, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [id, name, contact_person, defaultCustomerType, email, phone, address, notes, now, now]
    );

    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, customer_type, email, phone, address, notes } = req.body;
    const now = new Date();

    const result = await pool.query(
      'UPDATE customers SET name = $1, contact_person = $2, customer_type = $3, email = $4, phone = $5, address = $6, notes = $7, updated_at = $8 WHERE id = $9 RETURNING *',
      [name, contact_person, customer_type, email, phone, address, notes, now, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(toCamelCase(result.rows[0]));
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transactions API
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
        s.name as supplier_name, 
        c.name as customer_name 
      FROM transactions t 
      LEFT JOIN suppliers s ON t.supplier_id = s.id 
      LEFT JOIN customers c ON t.customer_id = c.id 
      ORDER BY t.date DESC
    `);
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
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

app.post('/api/transactions', async (req, res) => {
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

// Auth API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const id = uuidv4();
    const now = new Date();

    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // In a real app, you would hash the password here
    // For simplicity, we're storing it as plain text (NOT recommended for production)
    const result = await pool.query(
      'INSERT INTO users (id, username, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, created_at',
      [id, username, email, password, now, now]
    );

    // Generate a simple token (in a real app, use JWT)
    const token = Buffer.from(`${id}:${now.getTime()}`).toString('base64');

    res.status(201).json({
      token,
      user: toCamelCase(result.rows[0])
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // In a real app, you would compare hashed passwords
    // For simplicity, we're comparing plain text (NOT recommended for production)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a simple token (in a real app, use JWT)
    const token = Buffer.from(`${user.id}:${new Date().getTime()}`).toString('base64');

    // Remove password from user object
    delete user.password;

    res.json({
      token,
      user: toCamelCase(user)
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});