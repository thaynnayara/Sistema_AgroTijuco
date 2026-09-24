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
    private final com.agrotijuco.sistema.repository.PropriedadeRepository propriedadeRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          ProdutorRepository produtorRepository,
                          com.agrotijuco.sistema.repository.PropriedadeRepository propriedadeRepository) {
        this.usuarioRepository = usuarioRepository;
        this.produtorRepository = produtorRepository;
        this.propriedadeRepository = propriedadeRepository;
    }

    public UsuarioDTO montarUsuarioDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO(usuario);
        if (usuario.getProdutorId() != null) {
            produtorRepository.findByIdIgnoringTenant(usuario.getProdutorId()).ifPresent(p -> {
                dto.setProdutorNome(p.getNome());
                dto.setProdutorCpfCnpj(p.getCpfOuCnpj());
            });
            try {
                var props = propriedadeRepository.findByProdutorIdGlobal(usuario.getProdutorId());
                dto.setFazendas(props.stream()
                        .map(com.agrotijuco.sistema.model.Propriedade::getNomeFazenda)
                        .filter(n -> n != null && !n.isBlank())
                        .distinct()
                        .collect(Collectors.toList()));
            } catch (Exception e) {
                // ignore
            }
        } else if (usuario.getRole() == Role.PRODUTOR) {
            // Tenta localizar produtor correspondente por email
            produtorRepository.findByEmailIgnoringTenant(usuario.getEmail()).ifPresent(p -> {
                usuario.setProdutorId(p.getId());
                usuarioRepository.save(usuario);
                dto.setProdutorId(p.getId());
                dto.setProdutorNome(p.getNome());
                dto.setProdutorCpfCnpj(p.getCpfOuCnpj());
                try {
                    var props = propriedadeRepository.findByProdutorIdGlobal(p.getId());
                    dto.setFazendas(props.stream()
                            .map(com.agrotijuco.sistema.model.Propriedade::getNomeFazenda)
                            .filter(n -> n != null && !n.isBlank())
                            .distinct()
                            .collect(Collectors.toList()));
                } catch (Exception e) {
                    // ignore
                }
            });
        }
        return dto;
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
                .map(this::montarUsuarioDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        return montarUsuarioDTO(usuario);
    }

    @Transactional
    public UsuarioDTO atualizarStatus(UUID id, boolean ativo) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        usuario.setAtivo(ativo);
        return montarUsuarioDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioDTO vincularProdutor(UUID usuarioId, UUID produtorId) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + usuarioId));
        if (produtorId != null) {
            Produtor p = produtorRepository.findByIdIgnoringTenant(produtorId)
                    .orElseThrow(() -> new RuntimeException("Produtor não encontrado com ID: " + produtorId));
            usuario.setProdutorId(p.getId());
            usuario.setRole(Role.PRODUTOR);
        } else {
            usuario.setProdutorId(null);
        }
        return montarUsuarioDTO(usuarioRepository.save(usuario));
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

        return montarUsuarioDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deletar(UUID id) {
        Usuario usuario = usuarioRepository.findByIdIgnoringTenant(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        usuarioRepository.delete(usuario);
    }
}
