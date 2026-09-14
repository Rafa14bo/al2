/*
# Fix: Restore is_admin EXECUTE for authenticated role

## Root cause
Migration 010 revoked EXECUTE on is_admin() from both anon AND authenticated.
However, is_admin() is called inside RLS policies (profiles_select_own, etc.)
that are evaluated under the authenticated role. Without EXECUTE permission,
every RLS check that calls is_admin() fails with "Database error querying schema",
which breaks Supabase Auth entirely (login, signup, password reset — everything).

## Fix
- Grant EXECUTE back to authenticated (needed for RLS policy evaluation)
- Keep revoked from anon (anon doesn't trigger these policies during auth)
- Keep revoked from PUBLIC (defense in depth)
- is_admin remains SECURITY DEFINER with locked search_path, so it's still safe
*/

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
