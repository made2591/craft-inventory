-- Aggiunta del campo quantity alla tabella components
ALTER TABLE components ADD COLUMN quantity DECIMAL(10, 2) DEFAULT 0;