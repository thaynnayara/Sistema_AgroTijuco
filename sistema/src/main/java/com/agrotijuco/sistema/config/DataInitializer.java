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
        criarUsuarioSeNaoExistir("Thaynná Yara Admin", "thaynna.yara@agrotijuco.com.br", "AdminAgro2026!", "Fazenda AgroTijuco", Role.ADMIN);
        criarUsuarioSeNaoExistir("Thaynná Yara", "thaynna@agrotijuco.com.br", "AdminAgro2026!", "Fazenda AgroTijuco", Role.ADMIN);
    }

    private void criarUsuarioSeNaoExistir(String nome, String email, String senhaPlana, String tenantId, Role role) {
        String normalizedEmail = email.trim().toLowerCase();
        if (!usuarioRepository.existsByEmailIgnoringTenant(normalizedEmail)) {
            try {
                TenantContext.setCurrentTenant(tenantId);
                Usuario admin = new Usuario();
                admin.setNome(nome);
                admin.setEmail(normalizedEmail);
                admin.setSenha(passwordEncoder.encode(senhaPlana));
                admin.setTenantId(tenantId);
                admin.setRole(role);
                admin.setAtivo(true);
                usuarioRepository.save(admin);
                log.info("✓ Usuário administrador inicial criado com sucesso: {}", normalizedEmail);
            } catch (Exception e) {
                log.error("Erro ao criar usuário inicial {}: {}", normalizedEmail, e.getMessage());
            } finally {
                TenantContext.clear();
            }
        }
    }
}
