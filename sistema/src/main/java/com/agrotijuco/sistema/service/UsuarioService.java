package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.dto.UsuarioDTO;
import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAllUsersGlobal()
                .stream()
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    public UsuarioDTO buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        return new UsuarioDTO(usuario);
    }

    @Transactional
    public UsuarioDTO atualizarStatus(UUID id, boolean ativo) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        usuario.setAtivo(ativo);
        return new UsuarioDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioDTO atualizarRole(UUID id, Role role) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        usuario.setRole(role);
        return new UsuarioDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deletar(UUID id) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        usuarioRepository.delete(usuario);
    }
}
