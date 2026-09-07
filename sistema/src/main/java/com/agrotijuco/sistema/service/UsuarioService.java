package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.dto.UsuarioDTO;
import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.model.Produtor;
import com.agrotijuco.sistema.repository.ProdutorRepository;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ProdutorRepository produtorRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, ProdutorRepository produtorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.produtorRepository = produtorRepository;
    }

    public List<UsuarioDTO> listarTodos() {
        List<Usuario> list;
        try {
            list = usuarioRepository.findAllUsersGlobal();
            if (list == null || list.isEmpty()) {
                list = usuarioRepository.findAll();
            }
        } catch (Exception e) {
            list = usuarioRepository.findAll();
        }
        return list.stream()
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

        if (role == Role.PRODUTOR && usuario.getProdutorId() == null) {
            Produtor produtor = produtorRepository.findByEmailIgnoringTenant(usuario.getEmail())
                    .orElseGet(() -> {
                        Produtor p = new Produtor(
                                usuario.getNome(),
                                "CPF-" + UUID.randomUUID().toString().substring(0, 8),
                                usuario.getEmail(),
                                ""
                        );
                        p.setTenantId(usuario.getTenantId() != null && !usuario.getTenantId().isBlank() ? usuario.getTenantId() : "Fazenda AgroTijuco");
                        return produtorRepository.save(p);
                    });
            usuario.setProdutorId(produtor.getId());
        }

        return new UsuarioDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deletar(UUID id) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        usuarioRepository.delete(usuario);
    }
}
