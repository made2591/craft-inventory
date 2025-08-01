-- Create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(8) UNIQUE NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL,
    min_stock_level DECIMAL(10, 2),
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add foreign key constraint
ALTER TABLE materials
ADD CONSTRAINT fk_materials_supplier
FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
ON DELETE SET NULL;

-- Product models table
CREATE TABLE IF NOT EXISTS product_models (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(8) UNIQUE NOT NULL,
    production_cost DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    labor_time_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Model materials table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS model_materials (
    id UUID PRIMARY KEY,
    model_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (model_id) REFERENCES product_models(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY,
    model_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    production_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (model_id) REFERENCES product_models(id) ON DELETE CASCADE
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL, -- 'private', 'online', 'store'
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale'
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    customer_id UUID,
    supplier_id UUID,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL,
    product_model_id UUID,
    material_id UUID,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_model_id) REFERENCES product_models(id) ON DELETE SET NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL
);

-- Components table
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(8) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Component materials table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS component_materials (
    id UUID PRIMARY KEY,
    component_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    custom_cost DECIMAL(10, 2),
    use_material_cost BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- Model components table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS model_components (
    id UUID PRIMARY KEY,
    model_id UUID NOT NULL,
    component_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (model_id) REFERENCES product_models(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_materials_supplier_id ON materials(supplier_id);
CREATE INDEX idx_model_materials_model_id ON model_materials(model_id);
CREATE INDEX idx_model_materials_material_id ON model_materials(material_id);
CREATE INDEX idx_inventory_items_model_id ON inventory_items(model_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_supplier_id ON transactions(supplier_id);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_model_id ON transaction_items(product_model_id);
CREATE INDEX idx_transaction_items_material_id ON transaction_items(material_id);
CREATE INDEX idx_component_materials_component_id ON component_materials(component_id);
CREATE INDEX idx_component_materials_material_id ON component_materials(material_id);
CREATE INDEX idx_model_components_model_id ON model_components(model_id);
CREATE INDEX idx_model_components_component_id ON model_components(component_id);