package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.dto.AnimalRequestDTO;
import com.agrotijuco.sistema.dto.AnimalResponseDTO;
import com.agrotijuco.sistema.model.StatusAnimal;
import com.agrotijuco.sistema.service.AnimalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/animais")
public class AnimalController {

    @Autowired
    private AnimalService service;

    @GetMapping
    public ResponseEntity<List<AnimalResponseDTO>> listarTodos(
            @RequestParam(required = false) UUID propriedadeId) {
        if (propriedadeId != null) {
            return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
        }
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<List<AnimalResponseDTO>> listarPorPropriedade(@PathVariable UUID propriedadeId) {
        return ResponseEntity.ok(service.listarPorPropriedade(propriedadeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping("/propriedade/{propriedadeId}")
    public ResponseEntity<AnimalResponseDTO> cadastrar(
            @RequestBody AnimalRequestDTO dto,
            @PathVariable UUID propriedadeId) {
        AnimalResponseDTO novoAnimal = service.cadastrar(dto, propriedadeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoAnimal);
    }

    /**
     * RF01 - Cadastro em Lote de Animais
     */
    @PostMapping("/propriedade/{propriedadeId}/lote")
    public ResponseEntity<List<AnimalResponseDTO>> cadastrarEmLote(
            @RequestBody List<AnimalRequestDTO> dtoList,
            @PathVariable UUID propriedadeId) {
        List<AnimalResponseDTO> criados = service.cadastrarEmLote(dtoList, propriedadeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criados);
    }

    /**
     * RN02 - Atualizar status (com bloqueio por carência sanitária caso VENDIDO/ABATIDO)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AnimalResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestParam StatusAnimal status) {
        AnimalResponseDTO atualizado = service.atualizarStatus(id, status);
        return ResponseEntity.ok(atualizado);
    }
}