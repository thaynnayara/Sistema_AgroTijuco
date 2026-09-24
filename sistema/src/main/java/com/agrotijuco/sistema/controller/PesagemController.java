package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.dto.PesagemRequestDTO;
import com.agrotijuco.sistema.dto.PesagemResponseDTO;
import com.agrotijuco.sistema.service.PesagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pesagens")
public class PesagemController {

    @Autowired
    private PesagemService service;

    @GetMapping
    public ResponseEntity<List<PesagemResponseDTO>> listarTodas(
            @RequestParam(required = false) UUID animalId,
            @RequestParam(required = false) UUID propriedadeId) {
        if (animalId != null) {
            return ResponseEntity.ok(service.listarPorAnimal(animalId));
        }
        if (propriedadeId != null) {
            return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
        }
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<List<PesagemResponseDTO>> listarPorPropriedade(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<PesagemResponseDTO>> listarPorAnimal(@PathVariable UUID animalId) {
        return ResponseEntity.ok(service.listarPorAnimal(animalId));
    }

    @PostMapping("/animal/{animalId}")
    public ResponseEntity<PesagemResponseDTO> registrar(
            @RequestBody PesagemRequestDTO dto,
            @PathVariable UUID animalId) {

        PesagemResponseDTO resposta = service.registrarPesagem(dto, animalId);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }
}