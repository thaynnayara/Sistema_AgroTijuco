-- =============================================================================
-- AGROTIJUCO SAAS - V2: VINCULAÇÃO DE USUÁRIOS PRODUTORES A PRODUTOR RURAL
-- =============================================================================

ALTER TABLE tb_usuarios ADD COLUMN IF NOT EXISTS produtor_id UUID REFERENCES tb_produtores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_produtor ON tb_usuarios(tenant_id, produtor_id);
