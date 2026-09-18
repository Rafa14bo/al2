/*
# Fix: vazamento de dados de pedidos e fraude de preço

## Problema 1 — Vazamento de PII
A policy "orders_select_own" (migration 003) permitia `user_id IS NULL`,
ou seja, QUALQUER pessoa (anon) conseguia ler TODOS os pedidos feitos como
convidado — nome, telefone, e-mail e endereço de cada cliente. Isso removia
esse acesso irrestrito e cria uma função seguray (SECURITY DEFINER) que só
devolve UM pedido específico, e apenas se quem perguntar souber o número
do pedido E o telefone usado nele (como qualquer app de delivery real).

## Problema 2 — Preço do pedido não era validado
O checkout envia subtotal/desconto/total calculados no navegador do
cliente, e o banco aceitava sem checar (WITH CHECK true). Isso permitia
enviar um total manipulado direto pela API, sem passar pelo site.
Criamos a função finalize_order(), chamada ao final do checkout, que
recalcula tudo a partir dos preços reais no banco (produtos, zona de
entrega, regras do cupom) e sobrescreve o que veio do cliente.

## Problema 3 (bônus) — Contagem de uso de cupom falhava silenciosamente
increment_coupon_usage() não era SECURITY DEFINER, então clientes comuns
(não-admin) não tinham permissão de UPDATE em coupons pela RLS, e a
função simplesmente não atualizava nada, sem erro visível.
*/

-- ============================================================
-- 1. Fechar o vazamento: remover o acesso geral a pedidos de convidado
-- ============================================================
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (
      o.user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    ))
  );

DROP POLICY IF EXISTS "order_item_addons_select_own" ON order_item_addons;
CREATE POLICY "order_item_addons_select_own" ON order_item_addons FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.id = order_item_id AND EXISTS (
      SELECT 1 FROM orders o WHERE o.id = oi.order_id AND (
        o.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    ))
  );

-- ============================================================
-- 2. Função segura para o convidado acompanhar o próprio pedido
--    (exige número do pedido + telefone cadastrado nele)
-- ============================================================
CREATE OR REPLACE FUNCTION get_guest_order_by_number(p_order_number int, p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_result jsonb;
BEGIN
  SELECT * INTO v_order
  FROM orders
  WHERE order_number = p_order_number
    AND user_id IS NULL
    AND regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g');

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(v_order) || jsonb_build_object(
    'order_items', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(oi) || jsonb_build_object(
          'order_item_addons', COALESCE((
            SELECT jsonb_agg(to_jsonb(oia))
            FROM order_item_addons oia
            WHERE oia.order_item_id = oi.id
          ), '[]'::jsonb)
        )
      )
      FROM order_items oi
      WHERE oi.order_id = v_order.id
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION get_guest_order_by_number(int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_guest_order_by_number(int, text) TO anon, authenticated;

-- ============================================================
-- 3. Travar o preço no servidor: recalcula tudo a partir do banco
-- ============================================================
CREATE OR REPLACE FUNCTION finalize_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_coupon coupons%ROWTYPE;
  v_zone delivery_zones%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Corrige o preço de cada item pelo preço REAL do produto no banco
  UPDATE order_items oi
  SET product_price = p.price
  FROM products p
  WHERE oi.order_id = p_order_id AND oi.product_id = p.id;

  -- Recalcula o subtotal: (preço do item + adicionais) * quantidade
  SELECT COALESCE(SUM((oi.product_price + COALESCE(addons.addons_total, 0)) * oi.quantity), 0)
  INTO v_subtotal
  FROM order_items oi
  LEFT JOIN (
    SELECT order_item_id, SUM(addon_price) AS addons_total
    FROM order_item_addons
    GROUP BY order_item_id
  ) addons ON addons.order_item_id = oi.id
  WHERE oi.order_id = p_order_id;

  -- Recalcula a taxa de entrega pela zona real (retirada = 0)
  IF v_order.delivery_type = 'delivery' AND v_order.delivery_zone_id IS NOT NULL THEN
    SELECT * INTO v_zone FROM delivery_zones WHERE id = v_order.delivery_zone_id;
    IF FOUND THEN
      v_delivery_fee := v_zone.delivery_fee;
    END IF;
  END IF;

  -- Recalcula o desconto pelas regras reais do cupom
  IF v_order.coupon_id IS NOT NULL THEN
    SELECT * INTO v_coupon FROM coupons WHERE id = v_order.coupon_id AND is_active = true;
    IF FOUND AND v_subtotal >= v_coupon.min_order THEN
      IF v_coupon.discount_type = 'percent' THEN
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      ELSE
        v_discount := v_coupon.discount_value;
      END IF;
      IF v_discount > v_subtotal THEN
        v_discount := v_subtotal;
      END IF;
    END IF;
  END IF;

  v_total := GREATEST(v_subtotal - v_discount + v_delivery_fee, 0);

  UPDATE orders
  SET subtotal = v_subtotal,
      discount = v_discount,
      delivery_fee = v_delivery_fee,
      total = v_total
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'subtotal', v_subtotal,
    'discount', v_discount,
    'delivery_fee', v_delivery_fee,
    'total', v_total
  );
END;
$$;

REVOKE ALL ON FUNCTION finalize_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION finalize_order(uuid) TO anon, authenticated;

-- ============================================================
-- 4. Impedir inserir itens em pedidos que já saíram de "NOVO"
--    (reduz a janela de tempo em que itens podem ser adulterados)
-- ============================================================
DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;
CREATE POLICY "order_items_insert_public" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.status = 'NOVO')
  );

DROP POLICY IF EXISTS "order_item_addons_insert_public" ON order_item_addons;
CREATE POLICY "order_item_addons_insert_public" ON order_item_addons FOR INSERT
  TO anon, authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_id AND o.status = 'NOVO'
    )
  );

-- ============================================================
-- 5. Corrigir increment_coupon_usage (falhava silenciosamente)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE coupons SET usage_count = usage_count + 1 WHERE id = coupon_id;
$$;

REVOKE ALL ON FUNCTION increment_coupon_usage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(uuid) TO anon, authenticated;
