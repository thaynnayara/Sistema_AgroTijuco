package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.DespesaOperacional;
import com.agrotijuco.sistema.service.FinanceiroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/financeiro")
public class FinanceiroController {

    @Autowired
    private FinanceiroService service;

    @GetMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<List<DespesaOperacional>> listarPorPropriedade(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
    }

    @GetMapping("/propriedade/{propriedadeId}/apuracao")
    public ResponseEntity<FinanceiroService.ResumoApuracaoCustosDTO> apurarCustos(
            @PathVariable UUID propriedadeId,
            @RequestParam(required = false, defaultValue = "0") BigDecimal arrobas,
            @RequestParam(required = false, defaultValue = "0") BigDecimal litros) {
        return ResponseEntity.ok(service.calcularApuracaoCustos(propriedadeId, arrobas, litros));
    }

    public record DespesaDTO(
            String descricao,
            String categoria,
            BigDecimal valor,
            LocalDate dataDespesa,
            String tipoProducao,
            BigDecimal totalProduzidoPeriodo
    ) {}

    @PostMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<DespesaOperacional> registrarDespesa(
            @PathVariable UUID propriedadeId,
            @RequestBody DespesaDTO dto) {
        DespesaOperacional d = service.registrarDespesa(
                propriedadeId, dto.descricao(), dto.categoria(), dto.valor(),
                dto.dataDespesa(), dto.tipoProducao(), dto.totalProduzidoPeriodo()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }
}
