/*
# Upload de imagens do aparelho (produtos + foto de perfil)

Cria dois "baldes" (buckets) de armazenamento de arquivos no Supabase
Storage, com as permissões certas:

- product-images: qualquer pessoa pode VER as imagens (o site é público),
  mas só admin pode enviar/trocar/apagar.
- avatars: qualquer pessoa pode ver, mas cada usuário só pode enviar,
  trocar ou apagar a PRÓPRIA foto (nunca a de outra pessoa).

Também adiciona a coluna avatar_url em profiles, para guardar o link da
foto de perfil do cliente.
*/

-- ============================================================
-- 1. Coluna da foto de perfil
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- ============================================================
-- 2. Criar os buckets (ambos públicos para LEITURA)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Qualquer pessoa pode VISUALIZAR as imagens dos dois buckets
-- ============================================================
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'avatars');

-- ============================================================
-- 4. Só admin pode enviar/trocar/apagar imagens de PRODUTO
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_product_images" ON storage.objects;
CREATE POLICY "admin_insert_product_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-images' AND _auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images' AND _auth_helpers.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images' AND _auth_helpers.is_admin(auth.uid()));

-- ============================================================
-- 5. Cada usuário só mexe na PRÓPRIA foto de perfil
--    (o arquivo precisa ficar salvo dentro de uma "pasta" com o id do usuário)
-- ============================================================
DROP POLICY IF EXISTS "user_insert_own_avatar" ON storage.objects;
CREATE POLICY "user_insert_own_avatar" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "user_update_own_avatar" ON storage.objects;
CREATE POLICY "user_update_own_avatar" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "user_delete_own_avatar" ON storage.objects;
CREATE POLICY "user_delete_own_avatar" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
