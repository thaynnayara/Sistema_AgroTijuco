package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.Produtor;
import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.ProdutorRepository;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProdutorService {

    @Autowired
    private ProdutorRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public List<Produtor> listarTodos() {
        // Sincroniza automaticamente qualquer usuário cadastrado com perfil PRODUTOR para tb_produtores
        try {
            List<Usuario> usuariosProdutores = usuarioRepository.findAllUsersGlobal()
                    .stream()
                    .filter(u -> u.getRole() == Role.PRODUTOR)
                    .collect(Collectors.toList());

            for (Usuario u : usuariosProdutores) {
                if (u.getProdutorId() == null) {
                    Produtor produtor = repository.findByEmailIgnoringTenant(u.getEmail())
                            .orElseGet(() -> {
                                Produtor novo = new Produtor(
                                        u.getNome(),
                                        "CPF-" + UUID.randomUUID().toString().substring(0, 8),
                                        u.getEmail(),
                                        ""
                                );
                                novo.setTenantId(u.getTenantId() != null && !u.getTenantId().isBlank() ? u.getTenantId() : "Fazenda AgroTijuco");
                                return repository.save(novo);
                            });
                    u.setProdutorId(produtor.getId());
                    usuarioRepository.save(u);
                }
            }
        } catch (Exception e) {
            // Em caso de inconsistência de sincronização, segue com a consulta aos produtores existentes
        }

        List<Produtor> produtores = repository.findAllGlobal();
        if (produtores.isEmpty()) {
            produtores = repository.findAll();
        }
        return produtores;
    }

    @Transactional
    public Produtor cadastrar(Produtor produtor) {
        if (produtor.getCpfOuCnpj() == null || produtor.getCpfOuCnpj().trim().isEmpty()) {
            throw new IllegalArgumentException("CPF ou CNPJ é obrigatório.");
        }
        if (produtor.getTenantId() == null || produtor.getTenantId().isBlank()) {
            produtor.setTenantId("Fazenda AgroTijuco");
        }
        return repository.save(produtor);
    }

    public Produtor buscarPorId(UUID id) {
        return repository.findByIdIgnoringTenant(id)
                .orElseGet(() -> repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Produtor não encontrado com o ID: " + id)));
    }
}