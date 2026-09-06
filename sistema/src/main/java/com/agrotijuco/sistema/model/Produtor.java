package com.agrotijuco.sistema.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_produtores")
public class Produtor extends Auditable {

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 30)
    @JsonAlias({"cpfCnpj", "cpfOuCnpj"})
    private String cpfOuCnpj;

    private String email;
    private String telefone;
    private String endereco;

    public Produtor() {}

    public Produtor(String nome, String cpfOuCnpj, String email, String telefone) {
        this.nome = nome;
        this.cpfOuCnpj = cpfOuCnpj;
        this.email = email;
        this.telefone = telefone;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpfOuCnpj() {
        return cpfOuCnpj;
    }

    public void setCpfOuCnpj(String cpfOuCnpj) {
        this.cpfOuCnpj = cpfOuCnpj;
    }

    @JsonProperty("cpfCnpj")
    public String getCpfCnpj() {
        return cpfOuCnpj;
    }

    @JsonProperty("cpfCnpj")
    public void setCpfCnpj(String cpfCnpj) {
        this.cpfOuCnpj = cpfCnpj;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }
}
