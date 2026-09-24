package com.agrotijuco.sistema.config;

import com.agrotijuco.sistema.config.tenant.TenantContext;
import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE tb_propriedades ALTER COLUMN produtor_id DROP NOT NULL");
        } catch (Exception e) {
            // Ignora se o banco for H2 ou a coluna já for nullable
        }

        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS tb_propriedade_produtores (" +
                    "propriedade_id UUID NOT NULL REFERENCES tb_propriedades(id) ON DELETE CASCADE, " +
                    "produtor_id UUID NOT NULL REFERENCES tb_produtores(id) ON DELETE CASCADE, " +
                    "PRIMARY KEY (propriedade_id, produtor_id))");

            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_prop_prod_propriedade ON tb_propriedade_produtores(propriedade_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_prop_prod_produtor ON tb_propriedade_produtores(produtor_id)");

            jdbcTemplate.execute("INSERT INTO tb_propriedade_produtores (propriedade_id, produtor_id) " +
                    "SELECT id, produtor_id FROM tb_propriedades WHERE produtor_id IS NOT NULL " +
                    "ON CONFLICT DO NOTHING");

            // Habilita RLS se estiver no PostgreSQL
            try {
                jdbcTemplate.execute("ALTER TABLE tb_propriedade_produtores ENABLE ROW LEVEL SECURITY");
                jdbcTemplate.execute("DO $$ BEGIN " +
                        "IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tb_propriedade_produtores' AND policyname = 'tenant_isolation_propriedade_produtores') THEN " +
                        "CREATE POLICY tenant_isolation_propriedade_produtores ON tb_propriedade_produtores " +
                        "USING (EXISTS (SELECT 1 FROM tb_propriedades p WHERE p.id = propriedade_id AND (p.tenant_id = current_setting('app.current_tenant', true) OR current_setting('app.current_tenant', true) IS NULL))); " +
                        "END IF; END $$;");
            } catch (Exception e) {
                // Ignora erro de RLS se não for PostgreSQL
            }
        } catch (Exception e) {
            log.warn("Aviso ao configurar tb_propriedade_produtores: {}", e.getMessage());
        }

        garantirUsuarioAdmin("Thaynná Yara Admin", "thaynna.yara@agrotijuco.com.br", "AdminAgro2026!", "Fazenda AgroTijuco", Role.ADMIN);
        garantirUsuarioAdmin("Thaynná Yara", "thaynna@agrotijuco.com.br", "AdminAgro2026!", "Fazenda AgroTijuco", Role.ADMIN);
    }

    private void garantirUsuarioAdmin(String nome, String email, String senhaPlana, String tenantId, Role role) {
        String normalizedEmail = email.trim().toLowerCase();
        try {
            TenantContext.setCurrentTenant(tenantId);
            var opt = usuarioRepository.findByEmailIgnoringTenant(normalizedEmail);
            if (opt.isPresent()) {
                Usuario user = opt.get();
                boolean changed = false;
                if (user.getRole() != role) {
                    user.setRole(role);
                    changed = true;
                }
                if (!user.isAtivo()) {
                    user.setAtivo(true);
                    changed = true;
                }
                if (changed) {
                    usuarioRepository.save(user);
                    log.info("✓ Perfil do usuário {} atualizado com sucesso para {}!", normalizedEmail, role);
                }
            } else {
                Usuario admin = new Usuario();
                admin.setNome(nome);
                admin.setEmail(normalizedEmail);
                admin.setSenha(passwordEncoder.encode(senhaPlana));
                admin.setTenantId(tenantId);
                admin.setRole(role);
                admin.setAtivo(true);
                usuarioRepository.save(admin);
                log.info("✓ Usuário administrador inicial criado com sucesso: {}", normalizedEmail);
            }
        } catch (Exception e) {
            log.error("Erro ao inicializar usuário {}: {}", normalizedEmail, e.getMessage());
        } finally {
            TenantContext.clear();
        }
    }
}
