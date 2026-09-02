package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.config.security.JwtTokenService;
import com.agrotijuco.sistema.dto.auth.LoginRequestDTO;
import com.agrotijuco.sistema.dto.auth.RegisterRequestDTO;
import com.agrotijuco.sistema.dto.auth.TokenResponseDTO;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public TokenResponseDTO register(RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado na plataforma.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setTenantId(dto.getTenantId());
        usuario.setRole(dto.getRole());
        usuario.setAtivo(true);

        usuarioRepository.save(usuario);

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
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        if (!usuario.isAtivo()) {
            throw new IllegalStateException("Usuário inativo.");
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
