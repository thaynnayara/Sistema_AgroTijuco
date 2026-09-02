package com.agrotijuco.sistema.dto.auth;

import java.util.UUID;

public class TokenResponseDTO {
    private String token;
    private String tokenType;
    private String tenantId;
    private String email;
    private String role;
    private String nome;
    private UUID produtorId;

    public TokenResponseDTO() {}

    public TokenResponseDTO(String token, String tokenType, String tenantId, String email, String role) {
        this.token = token;
        this.tokenType = tokenType;
        this.tenantId = tenantId;
        this.email = email;
        this.role = role;
    }

    public TokenResponseDTO(String token, String tokenType, String tenantId, String email, String role, String nome, UUID produtorId) {
        this.token = token;
        this.tokenType = tokenType;
        this.tenantId = tenantId;
        this.email = email;
        this.role = role;
        this.nome = nome;
        this.produtorId = produtorId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public UUID getProdutorId() {
        return produtorId;
    }

    public void setProdutorId(UUID produtorId) {
        this.produtorId = produtorId;
    }
}
