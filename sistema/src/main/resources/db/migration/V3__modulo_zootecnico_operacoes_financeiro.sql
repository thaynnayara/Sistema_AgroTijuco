-- =============================================================================
-- AGROTIJUCO SAAS - V3: MÓDULO ZOOTÉCNICO, OPERAÇÕES, FINANCEIRO E FISCAL
-- =============================================================================

-- 1. Tabela Piquetes (RF05)
CREATE TABLE IF NOT EXISTS tb_piquetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE,
    nome_piquete VARCHAR(100) NOT NULL,
    area_hectares NUMERIC(10,2) NOT NULL,
    capacidade_cabecas INT NOT NULL,
    tipo_capim VARCHAR(100),
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 2. Atualizar Tabela de Animais (RF01, RF05)
ALTER TABLE animais ADD COLUMN IF NOT EXISTS rfid VARCHAR(100);
ALTER TABLE animais ADD COLUMN IF NOT EXISTS lote VARCHAR(100);
ALTER TABLE animais ADD COLUMN IF NOT EXISTS piquete_id UUID REFERENCES tb_piquetes(id) ON DELETE SET NULL;

-- 3. Tabela Gestão Reprodutiva (RF02)
CREATE TABLE IF NOT EXISTS tb_eventos_reprodutivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    data_evento DATE NOT NULL,
    data_previsao_proxima_etapa DATE,
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 4. Tabela Calendário e Registros Sanitários (RF03, RN02)
CREATE TABLE IF NOT EXISTS tb_registros_sanitarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    lote VARCHAR(100),
    medicamento_vacina VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    dose VARCHAR(50),
    data_aplicacao DATE NOT NULL,
    dias_carencia INT NOT NULL DEFAULT 0,
    data_fim_carencia DATE NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 5. Tabela Controle Nutricional / Dietas e Trato (RF06)
CREATE TABLE IF NOT EXISTS tb_dietas_trato (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE,
    nome_dieta VARCHAR(150) NOT NULL,
    ingredientes TEXT NOT NULL,
    quantidade_kg_cabeca NUMERIC(8,2) NOT NULL,
    lote_destino VARCHAR(100),
    data_trato DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 6. Tabela Despesas Operacionais e Financeiro (RF07)
CREATE TABLE IF NOT EXISTS tb_despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE,
    descricao VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    data_despesa DATE NOT NULL,
    tipo_producao VARCHAR(50),
    total_produzido_periodo NUMERIC(12,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 7. Tabela Gestão de Estoque (RF08)
CREATE TABLE IF NOT EXISTS tb_itens_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE,
    nome_item VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    quantidade_atual NUMERIC(10,2) NOT NULL,
    quantidade_minima NUMERIC(10,2) NOT NULL,
    unidade_medida VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- =============================================================================
-- ÍNDICES DE PERFORMANCE E MULTI-TENANCY
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_piquetes_tenant_propriedade ON tb_piquetes(tenant_id, propriedade_id);
CREATE INDEX IF NOT EXISTS idx_reprodutivo_tenant_animal ON tb_eventos_reprodutivos(tenant_id, animal_id, data_evento DESC);
CREATE INDEX IF NOT EXISTS idx_sanitario_tenant_animal_carencia ON tb_registros_sanitarios(tenant_id, animal_id, data_fim_carencia);
CREATE INDEX IF NOT EXISTS idx_dietas_tenant_propriedade ON tb_dietas_trato(tenant_id, propriedade_id);
CREATE INDEX IF NOT EXISTS idx_despesas_tenant_propriedade_data ON tb_despesas(tenant_id, propriedade_id, data_despesa DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_tenant_propriedade ON tb_itens_estoque(tenant_id, propriedade_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE tb_piquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_eventos_reprodutivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_registros_sanitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_dietas_trato ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_itens_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_piquetes ON tb_piquetes
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_reprodutivo ON tb_eventos_reprodutivos
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_sanitario ON tb_registros_sanitarios
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_dietas ON tb_dietas_trato
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_despesas ON tb_despesas
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_estoque ON tb_itens_estoque
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);
