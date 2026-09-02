package com.agrotijuco.sistema.dto.auth;

import com.agrotijuco.sistema.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "A senha deve conter no mínimo 8 caracteres")
    private String senha;

    @NotBlank(message = "Tenant ID é obrigatório para isolamento do cliente")
    private String tenantId;

    @NotNull(message = "Role é obrigatória")
    private Role role;

    public RegisterRequestDTO() {}

    public RegisterRequestDTO(String nome, String email, String senha, String tenantId, Role role) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.tenantId = tenantId;
        this.role = role;
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

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
