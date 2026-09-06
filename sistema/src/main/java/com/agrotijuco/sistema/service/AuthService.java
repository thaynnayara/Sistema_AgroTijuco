package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.config.security.JwtTokenService;
import com.agrotijuco.sistema.dto.auth.LoginRequestDTO;
import com.agrotijuco.sistema.dto.auth.RegisterRequestDTO;
import com.agrotijuco.sistema.dto.auth.TokenResponseDTO;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import com.agrotijuco.sistema.config.tenant.TenantContext;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final com.agrotijuco.sistema.repository.ProdutorRepository produtorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(UsuarioRepository usuarioRepository,
                       com.agrotijuco.sistema.repository.ProdutorRepository produtorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.produtorRepository = produtorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public TokenResponseDTO register(RegisterRequestDTO dto) {
        String normalizedEmail = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        if (usuarioRepository.existsByEmailIgnoringTenant(normalizedEmail)) {
            throw new IllegalArgumentException("Email já cadastrado na plataforma.");
        }

        String previousTenant = TenantContext.getCurrentTenant();
        Usuario usuario = new Usuario();
        try {
            TenantContext.setCurrentTenant(dto.getTenantId());
            usuario.setNome(dto.getNome());
            usuario.setEmail(normalizedEmail);
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
            usuario.setTenantId(dto.getTenantId());
            usuario.setRole(dto.getRole() != null ? dto.getRole() : com.agrotijuco.sistema.model.Role.PRODUTOR);
            usuario.setAtivo(true);

            if (usuario.getRole() == com.agrotijuco.sistema.model.Role.PRODUTOR) {
                com.agrotijuco.sistema.model.Produtor produtor = new com.agrotijuco.sistema.model.Produtor(
                        usuario.getNome(),
                        "CPF-" + java.util.UUID.randomUUID().toString().substring(0, 8),
                        usuario.getEmail(),
                        ""
                );
                produtor.setTenantId(dto.getTenantId());
                produtor = produtorRepository.save(produtor);
                usuario.setProdutorId(produtor.getId());
            }

            usuarioRepository.save(usuario);
        } finally {
            if (previousTenant != null && !previousTenant.isBlank()) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }

        String token = jwtTokenService.generateToken(
                usuario.getEmail(),
                usuario.getTenantId(),
                usuario.getRole().name(),
                usuario.getProdutorId(),
                usuario.getNome()
        );

        return new TokenResponseDTO(
                token,
                "Bearer",
                usuario.getTenantId(),
                usuario.getEmail(),
                usuario.getRole().name(),
                usuario.getNome(),
                usuario.getProdutorId()
        );
    }

    public TokenResponseDTO login(LoginRequestDTO dto) {
        String normalizedEmail = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        Usuario usuario = usuarioRepository.findByEmailIgnoringTenant(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }

        if (!usuario.isAtivo()) {
            throw new IllegalStateException("Usuário inativo. Entre em contato com o administrador.");
        }

        String token = jwtTokenService.generateToken(
                usuario.getEmail(),
                usuario.getTenantId(),
                usuario.getRole().name(),
                usuario.getProdutorId(),
                usuario.getNome()
        );

        return new TokenResponseDTO(
                token,
                "Bearer",
                usuario.getTenantId(),
                usuario.getEmail(),
                usuario.getRole().name(),
                usuario.getNome(),
                usuario.getProdutorId()
        );
    }
}
