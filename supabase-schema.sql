-- ============================================================
-- BikeService — Schema SQL para o Supabase
-- Execute este script no Editor SQL do Supabase
-- ============================================================

-- 1. Criar tabela de perfis de usuários (para armazenar nome de usuário)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Criar índice para username
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Habilitar RLS na tabela de perfis
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Políticas de segurança para user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Criar a tabela de manutenções
CREATE TABLE IF NOT EXISTS public.manutencoes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_servico TEXT NOT NULL,
  data        DATE NOT NULL,
  custo       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  local       TEXT NOT NULL,
  observacoes TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_manutencoes_user_id ON public.manutencoes(user_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_data ON public.manutencoes(data DESC);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own manutencoes" ON public.manutencoes;
DROP POLICY IF EXISTS "Users can insert own manutencoes" ON public.manutencoes;
DROP POLICY IF EXISTS "Users can update own manutencoes" ON public.manutencoes;
DROP POLICY IF EXISTS "Users can delete own manutencoes" ON public.manutencoes;

-- 5. Políticas de segurança (RLS) — baseadas no user_id
-- Usuário só pode ver seus próprios registros
CREATE POLICY "Users can view own manutencoes"
  ON public.manutencoes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário só pode inserir registros para si mesmo
CREATE POLICY "Users can insert own manutencoes"
  ON public.manutencoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário só pode atualizar seus próprios registros
CREATE POLICY "Users can update own manutencoes"
  ON public.manutencoes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuário só pode deletar seus próprios registros
CREATE POLICY "Users can delete own manutencoes"
  ON public.manutencoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Trigger para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manutencoes_updated_at ON public.manutencoes;
CREATE TRIGGER manutencoes_updated_at
  BEFORE UPDATE ON public.manutencoes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Trigger para atualizar o updated_at de user_profiles
DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- BikeService — Completamente configurado
-- ✅ Tabelas: user_profiles, manutencoes
-- ✅ RLS: Habilitado com políticas de segurança
-- ✅ Índices: Para otimizar queries
-- ✅ Triggers: Para atualizar updated_at automaticamente
-- ============================================================
