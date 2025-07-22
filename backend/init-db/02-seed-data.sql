-- Seed data for testing purposes

-- Insert suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, address, website, notes, created_at, updated_at)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Forniture Artigianali Srl', 'Marco Rossi', 'info@fornitureartigianali.it', '+39 02 1234567', 'Via Roma 123, Milano', 'https://www.fornitureartigianali.it', 'Fornitore principale di materiali di base', NOW(), NOW()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Tessuti & Filati', 'Laura Bianchi', 'ordini@tessutifilati.it', '+39 06 7654321', 'Via Nazionale 45, Roma', 'https://www.tessutifilati.it', 'Specializzato in tessuti di alta qualità', NOW(), NOW()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Legno Pregiato SpA', 'Giovanni Verdi', 'vendite@legnopregiato.it', '+39 011 9876543', 'Corso Vittorio 78, Torino', 'https://www.legnopregiato.it', 'Fornitore di legni pregiati e materiali per lavorazione', NOW(), NOW());

-- Insert materials
INSERT INTO materials (id, name, description, sku, unit_of_measure, cost_per_unit, current_stock, min_stock_level, supplier_id, created_at, updated_at)
VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cotone organico', 'Cotone 100% organico certificato', 'MAT001', 'metro', 5.50, 150.00, 50.00, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW(), NOW()),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Lana merino', 'Lana merino di alta qualità', 'MAT002', 'kg', 25.00, 8.00, 10.00, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW(), NOW()), -- Sotto soglia
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Legno di noce', 'Legno di noce italiano stagionato', 'MAT003', 'mq', 45.00, 20.00, 5.00, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NOW(), NOW()),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Pelle conciata al vegetale', 'Pelle di alta qualità conciata al vegetale', 'MAT004', 'mq', 60.00, 3.00, 5.00, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW()), -- Sotto soglia
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Filo di cotone', 'Filo di cotone per cuciture resistenti', 'MAT005', 'bobina', 3.50, 100.00, 20.00, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW(), NOW());

-- Insert components
INSERT INTO components (id, name, description, sku, created_at, updated_at)
VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Manico in pelle', 'Manico in pelle per borse', 'COMP001', NOW(), NOW()),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Cerniera metallica', 'Cerniera in metallo di alta qualità', 'COMP002', NOW(), NOW()),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Bottone in legno', 'Bottone decorativo in legno di noce', 'COMP003', NOW(), NOW()),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Fodera in cotone', 'Fodera interna in cotone', 'COMP004', NOW(), NOW());

-- Insert component materials
INSERT INTO component_materials (id, component_id, material_id, quantity, use_material_cost, created_at, updated_at)
VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 0.25, TRUE, NOW(), NOW()),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 0.05, TRUE, NOW(), NOW()),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 0.5, TRUE, NOW(), NOW());

-- Insert product models
INSERT INTO product_models (id, name, description, sku, production_cost, selling_price, labor_time_minutes, created_at, updated_at)
VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Borsa Tote', 'Borsa tote in cotone organico', 'MOD001', 35.00, 89.00, 120, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Portafoglio in pelle', 'Portafoglio artigianale in pelle conciata al vegetale', 'MOD002', 25.00, 65.00, 90, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sciarpa in lana', 'Sciarpa in lana merino lavorata a mano', 'MOD003', 20.00, 55.00, 60, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Borsa a tracolla', 'Borsa a tracolla in pelle e cotone', 'MOD004', 45.00, 120.00, 180, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Portachiavi in legno', 'Portachiavi artigianale in legno di noce', 'MOD005', 10.00, 25.00, 30, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Tavolo Rustico', 'Tavolo in legno massello stile rustico', 'WFYEDAVU', 250.00, 599.00, 480, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Sedia Moderna', 'Sedia design moderno in legno e metallo', 'SDMD001', 85.00, 199.00, 120, NOW(), NOW()),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Lampada Artigianale', 'Lampada da tavolo in legno e tessuto', 'LMPT001', 45.00, 129.00, 90, NOW(), NOW());

-- Insert model materials (direct materials used in models)
INSERT INTO model_materials (id, model_id, material_id, quantity, created_at, updated_at)
VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2.00, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1.00, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 0.50, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 0.75, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1.50, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 0.75, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 0.20, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 5.00, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1.50, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 0.25, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 0.50, NOW(), NOW()),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1.00, NOW(), NOW());

-- Insert model components
INSERT INTO model_components (id, model_id, component_id, quantity, created_at, updated_at)
VALUES
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, NOW(), NOW()),
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1, NOW(), NOW()),
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, NOW(), NOW()),
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 3, NOW(), NOW()),
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, NOW(), NOW()),
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, NOW(), NOW()),
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, NOW(), NOW());

-- Insert inventory items (ogni modello ha al massimo un solo articolo in magazzino)
INSERT INTO inventory_items (id, model_id, quantity, production_date, notes, created_at, updated_at)
VALUES
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 10, NOW() - INTERVAL '7 days', 'Lotto produzione #A123', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 15, NOW() - INTERVAL '14 days', 'Lotto produzione #B456', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 8, NOW() - INTERVAL '21 days', 'Lotto produzione #C789', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 5, NOW() - INTERVAL '5 days', 'Lotto produzione #D012', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 20, NOW() - INTERVAL '3 days', 'Lotto produzione #E345', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 3, NOW() - INTERVAL '10 days', 'Lotto produzione #F678', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 12, NOW() - INTERVAL '8 days', 'Lotto produzione #G901', NOW(), NOW()),
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 7, NOW() - INTERVAL '4 days', 'Lotto produzione #H234', NOW(), NOW());

-- Insert customers
INSERT INTO customers (id, name, customer_type, contact_person, email, phone, address, notes, created_at, updated_at)
VALUES
    ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Boutique Artigianale', 'store', 'Francesca Neri', 'ordini@boutiqueartigianale.it', '+39 02 9876543', 'Via Montenapoleone 12, Milano', 'Cliente regolare, ordini mensili', NOW(), NOW()),
    ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Mario Bianchi', 'private', NULL, 'mario.bianchi@email.it', '+39 333 1234567', 'Via Garibaldi 45, Firenze', 'Cliente privato, preferisce prodotti in pelle', NOW(), NOW()),
    ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Artigianato Online', 'online', 'Luca Verdi', 'acquisti@artigianatoonline.it', '+39 06 5551234', 'Via del Corso 78, Roma', 'Marketplace online, commissione 15%', NOW(), NOW()),
    ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Negozio Eco-Friendly', 'store', 'Giulia Rossi', 'info@ecofriendly.it', '+39 055 7654321', 'Via dei Fiori 23, Firenze', 'Negozio specializzato in prodotti ecologici', NOW(), NOW()),
    ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Lucia Verdi', 'private', NULL, 'lucia.verdi@email.it', '+39 345 9876543', 'Via Roma 56, Torino', 'Cliente privato, preferisce prodotti in lana', NOW(), NOW());

-- Insert transactions (purchases)
INSERT INTO transactions (id, transaction_type, date, supplier_id, customer_id, total_amount, status, notes, created_at, updated_at)
VALUES
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'purchase', NOW() - INTERVAL '60 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 550.00, 'completed', 'Ordine trimestrale tessuti', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'purchase', NOW() - INTERVAL '45 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 900.00, 'completed', 'Rifornimento legno', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'purchase', NOW() - INTERVAL '30 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 600.00, 'completed', 'Ordine pelle e accessori', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'purchase', NOW() - INTERVAL '15 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 275.00, 'completed', 'Rifornimento lana merino', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'purchase', NOW() - INTERVAL '7 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 300.00, 'pending', 'Ordine urgente pelle', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'purchase', NOW() - INTERVAL '3 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 175.00, 'pending', 'Rifornimento cotone organico', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'purchase', NOW() - INTERVAL '20 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 1200.00, 'completed', 'Ordine legno per tavoli', NOW(), NOW()),
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'purchase', NOW() - INTERVAL '18 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 450.00, 'completed', 'Ordine pelle per sedie', NOW(), NOW());

-- Insert transaction items for purchases
INSERT INTO transaction_items (id, transaction_id, material_id, product_model_id, quantity, unit_price, created_at, updated_at)
VALUES
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 50.00, 5.50, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 10.00, 25.00, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 20.00, 45.00, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, 10.00, 60.00, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 11.00, 25.00, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, 5.00, 60.00, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 25.00, 5.50, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', NULL, 10.00, 3.50, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 25.00, 45.00, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', NULL, 15.00, 3.50, NOW(), NOW()),
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, 7.50, 60.00, NOW(), NOW());

-- Insert transactions (sales)
INSERT INTO transactions (id, transaction_type, date, supplier_id, customer_id, total_amount, status, notes, created_at, updated_at)
VALUES
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sale', NOW() - INTERVAL '40 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 445.00, 'completed', 'Ordine mensile boutique', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'sale', NOW() - INTERVAL '35 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 65.00, 'completed', 'Ordine cliente privato', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'sale', NOW() - INTERVAL '30 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 267.00, 'completed', 'Ordine marketplace online', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'sale', NOW() - INTERVAL '25 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 240.00, 'completed', 'Ordine negozio eco-friendly', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'sale', NOW() - INTERVAL '20 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 110.00, 'completed', 'Ordine cliente privato', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'sale', NOW() - INTERVAL '15 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 356.00, 'completed', 'Secondo ordine mensile boutique', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'sale', NOW() - INTERVAL '10 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 120.00, 'completed', 'Ordine regalo cliente privato', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'sale', NOW() - INTERVAL '5 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 178.00, 'pending', 'Ordine marketplace online', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'sale', NOW() - INTERVAL '3 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 89.00, 'pending', 'Ordine urgente negozio eco-friendly', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'sale', NOW() - INTERVAL '1 day', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 275.00, 'pending', 'Ordine speciale boutique', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'sale', NOW() - INTERVAL '28 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 599.00, 'completed', 'Vendita tavolo rustico', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'sale', NOW() - INTERVAL '22 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1198.00, 'completed', 'Vendita due tavoli rustici', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'sale', NOW() - INTERVAL '18 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 398.00, 'completed', 'Vendita due sedie moderne', NOW(), NOW()),
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'sale', NOW() - INTERVAL '12 days', NULL, 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 258.00, 'completed', 'Vendita due lampade artigianali', NOW(), NOW());

-- Insert transaction items for sales
INSERT INTO transaction_items (id, transaction_id, material_id, product_model_id, quantity, unit_price, created_at, updated_at)
VALUES
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 89.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, 65.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, 89.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 2, 120.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2, 55.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, 89.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1, 120.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2, 65.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 2, 25.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 89.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 2, 120.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, 25.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, 55.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 599.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 2, 599.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 2, 199.00, NOW(), NOW()),
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', NULL, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 2, 129.00, NOW(), NOW());

-- Insert a user for testing
INSERT INTO users (id, username, email, password, created_at, updated_at)
VALUES
    ('n0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'admin@craftinventory.com', '$2a$10$xVCf4Uu3qQaKPoG2rjVtR.1yU/fVQj8UwZOIZx3zEZHmRlO9K0.Uy', NOW(), NOW()); -- Password: admin123