package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.ItemEstoque;
import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.repository.ItemEstoqueRepository;
import com.agrotijuco.sistema.repository.PropriedadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class EstoqueService {

    @Autowired
    private ItemEstoqueRepository repository;

    @Autowired
    private PropriedadeRepository propriedadeRepository;

    public List<ItemEstoque> listarPorPropriedade(UUID propriedadeId) {
        return repository.findByPropriedadeId(propriedadeId);
    }

    public List<ItemEstoque> listarAlertasEstoqueBaixo(UUID propriedadeId) {
        return repository.findItensEstoqueBaixo(propriedadeId);
    }

    @Transactional
    public ItemEstoque cadastrarOuAtualizar(UUID propriedadeId, String nomeItem, String categoria, BigDecimal quantidadeAtual, BigDecimal quantidadeMinima, String unidadeMedida) {
        Propriedade prop = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RuntimeException("Propriedade não encontrada."));

        ItemEstoque item = new ItemEstoque(prop, nomeItem, categoria.toUpperCase(), quantidadeAtual, quantidadeMinima, unidadeMedida.toUpperCase());
        return repository.save(item);
    }

    @Transactional
    public ItemEstoque movimentarEstoque(UUID itemId, BigDecimal quantidade, boolean eEntrada) {
        ItemEstoque item = repository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item de estoque não encontrado."));

        BigDecimal novaQtd;
        if (eEntrada) {
            novaQtd = item.getQuantidadeAtual().add(quantidade);
        } else {
            novaQtd = item.getQuantidadeAtual().subtract(quantidade);
            if (novaQtd.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Quantidade insuficiente em estoque.");
            }
        }

        item.setQuantidadeAtual(novaQtd);
        return repository.save(item);
    }
}
