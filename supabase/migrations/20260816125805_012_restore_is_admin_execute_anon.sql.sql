/*
# Fix: Restore is_admin EXECUTE for anon role

## Root cause
Migration 008 revoked EXECUTE on is_admin() from anon. But 3 SELECT policies
(orders_select_own, order_items_select_own, order_item_addons_select_own) are
scoped TO "anon, authenticated" and call is_admin(auth.uid()) in their USING
clause. When anon evaluates these policies, it gets "permission denied for
function is_admin" → "Database error querying schema".

This breaks auth because GoTrue/internal queries can touch these tables in the
anon context during login flows.

## Fix
Grant EXECUTE back to anon. is_admin is SECURITY DEFINER owned by postgres with
a locked search_path — it only returns a boolean and leaks no data, so allowing
anon to call it is safe. auth.uid() returns NULL for anon, so is_admin(NULL)
always returns false.

## Alternative considered
Rewriting the 3 policies to not call is_admin for anon would require splitting
each into separate anon/authenticated policies. The grant approach is simpler
and equally safe.
*/

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
