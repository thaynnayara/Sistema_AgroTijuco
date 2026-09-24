-- =============================================================================
-- AGROTIJUCO SAAS - V4: SUPORTE A MÚLTIPLOS PRODUTORES POR PROPRIEDADE
-- =============================================================================

ALTER TABLE tb_propriedades ALTER COLUMN produtor_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS tb_propriedade_produtores (
    propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE,
    produtor_id UUID NOT NULL REFERENCES tb_produtores(id) ON DELETE CASCADE,
    PRIMARY KEY (propriedade_id, produtor_id)
);

CREATE INDEX IF NOT EXISTS idx_prop_prod_propriedade ON tb_propriedade_produtores(propriedade_id);
CREATE INDEX IF NOT EXISTS idx_prop_prod_produtor ON tb_propriedade_produtores(produtor_id);

-- Migra associações existentes
INSERT INTO tb_propriedade_produtores (propriedade_id, produtor_id)
SELECT id, produtor_id FROM tb_propriedades WHERE produtor_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE tb_propriedade_produtores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tb_propriedade_produtores' AND policyname = 'tenant_isolation_propriedade_produtores') THEN
        CREATE POLICY tenant_isolation_propriedade_produtores ON tb_propriedade_produtores
            USING (
                EXISTS (
                    SELECT 1 FROM tb_propriedades p 
                    WHERE p.id = propriedade_id 
                    AND (p.tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL)
                )
            );
    END IF;
END $$;
