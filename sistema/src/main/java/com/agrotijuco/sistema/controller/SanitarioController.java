package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.RegistroSanitario;
import com.agrotijuco.sistema.service.SanitarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sanidade")
public class SanitarioController {

    @Autowired
    private SanitarioService service;

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<RegistroSanitario>> listarPorAnimal(@PathVariable UUID animalId) {
        return ResponseEntity.ok(service.listarPorAnimal(animalId));
    }

    @GetMapping("/carencias")
    public ResponseEntity<List<RegistroSanitario>> listarCarenciasAtivas() {
        return ResponseEntity.ok(service.listarCarenciasAtivas());
    }

    public record RegistroSanitarioDTO(
            UUID animalId,
            String lote,
            String medicamentoVacina,
            String tipo,
            String dose,
            LocalDate dataAplicacao,
            Integer diasCarencia,
            String observacao
    ) {}

    @PostMapping
    public ResponseEntity<RegistroSanitario> registrar(@RequestBody RegistroSanitarioDTO dto) {
        RegistroSanitario reg = service.registrar(
                dto.animalId(), dto.lote(), dto.medicamentoVacina(), dto.tipo(),
                dto.dose(), dto.dataAplicacao(), dto.diasCarencia(), dto.observacao()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(reg);
    }
}
