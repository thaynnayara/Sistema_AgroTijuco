package com.agrotijuco.sistema.dto;

import com.agrotijuco.sistema.model.Role;
import com.agrotijuco.sistema.model.Usuario;

import java.time.LocalDateTime;
import java.util.UUID;

public class UsuarioDTO {

    private UUID id;
    private String nome;
    private String email;
    private Role role;
    private String tenantId;
    private UUID produtorId;
    private boolean ativo;
    private LocalDateTime createdAt;

    public UsuarioDTO() {}

    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.role = usuario.getRole();
        this.tenantId = usuario.getTenantId();
        this.produtorId = usuario.getProdutorId();
        this.ativo = usuario.isAtivo();
        this.createdAt = usuario.getCreatedAt();
    }

    public UsuarioDTO(UUID id, String nome, String email, Role role, String tenantId, UUID produtorId, boolean ativo, LocalDateTime createdAt) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.role = role;
        this.tenantId = tenantId;
        this.produtorId = produtorId;
        this.ativo = ativo;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public UUID getProdutorId() {
        return produtorId;
    }

    public void setProdutorId(UUID produtorId) {
        this.produtorId = produtorId;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
