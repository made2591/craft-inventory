-- Aggiungi il campo SKU alla tabella components se non esiste già
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'components' AND column_name = 'sku'
    ) THEN
        -- Aggiungi la colonna SKU
        ALTER TABLE components ADD COLUMN sku VARCHAR(8);
        
        -- Aggiorna i componenti esistenti con uno SKU generato casualmente
        UPDATE components 
        SET sku = SUBSTRING(REPLACE(CAST(gen_random_uuid() AS VARCHAR), '-', ''), 1, 8);
        
        -- Aggiungi il vincolo UNIQUE e NOT NULL dopo aver popolato i valori
        ALTER TABLE components ALTER COLUMN sku SET NOT NULL;
        ALTER TABLE components ADD CONSTRAINT components_sku_unique UNIQUE (sku);
    END IF;
END $$;