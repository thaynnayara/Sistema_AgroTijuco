package com.agrotijuco.sistema.controller;

import com.agrotijuco.sistema.dto.UsuarioDTO;
import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.service.UsuarioService;
import com.agrotijuco.sistema.dto.auth.RegisterRequestDTO;
import com.agrotijuco.sistema.model.Usuario;
import com.agrotijuco.sistema.repository.UsuarioRepository;
import com.agrotijuco.sistema.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/usuarios", "/api/v1/usuarios"})
@PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioService usuarioService, AuthService authService, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
        this.authService = authService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> cadastrar(@RequestBody @Valid RegisterRequestDTO dto) {
        authService.register(dto);
        Usuario usuario = usuarioRepository.findByEmailIgnoringTenant(dto.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Erro ao recuperar usuário cadastrado"));
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.montarUsuarioDTO(usuario));
    }

    @PatchMapping("/{id}/produtor")
    public ResponseEntity<UsuarioDTO> vincularProdutor(@PathVariable UUID id, @RequestParam(required = false) UUID produtorId) {
        return ResponseEntity.ok(usuarioService.vincularProdutor(id, produtorId));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UsuarioDTO> atualizarStatus(@PathVariable UUID id, @RequestParam boolean ativo) {
        return ResponseEntity.ok(usuarioService.atualizarStatus(id, ativo));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UsuarioDTO> atualizarRole(@PathVariable UUID id, @RequestParam Role role) {
        return ResponseEntity.ok(usuarioService.atualizarRole(id, role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
