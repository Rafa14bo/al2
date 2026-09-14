/*
# Fix security advisor warnings

## Issues fixed:
1. get_next_order_number: mutable search_path -> add SET search_path = 'public'
2. increment_coupon_usage: mutable search_path -> add SET search_path = 'public'
3. is_admin: SECURITY DEFINER executable by anon and authenticated
   -> revoke EXECUTE from anon and authenticated; keep for service_role and postgres only
*/

-- 1. Fix get_next_order_number: set immutable search_path
CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS integer
LANGUAGE sql
SET search_path = 'public'
AS $$
  SELECT nextval('order_number_seq');
$$;

-- 2. Fix increment_coupon_usage: set immutable search_path
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE sql
SET search_path = 'public'
AS $$
  UPDATE coupons SET usage_count = usage_count + 1 WHERE id = coupon_id;
$$;

-- 3. Restrict is_admin EXECUTE to service_role and postgres only
--    (only the database/RLS engine needs to call it; anon and authenticated should not invoke it directly via REST)
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
-- Ensure service_role and postgres retain access
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
