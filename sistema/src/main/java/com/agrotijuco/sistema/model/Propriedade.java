package com.agrotijuco.sistema.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "tb_propriedades")
public class Propriedade extends Auditable {

    @Column(nullable = false)
    @JsonAlias({"nome", "nomeFazenda"})
    private String nomeFazenda;

    @Column(nullable = false)
    @JsonAlias({"localizacao", "municipio"})
    private String municipio;

    private Double areaHectares;

    private String inscricaoEstadual;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produtor_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Produtor produtor;

    public Propriedade() {}

    public Propriedade(String nomeFazenda, String municipio, Double areaHectares, Produtor produtor) {
        this.nomeFazenda = nomeFazenda;
        this.municipio = municipio;
        this.areaHectares = areaHectares;
        this.produtor = produtor;
    }

    public String getNomeFazenda() {
        return nomeFazenda;
    }

    public void setNomeFazenda(String nomeFazenda) {
        this.nomeFazenda = nomeFazenda;
    }

    @JsonProperty("nome")
    public String getNome() {
        return nomeFazenda;
    }

    @JsonProperty("nome")
    public void setNome(String nome) {
        this.nomeFazenda = nome;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    @JsonProperty("localizacao")
    public String getLocalizacao() {
        return municipio;
    }

    @JsonProperty("localizacao")
    public void setLocalizacao(String localizacao) {
        this.municipio = localizacao;
    }

    public Double getAreaHectares() {
        return areaHectares;
    }

    public void setAreaHectares(Double areaHectares) {
        this.areaHectares = areaHectares;
    }

    public String getInscricaoEstadual() {
        return inscricaoEstadual;
    }

    public void setInscricaoEstadual(String inscricaoEstadual) {
        this.inscricaoEstadual = inscricaoEstadual;
    }

    public Produtor getProdutor() {
        return produtor;
    }

    public void setProdutor(Produtor produtor) {
        this.produtor = produtor;
    }

    @JsonProperty("produtorId")
    public UUID getProdutorId() {
        return produtor != null ? produtor.getId() : null;
    }

    @JsonProperty("produtorNome")
    public String getProdutorNome() {
        return produtor != null ? produtor.getNome() : null;
    }
}