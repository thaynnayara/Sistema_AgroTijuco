-- =============================================================================
-- AGROTIJUCO SAAS - BANCO DE DADOS & SCHEMAS MULTI-TENANT COM RLS
-- =============================================================================

-- Extension para UUIDs se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários / Autenticação
CREATE TABLE IF NOT EXISTS tb_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 2. Tabela Produtores
CREATE TABLE IF NOT EXISTS tb_produtores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cpf_ou_cnpj VARCHAR(14) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 3. Tabela Propriedades
CREATE TABLE IF NOT EXISTS tb_propriedades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    nome_fazenda VARCHAR(150) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    area_hectares DOUBLE PRECISION,
    produtor_id UUID NOT NULL REFERENCES tb_produtores(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 4. Tabela Animais
CREATE TABLE IF NOT EXISTS animais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE,
    nome VARCHAR(100),
    brinco VARCHAR(50) NOT NULL,
    sexo CHAR(1) NOT NULL,
    raca VARCHAR(100),
    data_nascimento DATE,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 5. Tabela Pesagens (Alta frequência de gravações/consultas)
CREATE TABLE IF NOT EXISTS pesagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    data_pesagem DATE NOT NULL,
    peso_kg NUMERIC(8,2) NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- =============================================================================
-- ÍNDICES DE ALTA PERFORMANCE PARA MULTI-TENANCY E SECTORS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_email ON tb_usuarios(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_produtores_tenant ON tb_produtores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_propriedades_tenant_produtor ON tb_propriedades(tenant_id, produtor_id);
CREATE INDEX IF NOT EXISTS idx_animais_tenant_propriedade_status ON animais(tenant_id, propriedade_id, status);
CREATE INDEX IF NOT EXISTS idx_pesagens_tenant_animal_data ON pesagens(tenant_id, animal_id, data_pesagem DESC, id DESC);

-- =============================================================================
-- POSTGRESQL ROW LEVEL SECURITY (RLS) - SEGURANÇA FÍSICA NO BD
-- =============================================================================

ALTER TABLE tb_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_produtores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_propriedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS baseadas na variável de sessão 'app.current_tenant'
CREATE POLICY tenant_isolation_usuarios ON tb_usuarios
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_produtores ON tb_produtores
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_propriedades ON tb_propriedades
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_animais ON animais
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);

CREATE POLICY tenant_isolation_pesagens ON pesagens
    USING (tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL);
