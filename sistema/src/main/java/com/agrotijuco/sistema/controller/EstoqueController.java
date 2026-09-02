package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.ItemEstoque;
import com.agrotijuco.sistema.service.EstoqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/estoque")
public class EstoqueController {

    @Autowired
    private EstoqueService service;

    @GetMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<List<ItemEstoque>> listarPorPropriedade(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
    }

    @GetMapping("/propriedade/{propriedadeId}/alertas")
    public ResponseEntity<List<ItemEstoque>> listarAlertas(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarAlertasEstoqueBaixo(propriedadeId));
    }

    public record ItemEstoqueDTO(
            String nomeItem,
            String categoria,
            BigDecimal quantidadeAtual,
            BigDecimal quantidadeMinima,
            String unidadeMedida
    ) {}

    @PostMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<ItemEstoque> cadastrar(
            @PathVariable UUID propriedadeId,
            @RequestBody ItemEstoqueDTO dto) {
        ItemEstoque item = service.cadastrarOuAtualizar(
                propriedadeId, dto.nomeItem(), dto.categoria(),
                dto.quantidadeAtual(), dto.quantidadeMinima(), dto.unidadeMedida()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PostMapping("/{itemId}/movimentar")
    public ResponseEntity<ItemEstoque> movimentar(
            @PathVariable UUID itemId,
            @RequestParam BigDecimal quantidade,
            @RequestParam boolean entrada) {
        ItemEstoque item = service.movimentarEstoque(itemId, quantidade, entrada);
        return ResponseEntity.ok(item);
    }
}
