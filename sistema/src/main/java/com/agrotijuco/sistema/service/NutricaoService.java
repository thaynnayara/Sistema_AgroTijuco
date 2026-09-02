package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.DietaTrato;
import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.repository.DietaTratoRepository;
import com.agrotijuco.sistema.repository.PropriedadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class NutricaoService {

    @Autowired
    private DietaTratoRepository repository;

    @Autowired
    private PropriedadeRepository propriedadeRepository;

    public List<DietaTrato> listarPorPropriedade(UUID propriedadeId) {
        return repository.findByPropriedadeIdOrderByDataTratoDesc(propriedadeId);
    }

    @Transactional
    public DietaTrato registrar(UUID propriedadeId, String nomeDieta, String ingredientes, BigDecimal quantidadeKgCabeca, String loteDestino, LocalDate dataTrato, String observacoes) {
        Propriedade prop = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RuntimeException("Propriedade não encontrada."));

        LocalDate data = dataTrato != null ? dataTrato : LocalDate.now();
        DietaTrato d = new DietaTrato(prop, nomeDieta, ingredientes, quantidadeKgCabeca, loteDestino, data, observacoes);
        return repository.save(d);
    }
}
