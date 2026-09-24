package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.Produtor;
import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.repository.ProdutorRepository;
import com.agrotijuco.sistema.repository.PropriedadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PropriedadeService {

    @Autowired
    private PropriedadeRepository propriedadeRepository;

    @Autowired
    private ProdutorRepository produtorRepository;

    @Autowired
    private com.agrotijuco.sistema.repository.UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<Propriedade> listarTodas() {
        List<Propriedade> list = propriedadeRepository.findAllGlobal();
        if (list.isEmpty()) {
            list = propriedadeRepository.findAll();
        }
        for (Propriedade p : list) {
            try {
                if (p.getProdutor() != null) {
                    p.getProdutor().getNome();
                }
            } catch (Exception ignored) {
                p.setProdutor(null);
            }
            try {
                if (p.getProdutores() != null) {
                    p.getProdutores().size();
                }
            } catch (Exception ignored) {}
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<Propriedade> listarPorProdutor(UUID produtorId) {
        List<Propriedade> list = propriedadeRepository.findByProdutorIdGlobal(produtorId);
        if (list.isEmpty()) {
            list = propriedadeRepository.findByProdutorId(produtorId);
        }
        for (Propriedade p : list) {
            try {
                if (p.getProdutor() != null) {
                    p.getProdutor().getNome();
                }
            } catch (Exception ignored) {
                p.setProdutor(null);
            }
            try {
                if (p.getProdutores() != null) {
                    p.getProdutores().size();
                }
            } catch (Exception ignored) {}
        }
        return list;
    }

    public java.util.Set<Produtor> resolverProdutores(List<UUID> produtorIds) {
        java.util.Set<Produtor> resultado = new java.util.LinkedHashSet<>();
        if (produtorIds == null || produtorIds.isEmpty()) {
            return resultado;
        }
        for (UUID pid : produtorIds) {
            if (pid != null) {
                try {
                    Produtor p = resolverProdutor(pid);
                    if (p != null) {
                        resultado.add(p);
                    }
                } catch (Exception e) {
                    // Log e ignora ID inválido
                }
            }
        }
        return resultado;
    }

    private Produtor resolverProdutor(UUID produtorId) {
        if (produtorId == null) {
            return null;
        }

        // 1. Tenta buscar em tb_produtores por ID
        var optProdutor = produtorRepository.findByIdIgnoringTenant(produtorId);
        if (optProdutor.isPresent()) {
            return optProdutor.get();
        }

        var optProdutorFallback = produtorRepository.findById(produtorId);
        if (optProdutorFallback.isPresent()) {
            return optProdutorFallback.get();
        }

        // 2. Se não encontrou, verifica se o produtorId é o ID de um Usuario com role PRODUTOR
        var optUsuario = usuarioRepository.findByIdIgnoringTenant(produtorId);
        if (optUsuario.isEmpty()) {
            optUsuario = usuarioRepository.findById(produtorId);
        }

        if (optUsuario.isPresent()) {
            com.agrotijuco.sistema.model.Usuario u = optUsuario.get();
            if (u.getProdutorId() != null) {
                var p = produtorRepository.findByIdIgnoringTenant(u.getProdutorId());
                if (p.isPresent()) {
                    return p.get();
                }
            }
            // Tenta por email
            var pEmail = produtorRepository.findByEmailIgnoringTenant(u.getEmail());
            if (pEmail.isPresent()) {
                u.setProdutorId(pEmail.get().getId());
                usuarioRepository.save(u);
                return pEmail.get();
            }
            // Cria registro de produtor para este usuário automaticamente
            Produtor novo = new Produtor(
                    u.getNome(),
                    "CPF-" + UUID.randomUUID().toString().substring(0, 8),
                    u.getEmail(),
                    ""
            );
            novo.setTenantId(u.getTenantId() != null && !u.getTenantId().isBlank() ? u.getTenantId() : "Fazenda AgroTijuco");
            novo = produtorRepository.save(novo);
            u.setProdutorId(novo.getId());
            usuarioRepository.save(u);
            return novo;
        }

        throw new RuntimeException("Não é possível cadastrar a propriedade. Produtor não encontrado com o ID informado: " + produtorId);
    }

    @Transactional
    public Propriedade cadastrar(Propriedade propriedade, List<UUID> produtorIds) {
        java.util.Set<Produtor> prods = resolverProdutores(produtorIds);

        // Se produtorIds foi vazio mas a propriedade já tem produtor/produtores
        if (prods.isEmpty() && propriedade.getProdutor() != null) {
            prods.add(propriedade.getProdutor());
        }
        if (prods.isEmpty() && propriedade.getProdutores() != null && !propriedade.getProdutores().isEmpty()) {
            prods.addAll(propriedade.getProdutores());
        }

        // Normalização de campos para não violar restrições NOT NULL
        if (propriedade.getNomeFazenda() == null || propriedade.getNomeFazenda().isBlank()) {
            if (propriedade.getNome() != null && !propriedade.getNome().isBlank()) {
                propriedade.setNomeFazenda(propriedade.getNome());
            } else {
                propriedade.setNomeFazenda("Fazenda sem nome");
            }
        }

        if (propriedade.getMunicipio() == null || propriedade.getMunicipio().isBlank()) {
            if (propriedade.getLocalizacao() != null && !propriedade.getLocalizacao().isBlank()) {
                propriedade.setMunicipio(propriedade.getLocalizacao());
            } else {
                propriedade.setMunicipio("Localização não informada");
            }
        }

        if (propriedade.getAreaHectares() == null || propriedade.getAreaHectares() <= 0) {
            propriedade.setAreaHectares(10.0);
        }

        Produtor produtorPrincipal = !prods.isEmpty() ? prods.iterator().next() : null;

        if (propriedade.getTenantId() == null || propriedade.getTenantId().isBlank()) {
            String tId = (produtorPrincipal != null && produtorPrincipal.getTenantId() != null && !produtorPrincipal.getTenantId().isBlank())
                    ? produtorPrincipal.getTenantId()
                    : "Fazenda AgroTijuco";
            propriedade.setTenantId(tId);
        }

        propriedade.setProdutor(produtorPrincipal);
        propriedade.setProdutores(prods);
        return propriedadeRepository.save(propriedade);
    }

    @Transactional
    public Propriedade cadastrar(Propriedade propriedade, UUID produtorId) {
        List<UUID> ids = produtorId != null ? List.of(produtorId) : java.util.Collections.emptyList();
        return cadastrar(propriedade, ids);
    }

    @Transactional
    public Propriedade atribuirProdutores(UUID propriedadeId, List<UUID> novosProdutorIds) {
        Propriedade propriedade = buscarPorId(propriedadeId);
        java.util.Set<Produtor> novos = resolverProdutores(novosProdutorIds);

        propriedade.setProdutores(novos);
        if (!novos.isEmpty()) {
            propriedade.setProdutor(novos.iterator().next());
        } else {
            propriedade.setProdutor(null);
        }
        return propriedadeRepository.save(propriedade);
    }

    @Transactional
    public Propriedade atribuirProdutor(UUID propriedadeId, UUID novoProdutorId) {
        if (novoProdutorId == null) {
            return atribuirProdutores(propriedadeId, java.util.Collections.emptyList());
        }
        return atribuirProdutores(propriedadeId, List.of(novoProdutorId));
    }

    public Propriedade buscarPorId(UUID id) {
        return propriedadeRepository.findByIdIgnoringTenant(id)
                .orElseGet(() -> propriedadeRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Propriedade não encontrada com ID: " + id)));
    }

    @Transactional
    public Propriedade atualizar(UUID id, Propriedade dadosAtualizados) {
        Propriedade propriedade = buscarPorId(id);
        if (dadosAtualizados.getNomeFazenda() != null && !dadosAtualizados.getNomeFazenda().isBlank()) {
            propriedade.setNomeFazenda(dadosAtualizados.getNomeFazenda());
        } else if (dadosAtualizados.getNome() != null && !dadosAtualizados.getNome().isBlank()) {
            propriedade.setNomeFazenda(dadosAtualizados.getNome());
        }

        if (dadosAtualizados.getMunicipio() != null && !dadosAtualizados.getMunicipio().isBlank()) {
            propriedade.setMunicipio(dadosAtualizados.getMunicipio());
        } else if (dadosAtualizados.getLocalizacao() != null && !dadosAtualizados.getLocalizacao().isBlank()) {
            propriedade.setMunicipio(dadosAtualizados.getLocalizacao());
        }

        if (dadosAtualizados.getAreaHectares() != null && dadosAtualizados.getAreaHectares() > 0) {
            propriedade.setAreaHectares(dadosAtualizados.getAreaHectares());
        }

        if (dadosAtualizados.getInscricaoEstadual() != null) {
            propriedade.setInscricaoEstadual(dadosAtualizados.getInscricaoEstadual());
        }

        if (dadosAtualizados.getProdutorIdsInput() != null) {
            java.util.Set<Produtor> novos = resolverProdutores(dadosAtualizados.getProdutorIdsInput());
            propriedade.setProdutores(novos);
            if (!novos.isEmpty()) {
                propriedade.setProdutor(novos.iterator().next());
            } else {
                propriedade.setProdutor(null);
            }
        }

        return propriedadeRepository.save(propriedade);
    }

    @Transactional
    public void deletar(UUID id) {
        Propriedade prop = buscarPorId(id);
        propriedadeRepository.delete(prop);
    }
}