/*
# Definitive fix: Eliminate is_admin SECURITY DEFINER warnings

## Problem
The is_admin() SECURITY DEFINER function must be callable by both anon and
authenticated roles (because RLS policies evaluated in those roles call it),
but the security advisor flags any SECURITY DEFINER function callable by
anon/authenticated via the REST API.

## Solution
Move is_admin() to a private schema (`_auth_helpers`) that is NOT exposed
through the PostgREST API. Functions in schemas without GRANT USAGE to
anon/authenticated are not callable via /rest/v1/rpc/, so the advisor warning
disappears. But RLS policies can still call the function because policy
evaluation happens inside the database engine, not through REST.

Steps:
1. Create schema _auth_helpers
2. Move is_admin() there (SECURITY DEFINER, locked search_path)
3. Grant USAGE on _auth_helpers to anon and authenticated (needed for RLS eval)
4. Update ALL policies that reference public.is_admin to use _auth_helpers.is_admin
5. Drop the old public.is_admin function
*/

-- 1. Create private schema for auth helper functions
CREATE SCHEMA IF NOT EXISTS _auth_helpers;

-- 2. Create is_admin in the private schema
CREATE OR REPLACE FUNCTION _auth_helpers.is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = check_uid AND role = 'admin'
  );
$$;

-- 3. Grant USAGE on the schema (needed for RLS policy evaluation)
--    but DO NOT grant EXECUTE on the function to anon/authenticated via REST.
--    Actually, USAGE on schema + EXECUTE on function is needed for RLS to call it.
--    The key is that PostgREST only exposes schemas in its exposed-schemas config
--    (typically just 'public'), so _auth_helpers won't be in the REST API.
GRANT USAGE ON SCHEMA _auth_helpers TO anon, authenticated;
GRANT EXECUTE ON FUNCTION _auth_helpers.is_admin(uuid) TO anon, authenticated;

-- 4. Update all policies to use _auth_helpers.is_admin instead of public.is_admin

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR _auth_helpers.is_admin(auth.uid()));

-- CATEGORIES
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- PRODUCTS
DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin" ON products FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" ON products FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" ON products FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- ADDON GROUPS
DROP POLICY IF EXISTS "addon_groups_insert_admin" ON addon_groups;
CREATE POLICY "addon_groups_insert_admin" ON addon_groups FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "addon_groups_update_admin" ON addon_groups;
CREATE POLICY "addon_groups_update_admin" ON addon_groups FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "addon_groups_delete_admin" ON addon_groups;
CREATE POLICY "addon_groups_delete_admin" ON addon_groups FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- PRODUCT ADDONS
DROP POLICY IF EXISTS "product_addons_insert_admin" ON product_addons;
CREATE POLICY "product_addons_insert_admin" ON product_addons FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "product_addons_update_admin" ON product_addons;
CREATE POLICY "product_addons_update_admin" ON product_addons FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "product_addons_delete_admin" ON product_addons;
CREATE POLICY "product_addons_delete_admin" ON product_addons FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- ADDON GROUP LINKS
DROP POLICY IF EXISTS "addon_group_links_insert_admin" ON product_addon_group_links;
CREATE POLICY "addon_group_links_insert_admin" ON product_addon_group_links FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "addon_group_links_delete_admin" ON product_addon_group_links;
CREATE POLICY "addon_group_links_delete_admin" ON product_addon_group_links FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- DELIVERY ZONES
DROP POLICY IF EXISTS "delivery_zones_insert_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_insert_admin" ON delivery_zones FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "delivery_zones_update_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_update_admin" ON delivery_zones FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "delivery_zones_delete_admin" ON delivery_zones;
CREATE POLICY "delivery_zones_delete_admin" ON delivery_zones FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- COUPONS
DROP POLICY IF EXISTS "coupons_insert_admin" ON coupons;
CREATE POLICY "coupons_insert_admin" ON coupons FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "coupons_update_admin" ON coupons;
CREATE POLICY "coupons_update_admin" ON coupons FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "coupons_delete_admin" ON coupons;
CREATE POLICY "coupons_delete_admin" ON coupons FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- STORE SETTINGS
DROP POLICY IF EXISTS "store_settings_update_admin" ON store_settings;
CREATE POLICY "store_settings_update_admin" ON store_settings FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

-- BUSINESS HOURS
DROP POLICY IF EXISTS "business_hours_insert_admin" ON business_hours;
CREATE POLICY "business_hours_insert_admin" ON business_hours FOR INSERT
  TO authenticated WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "business_hours_update_admin" ON business_hours;
CREATE POLICY "business_hours_update_admin" ON business_hours FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "business_hours_delete_admin" ON business_hours;
CREATE POLICY "business_hours_delete_admin" ON business_hours FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- PAYMENT SETTINGS
DROP POLICY IF EXISTS "payment_settings_update_admin" ON payment_settings;
CREATE POLICY "payment_settings_update_admin" ON payment_settings FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

-- ORDERS
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO anon, authenticated USING (
    auth.uid() = user_id OR _auth_helpers.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid())) WITH CHECK (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- ORDER ITEMS
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR _auth_helpers.is_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "order_items_update_admin" ON order_items;
CREATE POLICY "order_items_update_admin" ON order_items FOR UPDATE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "order_items_delete_admin" ON order_items;
CREATE POLICY "order_items_delete_admin" ON order_items FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- ORDER ITEM ADDONS
DROP POLICY IF EXISTS "order_item_addons_select_own" ON order_item_addons;
CREATE POLICY "order_item_addons_select_own" ON order_item_addons FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.id = order_item_id
    AND EXISTS (SELECT 1 FROM orders o WHERE o.id = oi.order_id AND (o.user_id = auth.uid() OR _auth_helpers.is_admin(auth.uid()))))
  );

DROP POLICY IF EXISTS "order_item_addons_delete_admin" ON order_item_addons;
CREATE POLICY "order_item_addons_delete_admin" ON order_item_addons FOR DELETE
  TO authenticated USING (_auth_helpers.is_admin(auth.uid()));

-- 5. Drop the old public.is_admin function
DROP FUNCTION IF EXISTS public.is_admin(uuid);
