package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.service.PropriedadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/propriedades")
public class PropriedadeController {

    @Autowired
    private PropriedadeService service;

    @GetMapping
    public ResponseEntity<List<Propriedade>> listarTodas(
            @RequestParam(required = false) UUID produtorId) {
        if (produtorId != null) {
            return ResponseEntity.ok(service.listarPorProdutor(produtorId));
        }
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/produtor/{produtorId}")
    public ResponseEntity<List<Propriedade>> listarPorProdutor(@PathVariable UUID produtorId) {
        return ResponseEntity.ok(service.listarPorProdutor(produtorId));
    }

    // Apenas a Gestora/Admin pode cadastrar nova propriedade e atribuir a um produtor
    @PostMapping("/produtor/{produtorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<Propriedade> cadastrar(
            @RequestBody Propriedade propriedade,
            @PathVariable UUID produtorId) {

        Propriedade novaPropriedade = service.cadastrar(propriedade, produtorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaPropriedade);
    }

    // Apenas a Gestora/Admin pode alterar/atribuir a fazenda a outro produtor
    @PutMapping("/{propriedadeId}/atribuir-produtor/{produtorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<Propriedade> atribuirProdutor(
            @PathVariable UUID propriedadeId,
            @PathVariable UUID produtorId) {

        Propriedade atualizada = service.atribuirProdutor(propriedadeId, produtorId);
        return ResponseEntity.ok(atualizada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Propriedade> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<Propriedade> atualizar(
            @PathVariable UUID id,
            @RequestBody Propriedade dados) {
        Propriedade atualizada = service.atualizar(id, dados);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}