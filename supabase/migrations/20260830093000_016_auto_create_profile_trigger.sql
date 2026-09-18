/*
# Auto-criar perfil para novos usuários (necessário pro login com Google)

Hoje, o perfil (tabela `profiles`) só é criado manualmente pelo código do
site, logo depois do cadastro por e-mail/senha. O login social (Google)
não passa por esse código — o Supabase cria o usuário direto — então essa
pessoa ficaria sem linha em `profiles`, quebrando telas que dependem dela
(nome, "meus pedidos", verificação de admin).

Este trigger cria o perfil automaticamente sempre que um novo usuário é
criado em auth.users, não importa o método de login (e-mail, Google, etc).
Se o perfil já existir (ex: fluxo antigo de cadastro por e-mail chegando
depois), ele não sobrescreve nada.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
