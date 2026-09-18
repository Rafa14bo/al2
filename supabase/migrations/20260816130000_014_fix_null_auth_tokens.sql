/*
# Fix: "Database error querying schema" ao logar

## Causa raiz
As migrations 006 e 009 inserem usuários diretamente em auth.users via SQL,
sem preencher colunas de token (confirmation_token, recovery_token,
email_change, email_change_token_new, email_change_token_current,
phone_change, phone_change_token, reauthentication_token).

Essas colunas ficam NULL, mas o GoTrue (serviço de autenticação do Supabase)
espera sempre uma string nelas. Ao tentar ler o usuário no login, ele falha
com: "sql: Scan error on column ... converting NULL to string is unsupported",
que é exposto ao cliente como "Database error querying schema".

Isso é INDEPENDENTE das políticas de RLS / is_admin() corrigidas nas
migrations 007-013 — por isso o erro persistiu mesmo depois delas.

## Fix
Preenche com '' (string vazia) qualquer coluna de token NULL, para
QUALQUER usuário existente em auth.users (não só o admin), e garante que
novos usuários criados por essas migrations nunca fiquem nesse estado.
*/

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change IS NULL
  OR email_change_token_new IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
