-- Creazione della tabella components
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Creazione della tabella component_materials per la relazione molti-a-molti tra componenti e materiali
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

-- Creazione della tabella model_components per la relazione molti-a-molti tra modelli e componenti
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

-- Creazione degli indici
CREATE INDEX idx_component_materials_component_id ON component_materials(component_id);
CREATE INDEX idx_component_materials_material_id ON component_materials(material_id);
CREATE INDEX idx_model_components_model_id ON model_components(model_id);
CREATE INDEX idx_model_components_component_id ON model_components(component_id);