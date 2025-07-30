-- Aggiunta del campo SKU alla tabella components
ALTER TABLE components ADD COLUMN IF NOT EXISTS sku VARCHAR(8) UNIQUE;

-- Aggiornamento dei componenti esistenti con uno SKU generato casualmente
-- Nota: questa è una soluzione temporanea, l'applicazione genererà SKU più strutturati
UPDATE components SET sku = SUBSTRING(REPLACE(CAST(uuid_generate_v4() AS VARCHAR), '-', ''), 1, 8) WHERE sku IS NULL;

-- Rendere il campo SKU NOT NULL dopo aver popolato i valori esistenti
ALTER TABLE components ALTER COLUMN sku SET NOT NULL;