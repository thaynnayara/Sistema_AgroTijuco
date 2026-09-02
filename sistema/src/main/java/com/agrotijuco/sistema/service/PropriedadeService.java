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
        return propriedadeRepository.findAll();
    }

    public List<Propriedade> listarPorProdutor(UUID produtorId) {
        return propriedadeRepository.findByProdutorId(produtorId);
    }

    @Transactional
    public Propriedade cadastrar(Propriedade propriedade, UUID produtorId) {
        //Regra 1: O Produtor precisa existir no banco (atribuído pela gestora)
        Produtor produtor = produtorRepository.findById(produtorId)
                .orElseThrow(() -> new RuntimeException("Não é possível cadastrar a propriedade. Produtor não encontrado."));

        //Regra 2: Validar dados básicos
        if (propriedade.getAreaHectares() != null && propriedade.getAreaHectares() <= 0) {
            throw new IllegalArgumentException("A área em hectares deve ser maior que zero.");
        }

        propriedade.setProdutor(produtor);
        return propriedadeRepository.save(propriedade);
    }

    @Transactional
    public Propriedade atribuirProdutor(UUID propriedadeId, UUID novoProdutorId) {
        Propriedade propriedade = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RuntimeException("Propriedade não encontrada."));

        Produtor novoProdutor = produtorRepository.findById(novoProdutorId)
                .orElseThrow(() -> new RuntimeException("Produtor não encontrado para atribuição."));

        propriedade.setProdutor(novoProdutor);
        return propriedadeRepository.save(propriedade);
    }
}