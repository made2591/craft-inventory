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
 * Configura le rotte per la gestione dei dati di test
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function testDataRoutes(pool, toCamelCase) {
  // POST /api/test-data/init - Inizializza il database con dati di test
  router.post('/init', async (req, res) => {
    try {
      // Inizia una transazione
      await pool.query('BEGIN');

      // Pulisci le tabelle esistenti (in ordine inverso rispetto alle dipendenze)
      await pool.query('DELETE FROM inventory_items');
      await pool.query('DELETE FROM model_components');
      await pool.query('DELETE FROM model_materials');
      await pool.query('DELETE FROM component_materials');
      await pool.query('DELETE FROM components');
      await pool.query('DELETE FROM product_models');
      await pool.query('DELETE FROM materials');
      await pool.query('DELETE FROM suppliers');

      const now = new Date();

      // Crea 3 fornitori
      const supplierIds = [];
      const suppliers = [
        { name: 'Fornitore Legno', contact_person: 'Mario Rossi', email: 'mario@fornitorelegno.it', phone: '0123456789' },
        { name: 'Fornitore Metalli', contact_person: 'Luigi Verdi', email: 'luigi@fornitoremetalli.it', phone: '9876543210' },
        { name: 'Fornitore Tessuti', contact_person: 'Anna Bianchi', email: 'anna@fornitoretessuti.it', phone: '5678901234' }
      ];

      for (const supplier of suppliers) {
        const id = uuidv4();
        supplierIds.push(id);
        await pool.query(
          'INSERT INTO suppliers (id, name, contact_person, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [id, supplier.name, supplier.contact_person, supplier.email, supplier.phone, now, now]
        );
      }

      // Crea 3 materiali
      const materialIds = [];
      const materials = [
        { 
          name: 'Legno di Quercia', 
          description: 'Legno di quercia di alta qualità', 
          unit_of_measure: 'mq', 
          cost_per_unit: 25.50, 
          current_stock: 100, 
          min_stock_level: 20, 
          supplier_id: supplierIds[0] 
        },
        { 
          name: 'Acciaio Inox', 
          description: 'Acciaio inossidabile per componenti di precisione', 
          unit_of_measure: 'kg', 
          cost_per_unit: 15.75, 
          current_stock: 50, 
          min_stock_level: 10, 
          supplier_id: supplierIds[1] 
        },
        { 
          name: 'Tessuto Cotone', 
          description: 'Tessuto in cotone naturale', 
          unit_of_measure: 'mt', 
          cost_per_unit: 8.25, 
          current_stock: 200, 
          min_stock_level: 30, 
          supplier_id: supplierIds[2] 
        }
      ];

      for (const material of materials) {
        const id = uuidv4();
        const sku = generateSKU();
        materialIds.push(id);
        await pool.query(
          'INSERT INTO materials (id, name, description, sku, unit_of_measure, cost_per_unit, current_stock, min_stock_level, supplier_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [id, material.name, material.description, sku, material.unit_of_measure, material.cost_per_unit, material.current_stock, material.min_stock_level, material.supplier_id, now, now]
        );
      }

      // Crea 2 componenti
      const componentIds = [];
      const components = [
        { name: 'Gamba Tavolo', description: 'Gamba per tavolo in legno e acciaio' },
        { name: 'Piano Tavolo', description: 'Piano per tavolo in legno massello' }
      ];

      for (const component of components) {
        const id = uuidv4();
        const sku = generateSKU();
        componentIds.push(id);
        await pool.query(
          'INSERT INTO components (id, name, description, sku, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [id, component.name, component.description, sku, now, now]
        );
      }

      // Associa materiali ai componenti
      const componentMaterials = [
        { component_id: componentIds[0], material_id: materialIds[0], quantity: 0.5, use_material_cost: true },
        { component_id: componentIds[0], material_id: materialIds[1], quantity: 1.2, use_material_cost: true },
        { component_id: componentIds[1], material_id: materialIds[0], quantity: 2.0, use_material_cost: true }
      ];

      for (const cm of componentMaterials) {
        const id = uuidv4();
        await pool.query(
          'INSERT INTO component_materials (id, component_id, material_id, quantity, custom_cost, use_material_cost, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [id, cm.component_id, cm.material_id, cm.quantity, null, cm.use_material_cost, now, now]
        );
      }

      // Crea 2 modelli di prodotto
      const modelIds = [];
      const models = [
        { 
          name: 'Tavolo Moderno', 
          description: 'Tavolo moderno in legno e acciaio', 
          selling_price: 299.99, 
          labor_time_minutes: 120 
        },
        { 
          name: 'Tavolo Rustico', 
          description: 'Tavolo rustico in legno massello', 
          selling_price: 349.99, 
          labor_time_minutes: 180 
        }
      ];

      for (const model of models) {
        const id = uuidv4();
        const sku = generateSKU();
        modelIds.push(id);
        await pool.query(
          'INSERT INTO product_models (id, name, description, sku, production_cost, selling_price, labor_time_minutes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [id, model.name, model.description, sku, 0, model.selling_price, model.labor_time_minutes, now, now]
        );
      }

      // Associa componenti ai modelli
      const modelComponents = [
        { model_id: modelIds[0], component_id: componentIds[0], quantity: 4 }, // 4 gambe per il tavolo moderno
        { model_id: modelIds[0], component_id: componentIds[1], quantity: 1 }, // 1 piano per il tavolo moderno
        { model_id: modelIds[1], component_id: componentIds[0], quantity: 4 }, // 4 gambe per il tavolo rustico
        { model_id: modelIds[1], component_id: componentIds[1], quantity: 1 }  // 1 piano per il tavolo rustico
      ];

      for (const mc of modelComponents) {
        const id = uuidv4();
        await pool.query(
          'INSERT INTO model_components (id, model_id, component_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [id, mc.model_id, mc.component_id, mc.quantity, now, now]
        );
      }

      // Aggiorna i costi di produzione dei modelli
      for (const modelId of modelIds) {
        // Calcola il costo di produzione in base ai componenti
        const costResult = await pool.query(`
          WITH component_costs AS (
            SELECT 
              mc.model_id,
              mc.component_id,
              mc.quantity as model_component_quantity,
              COALESCE(SUM(
                CASE 
                  WHEN cm.use_material_cost THEN cm.quantity * m.cost_per_unit
                  ELSE cm.quantity * cm.custom_cost
                END
              ), 0) as component_cost
            FROM model_components mc
            JOIN component_materials cm ON mc.component_id = cm.component_id
            JOIN materials m ON cm.material_id = m.id
            WHERE mc.model_id = $1
            GROUP BY mc.model_id, mc.component_id, mc.quantity
          )
          SELECT SUM(component_cost * model_component_quantity) as total_cost
          FROM component_costs
        `, [modelId]);

        const productionCost = parseFloat(costResult.rows[0].total_cost) || 0;

        await pool.query(
          'UPDATE product_models SET production_cost = $1 WHERE id = $2',
          [productionCost, modelId]
        );
      }

      // Crea articoli di inventario (2 per ogni modello)
      for (const modelId of modelIds) {
        for (let i = 0; i < 2; i++) {
          const id = uuidv4();
          const production_date = new Date();
          production_date.setDate(production_date.getDate() - i * 7); // Una settimana di differenza
          
          await pool.query(
            'INSERT INTO inventory_items (id, model_id, quantity, production_date, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [id, modelId, i + 1, production_date, `Articolo di test ${i + 1}`, now, now]
          );
        }
      }

      // Commit della transazione
      await pool.query('COMMIT');

      res.status(200).json({ 
        message: 'Database inizializzato con successo',
        data: {
          suppliers: suppliers.length,
          materials: materials.length,
          components: components.length,
          models: models.length,
          inventoryItems: modelIds.length * 2
        }
      });
    } catch (err) {
      // Rollback in caso di errore
      await pool.query('ROLLBACK');
      console.error('Error initializing test data:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}