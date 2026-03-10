-- Tabela de lançamentos financeiros (receitas e despesas)
CREATE TABLE IF NOT EXISTS lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_pagamento TEXT,
  mes TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('R', 'D')),
  plano_contas TEXT,
  descricao TEXT,
  valor DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PAGO', 'PENDENTE')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas por usuário e mês
CREATE INDEX IF NOT EXISTS idx_lancamentos_user_mes ON lancamentos(user_id, mes);
CREATE INDEX IF NOT EXISTS idx_lancamentos_user_tipo ON lancamentos(user_id, tipo);

-- RLS: usuário só acessa seus próprios lançamentos
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus lançamentos"
  ON lancamentos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Perfil MEI (atividade para cálculo do DAS)
CREATE TABLE IF NOT EXISTS mei_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  atividade TEXT NOT NULL DEFAULT 'servicos' CHECK (atividade IN ('comercio', 'servicos', 'ambos', 'transportador')),
  cnpj TEXT,
  razao_social TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mei_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seu perfil"
  ON mei_profile FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notas fiscais emitidas
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT,
  serie TEXT,
  data_emissao DATE,
  valor DECIMAL(12,2) NOT NULL DEFAULT 0,
  descricao TEXT,
  tipo TEXT DEFAULT 'NFC-e' CHECK (tipo IN ('NF-e', 'NFC-e', 'NFS-e')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notas_user ON notas_fiscais(user_id);

ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas suas notas"
  ON notas_fiscais FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
