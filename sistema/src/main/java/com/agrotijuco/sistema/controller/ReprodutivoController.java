package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.EventoReprodutivo;
import com.agrotijuco.sistema.service.ReprodutivoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reproducao")
public class ReprodutivoController {

    @Autowired
    private ReprodutivoService service;

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<EventoReprodutivo>> listarPorAnimal(@PathVariable UUID animalId) {
        return ResponseEntity.ok(service.listarPorAnimal(animalId));
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<EventoReprodutivo>> listarAlertas() {
        return ResponseEntity.ok(service.listarAlertasPrevisao());
    }

    public record EventoReprodutivoDTO(String tipo, LocalDate dataEvento, String observacao) {}

    @PostMapping("/animal/{animalId}")
    public ResponseEntity<EventoReprodutivo> registrar(
            @PathVariable UUID animalId,
            @RequestBody EventoReprodutivoDTO dto) {
        EventoReprodutivo ev = service.registrarEvento(animalId, dto.tipo(), dto.dataEvento(), dto.observacao());
        return ResponseEntity.status(HttpStatus.CREATED).body(ev);
    }
}
