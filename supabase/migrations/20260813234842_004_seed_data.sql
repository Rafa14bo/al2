/*
# Alisson Lanches - Seed Data

Inserts initial data:
- Store settings (single row)
- Payment settings (single row)
- Business hours (all 7 days)
- Categories (Mais pedidos, Lanches, Bauru, Hambúrgueres, Combos, Porções, Bebidas, Adicionais)
- Example products with images (marked is_example = true)
- Example addon groups and addons
- Example delivery zones

All products are clearly marked as EXAMPLE and can be deleted by admin.
No real prices, PIX keys, or delivery fees are invented — admin configures those.
*/

-- STORE SETTINGS (single row)
INSERT INTO store_settings (id, store_name, logo_url, phone, whatsapp, address_street, address_neighborhood, address_city, address_state, address_zip, maps_url, description, rating, review_count, is_temporarily_closed, primary_color, secondary_color)
SELECT gen_random_uuid(), 'Alisson Lanches', '', '(17) 98146-7315', '5517981467315', 'Rua 3 de Outubro, 62', 'Derby Clube', 'Barretos', 'SP', '14787-187', 'https://maps.app.goo.gl/FPZJGGSdgLcUPGEAA', 'Desde 2015 levando sabor para Barretos.', 4.7, 206, false, '#F40A0B', '#FEEF20'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- PAYMENT SETTINGS (single row)
INSERT INTO payment_settings (id, pix_enabled, pix_key, pix_key_type, pix_receiver_name, pix_instructions, pix_qr_code_url, card_enabled, card_credit, card_debit, card_instructions, cash_enabled, cash_change_available)
SELECT gen_random_uuid(), false, '', 'cpf', '', '', '', false, false, false, '', true, true
WHERE NOT EXISTS (SELECT 1 FROM payment_settings);

-- BUSINESS HOURS (all 7 days, 0=Sunday to 6=Saturday)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 0, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 0);
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 1, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 1);
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 2, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 2);
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 3, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 3);
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 4, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 4);
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 5, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 5);
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
SELECT 6, true, '18:00', '23:59'
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE day_of_week = 6);

-- CATEGORIES
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Mais pedidos', 'mais-pedidos', 0, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mais-pedidos');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Lanches', 'lanches', 1, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lanches');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Bauru', 'bauru', 2, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'bauru');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Hambúrgueres', 'hamburgueres', 3, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hamburgueres');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Combos', 'combos', 4, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'combos');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Porções', 'porcoes', 5, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'porcoes');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Bebidas', 'bebidas', 6, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'bebidas');
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Adicionais', 'adicionais', 7, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'adicionais');

-- ADDON GROUP
INSERT INTO addon_groups (id, name, is_required, min_quantity, max_quantity, sort_order)
SELECT gen_random_uuid(), 'Escolha seus adicionais', false, 0, 5, 0
WHERE NOT EXISTS (SELECT 1 FROM addon_groups WHERE name = 'Escolha seus adicionais');

-- PRODUCT ADDONS (linked to the addon group above)
INSERT INTO product_addons (addon_group_id, name, price, is_available, sort_order)
SELECT ag.id, 'Catupiry', 3.00, true, 0 FROM addon_groups ag WHERE ag.name = 'Escolha seus adicionais'
AND NOT EXISTS (SELECT 1 FROM product_addons pa WHERE pa.addon_group_id = ag.id AND pa.name = 'Catupiry');

INSERT INTO product_addons (addon_group_id, name, price, is_available, sort_order)
SELECT ag.id, 'Queijo extra', 2.50, true, 1 FROM addon_groups ag WHERE ag.name = 'Escolha seus adicionais'
AND NOT EXISTS (SELECT 1 FROM product_addons pa WHERE pa.addon_group_id = ag.id AND pa.name = 'Queijo extra');

INSERT INTO product_addons (addon_group_id, name, price, is_available, sort_order)
SELECT ag.id, 'Bacon', 3.50, true, 2 FROM addon_groups ag WHERE ag.name = 'Escolha seus adicionais'
AND NOT EXISTS (SELECT 1 FROM product_addons pa WHERE pa.addon_group_id = ag.id AND pa.name = 'Bacon');

INSERT INTO product_addons (addon_group_id, name, price, is_available, sort_order)
SELECT ag.id, 'Molho especial', 1.50, true, 3 FROM addon_groups ag WHERE ag.name = 'Escolha seus adicionais'
AND NOT EXISTS (SELECT 1 FROM product_addons pa WHERE pa.addon_group_id = ag.id AND pa.name = 'Molho especial');

-- EXAMPLE PRODUCTS (all marked is_example = true)
-- Lanches category
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-Salada (EXEMPLO)', 'Hambúrguer, alface, tomate, queijo e maionese.', 18.00, 'https://images.pexels.com/photos/2469096/pexels-photo-2469096.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 0, true
FROM categories c WHERE c.slug = 'lanches'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'X-Salada (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-Bacon (EXEMPLO)', 'Hambúrguer, bacon crocante, queijo, alface e tomate.', 22.00, 'https://images.pexels.com/photos/4315148/pexels-photo-4315148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 1, true
FROM categories c WHERE c.slug = 'lanches'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'X-Bacon (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-Tudo (EXEMPLO)', 'Hambúrguer, bacon, ovo, queijo, alface, tomate e batata palha.', 28.00, 'https://images.pexels.com/photos/36691286/pexels-photo-36691286.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 2, true
FROM categories c WHERE c.slug = 'lanches'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'X-Tudo (EXEMPLO)');

-- Bauru category
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Bauru Simples (EXEMPLO)', 'Pão, rosbife, queijo, tomate e picles.', 16.00, 'https://images.pexels.com/photos/263103/pexels-photo-263103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 0, true
FROM categories c WHERE c.slug = 'bauru'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Bauru Simples (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Bauru Especial (EXEMPLO)', 'Pão, rosbife, queijo derretido, tomate, picles e molho da casa.', 22.00, 'https://images.pexels.com/photos/11256670/pexels-photo-11256670.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 1, true
FROM categories c WHERE c.slug = 'bauru'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Bauru Especial (EXEMPLO)');

-- Hambúrgueres category
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Hambúrguer Artesanal (EXEMPLO)', 'Pão brioche, blend 150g, cheddar e cebola caramelizada.', 25.00, 'https://images.pexels.com/photos/5374420/pexels-photo-5374420.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 0, true
FROM categories c WHERE c.slug = 'hamburgueres'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Hambúrguer Artesanal (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Cheeseburger Duplo (EXEMPLO)', 'Dois blends 100g, cheddar duplo, picles e molho especial.', 28.00, 'https://images.pexels.com/photos/8162589/pexels-photo-8162589.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 1, true
FROM categories c WHERE c.slug = 'hamburgueres'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Cheeseburger Duplo (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Burger Defumado (EXEMPLO)', 'Pão, blend 180g defumado, queijo prato e cebola roxa.', 30.00, 'https://images.pexels.com/photos/3727243/pexels-photo-3727243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 2, true
FROM categories c WHERE c.slug = 'hamburgueres'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Burger Defumado (EXEMPLO)');

-- Combos category
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Combo Individual (EXEMPLO)', 'X-Salada + batata frita + refrigerante lata.', 32.00, 'https://images.pexels.com/photos/20854973/pexels-photo-20854973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 0, true
FROM categories c WHERE c.slug = 'combos'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Combo Individual (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Combo Casal (EXEMPLO)', '2 X-Bacon + 2 batatas fritas + 2 refrigerantes lata.', 58.00, 'https://images.pexels.com/photos/20042203/pexels-photo-20042203.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, true, 1, true
FROM categories c WHERE c.slug = 'combos'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Combo Casal (EXEMPLO)');

-- Porções category
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Batata Frita (EXEMPLO)', 'Porção de batata frita crocante com molho.', 15.00, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 0, true
FROM categories c WHERE c.slug = 'porcoes'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Batata Frita (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Batata com Bacon (EXEMPLO)', 'Porção de batata frita com bacon e cheddar.', 22.00, 'https://images.pexels.com/photos/5860680/pexels-photo-5860680.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 1, true
FROM categories c WHERE c.slug = 'porcoes'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Batata com Bacon (EXEMPLO)');

-- Bebidas category
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Refrigerante Lata (EXEMPLO)', 'Refrigerante lata 350ml (sabor a escolher).', 6.00, 'https://images.pexels.com/photos/6920721/pexels-photo-6920721.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 0, true
FROM categories c WHERE c.slug = 'bebidas'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Refrigerante Lata (EXEMPLO)');

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Milkshake (EXEMPLO)', 'Milkshake cremoso 400ml (sabores: chocolate, morango, baunilha).', 12.00, 'https://images.pexels.com/photos/6463660/pexels-photo-6463660.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', c.id, true, false, 1, true
FROM categories c WHERE c.slug = 'bebidas'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Milkshake (EXEMPLO)');

-- Link example products to the addon group
INSERT INTO product_addon_group_links (product_id, addon_group_id)
SELECT p.id, ag.id FROM products p, addon_groups ag 
WHERE ag.name = 'Escolha seus adicionais'
AND p.category_id IN (SELECT id FROM categories WHERE slug IN ('lanches', 'hamburgueres', 'combos'))
AND NOT EXISTS (SELECT 1 FROM product_addon_group_links l WHERE l.product_id = p.id AND l.addon_group_id = ag.id);

-- EXAMPLE DELIVERY ZONE (clearly marked, admin should configure real ones)
INSERT INTO delivery_zones (name, delivery_fee, min_order, estimated_time, is_active)
SELECT 'Exemplo — configure sua zona', 0, 0, '30-45 min', false
WHERE NOT EXISTS (SELECT 1 FROM delivery_zones);
