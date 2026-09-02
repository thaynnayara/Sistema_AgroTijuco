package com.agrotijuco.sistema.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_usuarios")
public class Usuario extends Auditable {

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(name = "produtor_id")
    private java.util.UUID produtorId;

    private boolean ativo = true;

    public Usuario() {}

    public Usuario(String nome, String email, String senha, Role role, boolean ativo) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.role = role;
        this.ativo = ativo;
    }

    public Usuario(String nome, String email, String senha, Role role, java.util.UUID produtorId, boolean ativo) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.role = role;
        this.produtorId = produtorId;
        this.ativo = ativo;
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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public java.util.UUID getProdutorId() {
        return produtorId;
    }

    public void setProdutorId(java.util.UUID produtorId) {
        this.produtorId = produtorId;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
