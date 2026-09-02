package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.Piquete;
import com.agrotijuco.sistema.service.PastagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pastagens")
public class PastagemController {

    @Autowired
    private PastagemService service;

    @GetMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<List<Piquete>> listarPorPropriedade(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
    }

    public record PiqueteDTO(
            String nomePiquete,
            BigDecimal areaHectares,
            Integer capacidadeCabecas,
            String tipoCapim,
            String observacao
    ) {}

    @PostMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<Piquete> cadastrar(
            @PathVariable UUID propriedadeId,
            @RequestBody PiqueteDTO dto) {
        Piquete p = service.cadastrar(
                propriedadeId, dto.nomePiquete(), dto.areaHectares(),
                dto.capacidadeCabecas(), dto.tipoCapim(), dto.observacao()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(p);
    }
}
