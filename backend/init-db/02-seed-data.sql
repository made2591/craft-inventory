-- Seed data for testing purposes

-- Insert suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, address, website, notes, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Forniture Artigianali Srl', 'Marco Rossi', 'info@fornitureartigianali.it', '+39 02 1234567', 'Via Roma 123, Milano', 'https://www.fornitureartigianali.it', 'Fornitore principale di materiali di base', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Tessuti & Filati', 'Laura Bianchi', 'ordini@tessutifilati.it', '+39 06 7654321', 'Via Nazionale 45, Roma', 'https://www.tessutifilati.it', 'Specializzato in tessuti di alta qualità', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Legno Pregiato SpA', 'Giovanni Verdi', 'vendite@legnopregiato.it', '+39 011 9876543', 'Corso Vittorio 78, Torino', 'https://www.legnopregiato.it', 'Fornitore di legni pregiati e materiali per lavorazione', NOW(), NOW());

-- Insert materials
INSERT INTO materials (id, name, description, sku, unit_of_measure, cost_per_unit, current_stock, min_stock_level, supplier_id, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cotone organico', 'Cotone 100% organico certificato', 'MAT001', 'metro', 5.50, 150.00, 50.00, '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lana merino', 'Lana merino di alta qualità', 'MAT002', 'kg', 25.00, 8.00, 10.00, '22222222-2222-2222-2222-222222222222', NOW(), NOW()), -- Sotto soglia
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Legno di noce', 'Legno di noce italiano stagionato', 'MAT003', 'mq', 45.00, 20.00, 5.00, '33333333-3333-3333-3333-333333333333', NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pelle conciata al vegetale', 'Pelle di alta qualità conciata al vegetale', 'MAT004', 'mq', 60.00, 3.00, 5.00, '11111111-1111-1111-1111-111111111111', NOW(), NOW()), -- Sotto soglia
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Filo di cotone', 'Filo di cotone per cuciture resistenti', 'MAT005', 'bobina', 3.50, 100.00, 20.00, '22222222-2222-2222-2222-222222222222', NOW(), NOW());

-- Insert components
INSERT INTO components (id, name, description, sku, created_at, updated_at)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Manico in pelle', 'Manico in pelle per borse', 'COMP001', NOW(), NOW()),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Cerniera metallica', 'Cerniera in metallo di alta qualità', 'COMP002', NOW(), NOW()),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Bottone in legno', 'Bottone decorativo in legno di noce', 'COMP003', NOW(), NOW()),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Fodera in cotone', 'Fodera interna in cotone', 'COMP004', NOW(), NOW());

-- Insert component materials
INSERT INTO component_materials (id, component_id, material_id, quantity, use_material_cost, created_at, updated_at)
VALUES
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 0.25, TRUE, NOW(), NOW()),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 0.05, TRUE, NOW(), NOW()),
    ('llllllll-llll-llll-llll-llllllllllll', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0.5, TRUE, NOW(), NOW());

-- Insert product models
INSERT INTO product_models (id, name, description, sku, production_cost, selling_price, labor_time_minutes, created_at, updated_at)
VALUES
    ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Borsa Tote', 'Borsa tote in cotone organico', 'MOD001', 35.00, 89.00, 120, NOW(), NOW()),
    ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'Portafoglio in pelle', 'Portafoglio artigianale in pelle conciata al vegetale', 'MOD002', 25.00, 65.00, 90, NOW(), NOW()),
    ('oooooooo-oooo-oooo-oooo-oooooooooooo', 'Sciarpa in lana', 'Sciarpa in lana merino lavorata a mano', 'MOD003', 20.00, 55.00, 60, NOW(), NOW()),
    ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'Borsa a tracolla', 'Borsa a tracolla in pelle e cotone', 'MOD004', 45.00, 120.00, 180, NOW(), NOW()),
    ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'Portachiavi in legno', 'Portachiavi artigianale in legno di noce', 'MOD005', 10.00, 25.00, 30, NOW(), NOW());

-- Insert model materials (direct materials used in models)
INSERT INTO model_materials (id, model_id, material_id, quantity, created_at, updated_at)
VALUES
    ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2.00, NOW(), NOW()),
    ('ssssssss-ssss-ssss-ssss-ssssssssssss', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1.00, NOW(), NOW()),
    ('tttttttt-tttt-tttt-tttt-tttttttttttt', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 0.50, NOW(), NOW()),
    ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0.75, NOW(), NOW()),
    ('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1.50, NOW(), NOW()),
    ('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 0.75, NOW(), NOW()),
    ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 0.20, NOW(), NOW());

-- Insert model components
INSERT INTO model_components (id, model_id, component_id, quantity, created_at, updated_at)
VALUES
    ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 2, NOW(), NOW()),
    ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 1, NOW(), NOW()),
    ('aaaaaaaa-1111-1111-1111-111111111111', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 1, NOW(), NOW()),
    ('bbbbbbbb-2222-2222-2222-222222222222', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 3, NOW(), NOW()),
    ('cccccccc-3333-3333-3333-333333333333', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1, NOW(), NOW()),
    ('dddddddd-4444-4444-4444-444444444444', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 1, NOW(), NOW()),
    ('eeeeeeee-5555-5555-5555-555555555555', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 1, NOW(), NOW());

-- Insert inventory items (ogni modello ha un solo articolo in magazzino)
INSERT INTO inventory_items (id, model_id, quantity, production_date, notes, created_at, updated_at)
VALUES
    ('ffffffff-6666-6666-6666-666666666666', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 10, NOW() - INTERVAL '7 days', 'Lotto produzione #A123', NOW(), NOW()),
    ('gggggggg-7777-7777-7777-777777777777', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 15, NOW() - INTERVAL '14 days', 'Lotto produzione #B456', NOW(), NOW()),
    ('hhhhhhhh-8888-8888-8888-888888888888', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 8, NOW() - INTERVAL '21 days', 'Lotto produzione #C789', NOW(), NOW()),
    ('iiiiiiii-9999-9999-9999-999999999999', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 5, NOW() - INTERVAL '5 days', 'Lotto produzione #D012', NOW(), NOW()),
    ('jjjjjjjj-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 20, NOW() - INTERVAL '3 days', 'Lotto produzione #E345', NOW(), NOW());

-- Insert customers
INSERT INTO customers (id, name, customer_type, contact_person, email, phone, address, notes, created_at, updated_at)
VALUES
    ('kkkkkkkk-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Boutique Artigianale', 'store', 'Francesca Neri', 'ordini@boutiqueartigianale.it', '+39 02 9876543', 'Via Montenapoleone 12, Milano', 'Cliente regolare, ordini mensili', NOW(), NOW()),
    ('llllllll-cccc-cccc-cccc-cccccccccccc', 'Mario Bianchi', 'private', NULL, 'mario.bianchi@email.it', '+39 333 1234567', 'Via Garibaldi 45, Firenze', 'Cliente privato, preferisce prodotti in pelle', NOW(), NOW()),
    ('mmmmmmmm-dddd-dddd-dddd-dddddddddddd', 'Artigianato Online', 'online', 'Luca Verdi', 'acquisti@artigianatoonline.it', '+39 06 5551234', 'Via del Corso 78, Roma', 'Marketplace online, commissione 15%', NOW(), NOW()),
    ('nnnnnnnn-eeee-eeee-eeee-eeeeeeeeeeee', 'Negozio Eco-Friendly', 'store', 'Giulia Rossi', 'info@ecofriendly.it', '+39 055 7654321', 'Via dei Fiori 23, Firenze', 'Negozio specializzato in prodotti ecologici', NOW(), NOW()),
    ('oooooooo-ffff-ffff-ffff-ffffffffffff', 'Lucia Verdi', 'private', NULL, 'lucia.verdi@email.it', '+39 345 9876543', 'Via Roma 56, Torino', 'Cliente privato, preferisce prodotti in lana', NOW(), NOW());

-- Insert transactions (purchases)
INSERT INTO transactions (id, transaction_type, date, supplier_id, customer_id, total_amount, status, notes, created_at, updated_at)
VALUES
    ('pppppppp-gggg-gggg-gggg-gggggggggggg', 'purchase', NOW() - INTERVAL '60 days', '22222222-2222-2222-2222-222222222222', NULL, 550.00, 'completed', 'Ordine trimestrale tessuti', NOW(), NOW()),
    ('qqqqqqqq-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'purchase', NOW() - INTERVAL '45 days', '33333333-3333-3333-3333-333333333333', NULL, 900.00, 'completed', 'Rifornimento legno', NOW(), NOW()),
    ('rrrrrrrr-iiii-iiii-iiii-iiiiiiiiiiii', 'purchase', NOW() - INTERVAL '30 days', '11111111-1111-1111-1111-111111111111', NULL, 600.00, 'completed', 'Ordine pelle e accessori', NOW(), NOW()),
    ('ssssssss-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'purchase', NOW() - INTERVAL '15 days', '22222222-2222-2222-2222-222222222222', NULL, 275.00, 'completed', 'Rifornimento lana merino', NOW(), NOW()),
    ('tttttttt-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'purchase', NOW() - INTERVAL '7 days', '11111111-1111-1111-1111-111111111111', NULL, 300.00, 'pending', 'Ordine urgente pelle', NOW(), NOW()),
    ('uuuuuuuu-llll-llll-llll-llllllllllll', 'purchase', NOW() - INTERVAL '3 days', '22222222-2222-2222-2222-222222222222', NULL, 175.00, 'pending', 'Rifornimento cotone organico', NOW(), NOW());

-- Insert transaction items for purchases
INSERT INTO transaction_items (id, transaction_id, material_id, product_model_id, quantity, unit_price, created_at, updated_at)
VALUES
    ('vvvvvvvv-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'pppppppp-gggg-gggg-gggg-gggggggggggg', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 50.00, 5.50, NOW(), NOW()),
    ('wwwwwwww-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'pppppppp-gggg-gggg-gggg-gggggggggggg', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 10.00, 25.00, NOW(), NOW()),
    ('xxxxxxxx-oooo-oooo-oooo-oooooooooooo', 'qqqqqqqq-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 20.00, 45.00, NOW(), NOW()),
    ('yyyyyyyy-pppp-pppp-pppp-pppppppppppp', 'rrrrrrrr-iiii-iiii-iiii-iiiiiiiiiiii', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 10.00, 60.00, NOW(), NOW()),
    ('zzzzzzzz-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'ssssssss-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 11.00, 25.00, NOW(), NOW()),
    ('aaaaaaaa-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'tttttttt-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 5.00, 60.00, NOW(), NOW()),
    ('bbbbbbbb-ssss-ssss-ssss-ssssssssssss', 'uuuuuuuu-llll-llll-llll-llllllllllll', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 25.00, 5.50, NOW(), NOW()),
    ('cccccccc-tttt-tttt-tttt-tttttttttttt', 'uuuuuuuu-llll-llll-llll-llllllllllll', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 10.00, 3.50, NOW(), NOW());

-- Insert transactions (sales)
INSERT INTO transactions (id, transaction_type, date, supplier_id, customer_id, total_amount, status, notes, created_at, updated_at)
VALUES
    ('dddddddd-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'sale', NOW() - INTERVAL '40 days', NULL, 'kkkkkkkk-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 445.00, 'completed', 'Ordine mensile boutique', NOW(), NOW()),
    ('eeeeeeee-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'sale', NOW() - INTERVAL '35 days', NULL, 'llllllll-cccc-cccc-cccc-cccccccccccc', 65.00, 'completed', 'Ordine cliente privato', NOW(), NOW()),
    ('ffffffff-wwww-wwww-wwww-wwwwwwwwwwww', 'sale', NOW() - INTERVAL '30 days', NULL, 'mmmmmmmm-dddd-dddd-dddd-dddddddddddd', 267.00, 'completed', 'Ordine marketplace online', NOW(), NOW()),
    ('gggggggg-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'sale', NOW() - INTERVAL '25 days', NULL, 'nnnnnnnn-eeee-eeee-eeee-eeeeeeeeeeee', 240.00, 'completed', 'Ordine negozio eco-friendly', NOW(), NOW()),
    ('hhhhhhhh-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'sale', NOW() - INTERVAL '20 days', NULL, 'oooooooo-ffff-ffff-ffff-ffffffffffff', 110.00, 'completed', 'Ordine cliente privato', NOW(), NOW()),
    ('iiiiiiii-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'sale', NOW() - INTERVAL '15 days', NULL, 'kkkkkkkk-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 356.00, 'completed', 'Secondo ordine mensile boutique', NOW(), NOW()),
    ('jjjjjjjj-1111-1111-1111-111111111111', 'sale', NOW() - INTERVAL '10 days', NULL, 'llllllll-cccc-cccc-cccc-cccccccccccc', 120.00, 'completed', 'Ordine regalo cliente privato', NOW(), NOW()),
    ('kkkkkkkk-2222-2222-2222-222222222222', 'sale', NOW() - INTERVAL '5 days', NULL, 'mmmmmmmm-dddd-dddd-dddd-dddddddddddd', 178.00, 'pending', 'Ordine marketplace online', NOW(), NOW()),
    ('llllllll-3333-3333-3333-333333333333', 'sale', NOW() - INTERVAL '3 days', NULL, 'nnnnnnnn-eeee-eeee-eeee-eeeeeeeeeeee', 89.00, 'pending', 'Ordine urgente negozio eco-friendly', NOW(), NOW()),
    ('mmmmmmmm-4444-4444-4444-444444444444', 'sale', NOW() - INTERVAL '1 day', NULL, 'kkkkkkkk-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 275.00, 'pending', 'Ordine speciale boutique', NOW(), NOW());

-- Insert transaction items for sales
INSERT INTO transaction_items (id, transaction_id, material_id, product_model_id, quantity, unit_price, created_at, updated_at)
VALUES
    ('nnnnnnnn-5555-5555-5555-555555555555', 'dddddddd-uuuu-uuuu-uuuu-uuuuuuuuuuuu', NULL, 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 5, 89.00, NOW(), NOW()),
    ('oooooooo-6666-6666-6666-666666666666', 'eeeeeeee-vvvv-vvvv-vvvv-vvvvvvvvvvvv', NULL, 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 1, 65.00, NOW(), NOW()),
    ('pppppppp-7777-7777-7777-777777777777', 'ffffffff-wwww-wwww-wwww-wwwwwwwwwwww', NULL, 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 3, 89.00, NOW(), NOW()),
    ('qqqqqqqq-8888-8888-8888-888888888888', 'gggggggg-xxxx-xxxx-xxxx-xxxxxxxxxxxx', NULL, 'pppppppp-pppp-pppp-pppp-pppppppppppp', 2, 120.00, NOW(), NOW()),
    ('rrrrrrrr-9999-9999-9999-999999999999', 'hhhhhhhh-yyyy-yyyy-yyyy-yyyyyyyyyyyy', NULL, 'oooooooo-oooo-oooo-oooo-oooooooooooo', 2, 55.00, NOW(), NOW()),
    ('ssssssss-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'iiiiiiii-zzzz-zzzz-zzzz-zzzzzzzzzzzz', NULL, 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 4, 89.00, NOW(), NOW()),
    ('tttttttt-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'jjjjjjjj-1111-1111-1111-111111111111', NULL, 'pppppppp-pppp-pppp-pppp-pppppppppppp', 1, 120.00, NOW(), NOW()),
    ('uuuuuuuu-cccc-cccc-cccc-cccccccccccc', 'kkkkkkkk-2222-2222-2222-222222222222', NULL, 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 2, 65.00, NOW(), NOW()),
    ('vvvvvvvv-dddd-dddd-dddd-dddddddddddd', 'kkkkkkkk-2222-2222-2222-222222222222', NULL, 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 2, 25.00, NOW(), NOW()),
    ('wwwwwwww-eeee-eeee-eeee-eeeeeeeeeeee', 'llllllll-3333-3333-3333-333333333333', NULL, 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 1, 89.00, NOW(), NOW()),
    ('xxxxxxxx-ffff-ffff-ffff-ffffffffffff', 'mmmmmmmm-4444-4444-4444-444444444444', NULL, 'pppppppp-pppp-pppp-pppp-pppppppppppp', 2, 120.00, NOW(), NOW()),
    ('yyyyyyyy-gggg-gggg-gggg-gggggggggggg', 'mmmmmmmm-4444-4444-4444-444444444444', NULL, 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 1, 25.00, NOW(), NOW()),
    ('zzzzzzzz-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'mmmmmmmm-4444-4444-4444-444444444444', NULL, 'oooooooo-oooo-oooo-oooo-oooooooooooo', 1, 55.00, NOW(), NOW());

-- Insert a user for testing
INSERT INTO users (id, username, email, password, created_at, updated_at)
VALUES
    ('99999999-9999-9999-9999-999999999999', 'admin', 'admin@craftinventory.com', '$2a$10$xVCf4Uu3qQaKPoG2rjVtR.1yU/fVQj8UwZOIZx3zEZHmRlO9K0.Uy', NOW(), NOW()); -- Password: admin123