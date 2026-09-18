-- Revoke EXECUTE on is_admin from anon role — only authenticated users need it
REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM anon;
