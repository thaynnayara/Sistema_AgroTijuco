package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.Piquete;
import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.repository.PiqueteRepository;
import com.agrotijuco.sistema.repository.PropriedadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class PastagemService {

    @Autowired
    private PiqueteRepository repository;

    @Autowired
    private PropriedadeRepository propriedadeRepository;

    public List<Piquete> listarPorPropriedade(UUID propriedadeId) {
        return repository.findByPropriedadeId(propriedadeId);
    }

    @Transactional
    public Piquete cadastrar(UUID propriedadeId, String nomePiquete, BigDecimal areaHectares, Integer capacidadeCabecas, String tipoCapim, String observacao) {
        Propriedade prop = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RuntimeException("Propriedade não encontrada."));

        Piquete p = new Piquete(prop, nomePiquete, areaHectares, capacidadeCabecas, tipoCapim, observacao);
        return repository.save(p);
    }
}
