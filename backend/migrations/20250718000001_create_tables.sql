-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    unit_of_measure TEXT NOT NULL,
    cost_per_unit REAL NOT NULL,
    current_stock REAL NOT NULL,
    min_stock_level REAL,
    supplier_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);

-- Create product_models table
CREATE TABLE IF NOT EXISTS product_models (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    production_cost REAL NOT NULL,
    selling_price REAL NOT NULL,
    labor_time_minutes INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create model_materials table (relazione molti a molti tra modelli e materiali)
CREATE TABLE IF NOT EXISTS model_materials (
    id UUID PRIMARY KEY,
    model_id TEXT NOT NULL,
    material_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (model_id) REFERENCES product_models (id),
    FOREIGN KEY (material_id) REFERENCES materials (id)
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY,
    model_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    production_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (model_id) REFERENCES product_models (id)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    customer_type TEXT NOT NULL, -- 'private', 'online', 'store'
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    transaction_type TEXT NOT NULL, -- 'purchase', 'sale'
    date TEXT NOT NULL,
    customer_id TEXT,
    supplier_id TEXT,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'completed', 'cancelled'
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    product_model_id TEXT,
    material_id TEXT,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions (id),
    FOREIGN KEY (product_model_id) REFERENCES product_models (id),
    FOREIGN KEY (material_id) REFERENCES materials (id)
);

-- Indici per migliorare le performance
CREATE INDEX idx_materials_supplier_id ON materials (supplier_id);
CREATE INDEX idx_model_materials_model_id ON model_materials (model_id);
CREATE INDEX idx_model_materials_material_id ON model_materials (material_id);
CREATE INDEX idx_inventory_items_model_id ON inventory_items (model_id);
CREATE INDEX idx_transactions_customer_id ON transactions (customer_id);
CREATE INDEX idx_transactions_supplier_id ON transactions (supplier_id);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items (transaction_id);
CREATE INDEX idx_transaction_items_product_model_id ON transaction_items (product_model_id);
CREATE INDEX idx_transaction_items_material_id ON transaction_items (material_id);