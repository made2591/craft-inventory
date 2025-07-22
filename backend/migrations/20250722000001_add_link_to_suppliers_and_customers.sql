-- Aggiunta del campo link alla tabella suppliers
ALTER TABLE suppliers ADD COLUMN link TEXT;

-- Aggiunta del campo link alla tabella customers
ALTER TABLE customers ADD COLUMN link TEXT;