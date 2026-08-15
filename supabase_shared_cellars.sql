-- ============================================================
-- SCRIPT DE CRIAÇÃO & CORREÇÃO: ADEGAS COMPARTILHADAS (VINOVISION AI)
-- Execute este script no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabela de Adegas Compartilhadas
CREATE TABLE IF NOT EXISTS public.shared_cellars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Membros das Adegas Compartilhadas
CREATE TABLE IF NOT EXISTS public.shared_cellar_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cellar_id UUID REFERENCES public.shared_cellars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER', -- 'OWNER' | 'MEMBER'
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cellar_id, user_id)
);

-- 3. Adicionar coluna cellar_id na tabela cellar (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cellar' AND column_name = 'cellar_id'
  ) THEN
    ALTER TABLE public.cellar ADD COLUMN cellar_id UUID REFERENCES public.shared_cellars(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Remover constraints UNIQUE legadas que impediriam a mesma garrafa de existir em múltiplas adegas
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.cellar'::regclass 
      AND contype = 'u' 
      AND conname != 'cellar_pkey'
  ) LOOP
    EXECUTE 'ALTER TABLE public.cellar DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 5. Criar índices para performance de buscas por adega e usuário
CREATE INDEX IF NOT EXISTS idx_cellar_cellar_id ON public.cellar(cellar_id);
CREATE INDEX IF NOT EXISTS idx_cellar_user_id ON public.cellar(user_id);
CREATE INDEX IF NOT EXISTS idx_cellar_wine_id ON public.cellar(wine_id);
CREATE INDEX IF NOT EXISTS idx_shared_cellar_members_user ON public.shared_cellar_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_cellar_members_cellar ON public.shared_cellar_members(cellar_id);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.shared_cellars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cellar_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cellar ENABLE ROW LEVEL SECURITY;

-- 7. Limpar todas as políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "shared_cellars_select_policy" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_insert_policy" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_update_policy" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_delete_policy" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_select" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_insert" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_update" ON public.shared_cellars;
DROP POLICY IF EXISTS "shared_cellars_delete" ON public.shared_cellars;

DROP POLICY IF EXISTS "shared_cellar_members_select_policy" ON public.shared_cellar_members;
DROP POLICY IF EXISTS "shared_cellar_members_insert_policy" ON public.shared_cellar_members;
DROP POLICY IF EXISTS "shared_cellar_members_delete_policy" ON public.shared_cellar_members;
DROP POLICY IF EXISTS "shared_cellar_members_select" ON public.shared_cellar_members;
DROP POLICY IF EXISTS "shared_cellar_members_insert" ON public.shared_cellar_members;
DROP POLICY IF EXISTS "shared_cellar_members_delete" ON public.shared_cellar_members;

DROP POLICY IF EXISTS "cellar_select_shared" ON public.cellar;
DROP POLICY IF EXISTS "cellar_insert_shared" ON public.cellar;
DROP POLICY IF EXISTS "cellar_update_shared" ON public.cellar;
DROP POLICY IF EXISTS "cellar_select" ON public.cellar;
DROP POLICY IF EXISTS "cellar_insert" ON public.cellar;
DROP POLICY IF EXISTS "cellar_update" ON public.cellar;
DROP POLICY IF EXISTS "cellar_delete" ON public.cellar;

-- 8. Políticas Limpas e Diretas (Sem recursão circular)
-- SHARED_CELLARS:
CREATE POLICY "shared_cellars_select" ON public.shared_cellars
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "shared_cellars_insert" ON public.shared_cellars
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "shared_cellars_update" ON public.shared_cellars
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "shared_cellars_delete" ON public.shared_cellars
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- SHARED_CELLAR_MEMBERS:
CREATE POLICY "shared_cellar_members_select" ON public.shared_cellar_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "shared_cellar_members_insert" ON public.shared_cellar_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "shared_cellar_members_delete" ON public.shared_cellar_members
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CELLAR (Vinhos):
CREATE POLICY "cellar_select" ON public.cellar
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cellar_insert" ON public.cellar
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "cellar_update" ON public.cellar
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "cellar_delete" ON public.cellar
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR true);
