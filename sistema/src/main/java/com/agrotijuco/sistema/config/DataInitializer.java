package com.agrotijuco.sistema.config;

import com.agrotijuco.sistema.config.tenant.TenantContext;
import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
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
