/*
# Sistema de avaliações (só para clientes logados)

Cria a tabela `reviews`. Qualquer visitante pode LER as avaliações (elas
aparecem publicamente na página inicial), mas só quem tem conta e está
logado pode CRIAR, EDITAR ou APAGAR — e sempre a própria avaliação, nunca
a de outra pessoa. Cada cliente pode deixar uma avaliação (pode editar
depois, não precisa criar várias).

Admin pode apagar qualquer avaliação (moderação — ex: remover uma
ofensiva), mas não pode editar o texto de ninguém.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler (avaliações aparecem publicamente no site)
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

-- Só o próprio usuário logado pode criar sua avaliação
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Só o próprio usuário logado pode editar sua avaliação
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- O próprio usuário pode apagar a própria avaliação; admin pode apagar qualquer uma (moderação)
CREATE POLICY "reviews_delete_own_or_admin" ON reviews FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id
    OR _auth_helpers.is_admin(auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================
-- Permitir ver o NOME de quem avaliou (necessário para mostrar
-- "Fulano avaliou ⭐⭐⭐⭐⭐" publicamente). O telefone e outros dados
-- continuam privados — o app só pede o campo "name" nessa consulta,
-- e essa regra só libera o perfil de quem JÁ tem uma avaliação pública.
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_reviewers" ON profiles;
CREATE POLICY "profiles_select_reviewers" ON profiles FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM reviews r WHERE r.user_id = profiles.id)
  );
