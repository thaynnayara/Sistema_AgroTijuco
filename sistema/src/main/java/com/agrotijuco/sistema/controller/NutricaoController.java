package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.DietaTrato;
import com.agrotijuco.sistema.service.NutricaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/nutricao")
public class NutricaoController {

    @Autowired
    private NutricaoService service;

    @GetMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<List<DietaTrato>> listarPorPropriedade(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
    }

    public record DietaTratoDTO(
            String nomeDieta,
            String ingredientes,
            BigDecimal quantidadeKgCabeca,
            String loteDestino,
            LocalDate dataTrato,
            String observacoes
    ) {}

    @PostMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<DietaTrato> registrar(
            @PathVariable UUID propriedadeId,
            @RequestBody DietaTratoDTO dto) {
        DietaTrato d = service.registrar(
                propriedadeId, dto.nomeDieta(), dto.ingredientes(),
                dto.quantidadeKgCabeca(), dto.loteDestino(), dto.dataTrato(), dto.observacoes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }
}
