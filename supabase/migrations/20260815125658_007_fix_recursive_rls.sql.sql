/*
# Fix recursive RLS on profiles table

## Problem
The `profiles_select_own` policy contained:
  `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')`
This queries the `profiles` table *inside* a policy ON `profiles`, causing infinite
recursion → "Database error querying schema".

## Fix
1. Create a SECURITY DEFINER function `is_admin(uid uuid)` that reads the profiles
   table with owner privileges (bypassing RLS), breaking the recursion.
2. Replace ALL occurrences of the recursive subquery with `is_admin(auth.uid())`
   across profiles, orders, order_items, order_item_addons, and all admin write policies.
3. Drop and recreate every affected policy.

## Security
- `is_admin()` is SECURITY DEFINER, owned by the postgres user, so it bypasses RLS.
- It only returns a boolean — no data leakage.
- All admin write policies (INSERT/UPDATE/DELETE) now use `is_admin(auth.uid())`.
- No table structure changes; no data loss.
*/

-- 1) Helper function
CREATE OR REPLACE FUNCTION is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = check_uid AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated, anon;

-- 2) PROFILES — fix recursive SELECT
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_admin(auth.uid()));

-- 3) CATEGORIES — admin writes
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 4) PRODUCTS — admin writes
DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" ON products FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" ON products FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 5) ADDON GROUPS — admin writes
DROP POLICY IF EXISTS "addon_groups_insert_admin" ON addon_groups;
CREATE POLICY "addon_groups_insert_admin" ON addon_groups FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "addon_groups_update_admin" ON addon_groups;
CREATE POLICY "addon_groups_update_admin" ON addon_groups FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "addon_groups_delete_admin" ON addon_groups;
CREATE POLICY "addon_groups_delete_admin" ON addon_groups FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 6) PRODUCT ADDONS — admin writes
DROP POLICY IF EXISTS "product_addons_insert_admin" ON product_addons;
CREATE POLICY "product_addons_insert_admin" ON product_addons FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "product_addons_update_admin" ON product_addons;
CREATE POLICY "product_addons_update_admin" ON product_addons FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "product_addons_delete_admin" ON product_addons;
CREATE POLICY "product_addons_delete_admin" ON product_addons FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 7) ADDON GROUP LINKS
DROP POLICY IF EXISTS "addon_group_links_insert_admin" ON product_addon_group_links;
CREATE POLICY "addon_group_links_insert_admin" ON product_addon_group_links FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "addon_group_links_delete_admin" ON product_addon_group_links;
CREATE POLICY "addon_group_links_delete_admin" ON product_addon_group_links FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 8) DELIVERY ZONES
DROP POLICY IF EXISTS "delivery_zones_insert_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_insert_admin" ON delivery_zones FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "delivery_zones_update_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_update_admin" ON delivery_zones FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "delivery_zones_delete_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_delete_admin" ON delivery_zones FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 9) COUPONS
DROP POLICY IF EXISTS "coupons_insert_admin" ON coupons;
CREATE POLICY "coupons_insert_admin" ON coupons FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "coupons_update_admin" ON coupons;
CREATE POLICY "coupons_update_admin" ON coupons FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "coupons_delete_admin" ON coupons;
CREATE POLICY "coupons_delete_admin" ON coupons FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 10) STORE SETTINGS
DROP POLICY IF EXISTS "store_settings_update_admin" ON store_settings;
CREATE POLICY "store_settings_update_admin" ON store_settings FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 11) BUSINESS HOURS
DROP POLICY IF EXISTS "business_hours_insert_admin" ON business_hours;
CREATE POLICY "business_hours_insert_admin" ON business_hours FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "business_hours_update_admin" ON business_hours;
CREATE POLICY "business_hours_update_admin" ON business_hours FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "business_hours_delete_admin" ON business_hours;
CREATE POLICY "business_hours_delete_admin" ON business_hours FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 12) PAYMENT SETTINGS
DROP POLICY IF EXISTS "payment_settings_update_admin" ON payment_settings;
CREATE POLICY "payment_settings_update_admin" ON payment_settings FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 13) ORDERS
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO anon, authenticated USING (
    auth.uid() = user_id OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 14) ORDER ITEMS
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "order_items_update_admin" ON order_items;
CREATE POLICY "order_items_update_admin" ON order_items FOR UPDATE
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "order_items_delete_admin" ON order_items;
CREATE POLICY "order_items_delete_admin" ON order_items FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- 15) ORDER ITEM ADDONS
DROP POLICY IF EXISTS "order_item_addons_select_own" ON order_item_addons;
CREATE POLICY "order_item_addons_select_own" ON order_item_addons FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.id = order_item_id
    AND EXISTS (SELECT 1 FROM orders o WHERE o.id = oi.order_id AND (o.user_id = auth.uid() OR is_admin(auth.uid()))))
  );

DROP POLICY IF EXISTS "order_item_addons_delete_admin" ON order_item_addons;
CREATE POLICY "order_item_addons_delete_admin" ON order_item_addons FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));
