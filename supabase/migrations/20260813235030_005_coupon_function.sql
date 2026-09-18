/*
# Alisson Lanches - Coupon Usage Increment Function

Creates a function to atomically increment the usage_count of a coupon when it's used in an order.
*/

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE coupons SET usage_count = usage_count + 1 WHERE id = coupon_id;
$$;
