/*
# Cardápio real do Alisson Lanches

Remove os produtos de exemplo (is_example = true) e as categorias
genéricas do modelo inicial, e insere o cardápio real extraído do PDF
fornecido pelo Alisson.

Nenhuma foto foi inventada: image_url fica vazio ('') em todo produto
sem imagem real — o site mostra um ícone de prato no lugar até o Alisson
subir as fotos de verdade pelo painel admin.

## Uma decisão que tomei (fico à disposição pra ajustar)
O PDF tem 3 itens (Misto-quente, Vegetariano, Moda da casa) sem um
cabeçalho de categoria visível antes deles. Criei uma categoria
"Especiais" pra esses três — se o Alisson preferir outro nome/organização,
é só me falar que eu ajusto.

## Também não migrado automaticamente
- O item "Guaraná 600ml ant." não tem preço no PDF (aparece "——"), então
  não foi inserido.
- A observação "Lanches montados cobramos 2,00 reais a mais" é uma regra
  de negócio sobre montar lanche personalizado, que o sistema não modela
  hoje — fica como aviso pro Alisson comunicar aos clientes manualmente
  (ex: no campo de observações do pedido).
*/

-- ============================================================
-- 1. Remover produtos de exemplo (seguro: pedidos antigos guardam
--    nome/preço próprios e não dependem do produto continuar existindo)
-- ============================================================
DELETE FROM products WHERE is_example = true;

-- ============================================================
-- 2. Remover o grupo de adicionais de exemplo (será substituído
--    pela lista real de "Opcionais" do Alisson)
-- ============================================================
DELETE FROM addon_groups WHERE name = 'Escolha seus adicionais';

-- ============================================================
-- 3. Remover categorias antigas que não existem no cardápio real
--    (seguro: já não têm produtos depois do passo 1)
-- ============================================================
DELETE FROM categories WHERE slug IN ('bauru', 'hamburgueres', 'combos', 'porcoes', 'adicionais');

-- ============================================================
-- 4. Renomear "Bebidas" para o nome usado no cardápio real
-- ============================================================
UPDATE categories SET name = 'Refrigerantes, Águas e Sucos', sort_order = 6 WHERE slug = 'bebidas';

-- ============================================================
-- 5. Criar as categorias reais do cardápio
-- ============================================================
INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Lanches com Salsicha', 'lanches-com-salsicha', 1, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lanches-com-salsicha');

INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Lanches com Hambúrguer', 'lanches-com-hamburguer', 2, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lanches-com-hamburguer');

INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Lanches com Hamb. Artesanal', 'lanches-com-hamb-artesanal', 3, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lanches-com-hamb-artesanal');

INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Lanches com Frango', 'lanches-com-frango', 4, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lanches-com-frango');

INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Lanches com Contra-filé', 'lanches-com-contra-file', 5, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lanches-com-contra-file');

INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Especiais', 'especiais', 6, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'especiais');

INSERT INTO categories (name, slug, sort_order, is_active)
SELECT 'Cervejas', 'cervejas', 8, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'cervejas');

-- ============================================================
-- 6. PRODUTOS — Lanches com Salsicha
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Cachorro quente simples', 'Pão de hambúrguer, salsicha, batata palha, milho, alface, tomate, catchup e maionese caseira.', 16.00, '', c.id, true, false, 0, false
FROM categories c WHERE c.slug = 'lanches-com-salsicha';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Hot dog', 'Pão de hambúrguer, salsicha, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 19.00, '', c.id, true, false, 1, false
FROM categories c WHERE c.slug = 'lanches-com-salsicha';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Cachorro quente especial', 'Pão de hambúrguer, salsicha, muçarela, presunto, ovo, batata palha, milho, alface, tomate, catchup e maionese caseira.', 20.00, '', c.id, true, false, 2, false
FROM categories c WHERE c.slug = 'lanches-com-salsicha';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Cachorro quente bacon', 'Pão de hambúrguer, salsicha, muçarela, presunto, bacon extra, batata palha, milho, alface, tomate, catchup e maionese caseira.', 22.00, '', c.id, true, false, 3, false
FROM categories c WHERE c.slug = 'lanches-com-salsicha';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Super cachorro quente', 'Pão de hambúrguer, duas salsichas, muçarela, presunto, bacon, ovo, batata palha, milho, alface, tomate, catchup e maionese caseira.', 26.00, '', c.id, true, true, 4, false
FROM categories c WHERE c.slug = 'lanches-com-salsicha';

-- ============================================================
-- 7. PRODUTOS — Lanches com Hambúrguer
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Hambúrguer', 'Pão de hambúrguer, hambúrguer, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 22.00, '', c.id, true, false, 0, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-salada', 'Pão de hambúrguer, palmito, hambúrguer, muçarela, presunto, batata palha, milho, alface extra, tomate extra, catchup e maionese caseira.', 24.00, '', c.id, true, true, 1, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-egg', 'Pão de hambúrguer, 2 ovos, hambúrguer, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 24.00, '', c.id, true, false, 2, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-bacon', 'Pão de hambúrguer, bacon extra, hambúrguer, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 27.00, '', c.id, true, true, 3, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-tudo', 'Pão de hambúrguer, hambúrguer, muçarela, presunto, bacon, ovo, salsicha, batata palha, milho, alface, tomate, catchup e maionese caseira.', 29.00, '', c.id, true, true, 4, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-burguer', 'Pão de hambúrguer, bacon, dois hambúrgueres, muçarela, presunto, ovo, batata palha, milho, catchup e maionese caseira.', 29.00, '', c.id, true, false, 5, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-tudo duplo', 'Pão de hambúrguer, bacon extra, dois hambúrgueres, muçarela, presunto, ovo, duas salsichas, batata palha, milho, alface, tomate, catchup e maionese caseira.', 34.00, '', c.id, true, false, 6, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-tudo catupiry', 'Pão de hambúrguer, catupiry, hambúrguer, muçarela, presunto, bacon, ovo, salsicha, batata palha, milho, alface, tomate, catchup e maionese caseira.', 34.00, '', c.id, true, false, 7, false
FROM categories c WHERE c.slug = 'lanches-com-hamburguer';

-- ============================================================
-- 8. PRODUTOS — Lanches com Hamb. Artesanal
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Classic Burguer', 'Pão de hambúrguer, hambúrguer artesanal 160g, muçarela, alface, tomate, catchup e maionese caseira.', 28.00, '', c.id, true, false, 0, false
FROM categories c WHERE c.slug = 'lanches-com-hamb-artesanal';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Classic Burguer 2', 'Pão de hambúrguer, hambúrguer artesanal 160g, cheddar, alface, tomate, catchup e maionese caseira.', 28.00, '', c.id, true, false, 1, false
FROM categories c WHERE c.slug = 'lanches-com-hamb-artesanal';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Burguer bacon', 'Pão de hambúrguer, hambúrguer artesanal 160g, muçarela, bacon, cebola roxa, alface, tomate, catchup e maionese caseira.', 37.00, '', c.id, true, true, 2, false
FROM categories c WHERE c.slug = 'lanches-com-hamb-artesanal';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Burguer bacon 2', 'Pão de hambúrguer, hambúrguer artesanal 160g, cheddar, bacon, cebola roxa, alface, tomate, catchup e maionese caseira.', 37.00, '', c.id, true, false, 3, false
FROM categories c WHERE c.slug = 'lanches-com-hamb-artesanal';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Duplo Burguer', 'Pão de hambúrguer, 2 hambúrgueres artesanais 160g, duplo queijo muçarela, bacon, cebola roxa, alface, tomate, catchup e maionese caseira.', 47.00, '', c.id, true, false, 4, false
FROM categories c WHERE c.slug = 'lanches-com-hamb-artesanal';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Duplo Cheddar', 'Pão de hambúrguer, 2 hambúrgueres artesanais 160g, duplo queijo cheddar, bacon, cebola roxa, alface, tomate, catchup e maionese caseira.', 47.00, '', c.id, true, false, 5, false
FROM categories c WHERE c.slug = 'lanches-com-hamb-artesanal';

-- ============================================================
-- 9. PRODUTOS — Lanches com Frango
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'X-frango', 'Pão de hambúrguer, filé de frango, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 25.00, '', c.id, true, true, 0, false
FROM categories c WHERE c.slug = 'lanches-com-frango';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Frango-salada', 'Pão de hambúrguer, palmito picado, filé de frango, muçarela, presunto, batata palha, milho, alface extra, tomate extra, catchup e maionese caseira.', 26.00, '', c.id, true, false, 1, false
FROM categories c WHERE c.slug = 'lanches-com-frango';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Frango-egg', 'Pão de hambúrguer, dois ovos, filé de frango, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 26.00, '', c.id, true, false, 2, false
FROM categories c WHERE c.slug = 'lanches-com-frango';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Frango-bacon', 'Pão de hambúrguer, bacon extra, filé de frango, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 29.00, '', c.id, true, false, 3, false
FROM categories c WHERE c.slug = 'lanches-com-frango';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Frango-catupiry', 'Pão de hambúrguer, catupiry extra, filé de frango picado, muçarela, presunto, bacon, batata palha, milho, alface, tomate, catchup e maionese caseira.', 35.00, '', c.id, true, false, 4, false
FROM categories c WHERE c.slug = 'lanches-com-frango';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Frango-tudo', 'Pão de hambúrguer, filé de frango, catupiry, muçarela, presunto, bacon, ovo, salsicha, batata palha, milho, alface, tomate, catchup e maionese caseira.', 37.00, '', c.id, true, false, 5, false
FROM categories c WHERE c.slug = 'lanches-com-frango';

-- ============================================================
-- 10. PRODUTOS — Lanches com Contra-filé
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Filé-salada', 'Pão de hambúrguer, palmito picado, contrafilé picado, muçarela, presunto, batata palha, milho, alface extra, tomate extra, catchup e maionese caseira.', 33.00, '', c.id, true, false, 0, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Filé-egg', 'Pão de hambúrguer, dois ovos, contrafilé picado, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 33.00, '', c.id, true, false, 1, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Filé-bacon', 'Pão de hambúrguer, bacon extra, contrafilé picado, muçarela, presunto, batata palha, milho, alface, tomate, catchup e maionese caseira.', 37.00, '', c.id, true, false, 2, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Filé-catupiry', 'Pão de hambúrguer, catupiry extra, contrafilé picado, muçarela, presunto, bacon, batata palha, milho, alface, tomate, catchup e maionese caseira.', 40.00, '', c.id, true, false, 3, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Filé-tudo', 'Pão de hambúrguer, contrafilé picado, catupiry, muçarela, presunto, bacon, ovo, salsicha, batata palha, milho, alface, tomate, catchup e maionese caseira.', 42.00, '', c.id, true, true, 4, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Bauru', 'Pão francês, contrafilé, cebola, tomate, muçarela, presunto, catchup e maionese caseira.', 33.00, '', c.id, true, false, 5, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Americano', 'Pão francês, contrafilé, ovo, tomate, muçarela, presunto, catchup e maionese caseira.', 33.00, '', c.id, true, false, 6, false
FROM categories c WHERE c.slug = 'lanches-com-contra-file';

-- ============================================================
-- 11. PRODUTOS — Especiais
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Misto-quente', 'Pão francês, três fatias de presunto, três fatias de muçarela, tomate, orégano, catchup e maionese caseira.', 24.00, '', c.id, true, false, 0, false
FROM categories c WHERE c.slug = 'especiais';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Vegetariano', 'Pão francês, três fatias de muçarela, cebola, catupiry, 2 ovos, alface extra, tomate extra, palmito, batata, catchup e maionese caseira.', 32.00, '', c.id, true, false, 1, false
FROM categories c WHERE c.slug = 'especiais';

INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Moda da casa', 'Pão de hambúrguer, contrafilé, filé de frango, hambúrguer, catupiry, muçarela, presunto, bacon, ovo, salsicha, batata palha, milho, alface, tomate, catchup e maionese caseira.', 52.00, '', c.id, true, true, 2, false
FROM categories c WHERE c.slug = 'especiais';

-- ============================================================
-- 12. PRODUTOS — Refrigerantes, Águas e Sucos
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Fanta Lata 350ml', '', 7.00, '', c.id, true, false, 0, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Coca-Cola Lata 350ml', '', 7.00, '', c.id, true, false, 1, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Guaraná Lata 350ml', '', 7.00, '', c.id, true, false, 2, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Schweppes Lata 350ml', '', 7.00, '', c.id, true, false, 3, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Sprite Lata 350ml', '', 7.00, '', c.id, true, false, 4, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Água Tônica Lata', '', 7.00, '', c.id, true, false, 5, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Guaraná 1L Antártica', '', 10.00, '', c.id, true, false, 6, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Coca-Cola 600ml', '', 8.00, '', c.id, true, false, 7, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Coca-Cola 1L', '', 11.00, '', c.id, true, false, 8, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Coca-Cola 2L', '', 16.00, '', c.id, true, false, 9, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Guaraná Poty 2L', '', 11.00, '', c.id, true, false, 10, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Fanta 2L', '', 14.00, '', c.id, true, false, 11, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Sprite 2L', '', 14.00, '', c.id, true, false, 12, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Água sem gás', '', 4.00, '', c.id, true, false, 13, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Água com gás', '', 5.00, '', c.id, true, false, 14, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Suco Kairós 300ml', '', 7.00, '', c.id, true, false, 15, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Suco Kairós 1L', '', 16.00, '', c.id, true, false, 16, false FROM categories c WHERE c.slug = 'bebidas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'H2Oh!', '', 8.00, '', c.id, true, false, 17, false FROM categories c WHERE c.slug = 'bebidas';

-- ============================================================
-- 13. PRODUTOS — Cervejas
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Sub Zero 350ml', '', 7.00, '', c.id, true, false, 0, false FROM categories c WHERE c.slug = 'cervejas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Brahma Lata 350ml', '', 7.00, '', c.id, true, false, 1, false FROM categories c WHERE c.slug = 'cervejas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Skol Lata 350ml', '', 7.00, '', c.id, true, false, 2, false FROM categories c WHERE c.slug = 'cervejas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Cristal Lata 350ml', '', 6.00, '', c.id, true, false, 3, false FROM categories c WHERE c.slug = 'cervejas';
INSERT INTO products (name, description, price, image_url, category_id, is_available, is_featured, sort_order, is_example)
SELECT 'Heineken Long Neck', '', 10.00, '', c.id, true, false, 4, false FROM categories c WHERE c.slug = 'cervejas';

-- ============================================================
-- 14. "Opcionais" — grupo de adicionais real, do PDF
-- ============================================================
INSERT INTO addon_groups (id, name, is_required, min_quantity, max_quantity, sort_order)
SELECT gen_random_uuid(), 'Opcionais', false, 0, 10, 0
WHERE NOT EXISTS (SELECT 1 FROM addon_groups WHERE name = 'Opcionais');

INSERT INTO product_addons (addon_group_id, name, price, is_available, sort_order)
SELECT ag.id, x.name, x.price, true, x.ord
FROM addon_groups ag,
(VALUES
  ('Pão extra', 3.00, 0),
  ('Maionese caseira', 1.00, 1),
  ('Catchup', 1.00, 2),
  ('Batata palha', 1.00, 3),
  ('Milho', 1.00, 4),
  ('Alface', 1.00, 5),
  ('Tomate', 1.00, 6),
  ('Ovo', 3.00, 7),
  ('Cebola', 3.00, 8),
  ('Salsicha', 3.00, 9),
  ('Hambúrguer artesanal 160g', 9.00, 10),
  ('Hambúrguer industrial', 5.00, 11),
  ('Palmito', 3.00, 12),
  ('Presunto', 4.00, 13),
  ('Muçarela', 5.00, 14),
  ('Bacon', 6.00, 15),
  ('Catupiry (1 porção)', 6.00, 16),
  ('Catupiry (1/2 porção)', 4.00, 17),
  ('Filé de frango', 9.00, 18),
  ('Contrafilé', 13.00, 19),
  ('Cheddar', 6.00, 20),
  ('Sachê catchup/mostarda Heinz', 0.25, 21)
) AS x(name, price, ord)
WHERE ag.name = 'Opcionais'
AND NOT EXISTS (SELECT 1 FROM product_addons pa WHERE pa.addon_group_id = ag.id AND pa.name = x.name);

-- Liga o grupo "Opcionais" a todos os lanches (não às bebidas/cervejas)
INSERT INTO product_addon_group_links (product_id, addon_group_id)
SELECT p.id, ag.id FROM products p, addon_groups ag
WHERE ag.name = 'Opcionais'
AND p.category_id IN (
  SELECT id FROM categories WHERE slug IN (
    'lanches-com-salsicha', 'lanches-com-hamburguer', 'lanches-com-hamb-artesanal',
    'lanches-com-frango', 'lanches-com-contra-file', 'especiais'
  )
)
AND NOT EXISTS (SELECT 1 FROM product_addon_group_links l WHERE l.product_id = p.id AND l.addon_group_id = ag.id);
