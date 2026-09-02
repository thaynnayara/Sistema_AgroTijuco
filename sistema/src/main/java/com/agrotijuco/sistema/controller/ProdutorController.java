package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.model.Produtor;
import com.agrotijuco.sistema.service.ProdutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtores")
public class ProdutorController {

    @Autowired
    private ProdutorService service;

    @GetMapping
    public ResponseEntity<List<Produtor>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // Apenas a Gestora/Admin tem permissão para cadastrar produtores rurais
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<Produtor> cadastrar(@RequestBody Produtor produtor) {
        Produtor novoProdutor = service.cadastrar(produtor);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProdutor);
    }
}