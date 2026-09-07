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

    public List<Propriedade> listarTodas() {
        List<Propriedade> list = propriedadeRepository.findAllGlobal();
        if (list.isEmpty()) {
            return propriedadeRepository.findAll();
        }
        return list;
    }

    public List<Propriedade> listarPorProdutor(UUID produtorId) {
        List<Propriedade> list = propriedadeRepository.findByProdutorIdGlobal(produtorId);
        if (list.isEmpty()) {
            return propriedadeRepository.findByProdutorId(produtorId);
        }
        return list;
    }

    @Transactional
    public Propriedade cadastrar(Propriedade propriedade, UUID produtorId) {
        // Regra 1: O Produtor precisa existir no banco (atribuído pela gestora)
        Produtor produtor = produtorRepository.findByIdIgnoringTenant(produtorId)
                .orElseGet(() -> produtorRepository.findById(produtorId)
                        .orElseThrow(() -> new RuntimeException("Não é possível cadastrar a propriedade. Produtor não encontrado.")));

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

        if (propriedade.getTenantId() == null || propriedade.getTenantId().isBlank()) {
            propriedade.setTenantId(produtor.getTenantId() != null && !produtor.getTenantId().isBlank() ? produtor.getTenantId() : "Fazenda AgroTijuco");
        }

        propriedade.setProdutor(produtor);
        return propriedadeRepository.save(propriedade);
    }

    @Transactional
    public Propriedade atribuirProdutor(UUID propriedadeId, UUID novoProdutorId) {
        Propriedade propriedade = buscarPorId(propriedadeId);

        Produtor novoProdutor = produtorRepository.findByIdIgnoringTenant(novoProdutorId)
                .orElseGet(() -> produtorRepository.findById(novoProdutorId)
                        .orElseThrow(() -> new RuntimeException("Produtor não encontrado para atribuição.")));

        propriedade.setProdutor(novoProdutor);
        return propriedadeRepository.save(propriedade);
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

        return propriedadeRepository.save(propriedade);
    }

    @Transactional
    public void deletar(UUID id) {
        Propriedade prop = buscarPorId(id);
        propriedadeRepository.delete(prop);
    }
}