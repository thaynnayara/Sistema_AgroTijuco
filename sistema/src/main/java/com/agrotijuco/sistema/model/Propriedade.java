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

    @jakarta.persistence.ManyToMany(fetch = FetchType.EAGER)
    @jakarta.persistence.JoinTable(
        name = "tb_propriedade_produtores",
        joinColumns = @JoinColumn(name = "propriedade_id"),
        inverseJoinColumns = @JoinColumn(name = "produtor_id")
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private java.util.Set<Produtor> produtores = new java.util.HashSet<>();

    @jakarta.persistence.Transient
    @JsonAlias({"produtoresIds", "produtorIds"})
    private java.util.List<UUID> produtorIdsInput;

    public Propriedade() {}

    public Propriedade(String nomeFazenda, String municipio, Double areaHectares, Produtor produtor) {
        this.nomeFazenda = nomeFazenda;
        this.municipio = municipio;
        this.areaHectares = areaHectares;
        this.produtor = produtor;
        if (produtor != null) {
            this.produtores.add(produtor);
        }
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
        if (produtor != null) {
            if (this.produtores == null) {
                this.produtores = new java.util.HashSet<>();
            }
            this.produtores.add(produtor);
        }
    }

    public java.util.Set<Produtor> getProdutores() {
        if (produtores == null) {
            produtores = new java.util.HashSet<>();
        }
        return produtores;
    }

    public void setProdutores(java.util.Set<Produtor> produtores) {
        this.produtores = produtores != null ? produtores : new java.util.HashSet<>();
        if (this.produtor == null && !this.produtores.isEmpty()) {
            this.produtor = this.produtores.iterator().next();
        }
    }

    public java.util.List<UUID> getProdutorIdsInput() {
        return produtorIdsInput;
    }

    public void setProdutorIdsInput(java.util.List<UUID> produtorIdsInput) {
        this.produtorIdsInput = produtorIdsInput;
    }

    @JsonProperty("produtoresIds")
    public java.util.List<UUID> getProdutoresIds() {
        java.util.Set<UUID> ids = new java.util.LinkedHashSet<>();
        try {
            if (produtores != null) {
                for (Produtor p : produtores) {
                    if (p != null && p.getId() != null) {
                        ids.add(p.getId());
                    }
                }
            }
        } catch (Exception ignored) {}
        try {
            if (produtor != null && produtor.getId() != null) {
                ids.add(produtor.getId());
            }
        } catch (Exception ignored) {}
        return new java.util.ArrayList<>(ids);
    }

    @JsonProperty("produtorNomes")
    public java.util.List<String> getProdutorNomes() {
        java.util.List<String> nomes = new java.util.ArrayList<>();
        try {
            if (produtores != null && !produtores.isEmpty()) {
                for (Produtor p : produtores) {
                    if (p != null && p.getNome() != null && !p.getNome().isBlank()) {
                        if (!nomes.contains(p.getNome())) {
                            nomes.add(p.getNome());
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        try {
            if (produtor != null && produtor.getNome() != null) {
                if (!nomes.contains(produtor.getNome())) {
                    nomes.add(produtor.getNome());
                }
            }
        } catch (Exception ignored) {}
        return nomes;
    }

    @JsonProperty("produtorId")
    public UUID getProdutorId() {
        try {
            return produtor != null ? produtor.getId() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    @JsonProperty("produtorNome")
    public String getProdutorNome() {
        try {
            java.util.List<String> nomes = getProdutorNomes();
            if (!nomes.isEmpty()) {
                return String.join(", ", nomes);
            }
            return produtor != null ? produtor.getNome() : null;
        } catch (Exception ignored) {
            return null;
        }
    }
}