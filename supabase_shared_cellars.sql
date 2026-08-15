-- ============================================================
-- SCRIPT DE CRIAÇÃO: ADEGAS COMPARTILHADAS (VINOVISION AI)
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

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.shared_cellars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cellar_members ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso para shared_cellars
DROP POLICY IF EXISTS "shared_cellars_select_policy" ON public.shared_cellars;
CREATE POLICY "shared_cellars_select_policy" ON public.shared_cellars
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT cellar_id FROM public.shared_cellar_members WHERE user_id = auth.uid())
    OR auth.role() = 'authenticated' -- Permite buscar por invite_code ao entrar
  );

DROP POLICY IF EXISTS "shared_cellars_insert_policy" ON public.shared_cellars;
CREATE POLICY "shared_cellars_insert_policy" ON public.shared_cellars
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "shared_cellars_update_policy" ON public.shared_cellars;
CREATE POLICY "shared_cellars_update_policy" ON public.shared_cellars
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "shared_cellars_delete_policy" ON public.shared_cellars;
CREATE POLICY "shared_cellars_delete_policy" ON public.shared_cellars
  FOR DELETE USING (owner_id = auth.uid());

-- 6. Políticas de Acesso para shared_cellar_members
DROP POLICY IF EXISTS "shared_cellar_members_select_policy" ON public.shared_cellar_members;
CREATE POLICY "shared_cellar_members_select_policy" ON public.shared_cellar_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR cellar_id IN (SELECT id FROM public.shared_cellars WHERE owner_id = auth.uid())
    OR cellar_id IN (SELECT cellar_id FROM public.shared_cellar_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "shared_cellar_members_insert_policy" ON public.shared_cellar_members;
CREATE POLICY "shared_cellar_members_insert_policy" ON public.shared_cellar_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "shared_cellar_members_delete_policy" ON public.shared_cellar_members;
CREATE POLICY "shared_cellar_members_delete_policy" ON public.shared_cellar_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR cellar_id IN (SELECT id FROM public.shared_cellars WHERE owner_id = auth.uid())
  );

-- 7. Atualizar políticas da tabela cellar para permitir acesso de membros aos vinhos da adega compartilhada
DROP POLICY IF EXISTS "cellar_select_shared" ON public.cellar;
CREATE POLICY "cellar_select_shared" ON public.cellar
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      cellar_id IS NOT NULL 
      AND (
        cellar_id IN (SELECT id FROM public.shared_cellars WHERE owner_id = auth.uid())
        OR cellar_id IN (SELECT cellar_id FROM public.shared_cellar_members WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "cellar_insert_shared" ON public.cellar;
CREATE POLICY "cellar_insert_shared" ON public.cellar
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "cellar_update_shared" ON public.cellar;
CREATE POLICY "cellar_update_shared" ON public.cellar
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (
      cellar_id IS NOT NULL 
      AND (
        cellar_id IN (SELECT id FROM public.shared_cellars WHERE owner_id = auth.uid())
        OR cellar_id IN (SELECT cellar_id FROM public.shared_cellar_members WHERE user_id = auth.uid())
      )
    )
  );
