package com.agrotijuco.sistema.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_propriedades")
public class Propriedade extends Auditable {

    @Column(nullable = false)
    private String nomeFazenda;

    @Column(nullable = false)
    private String municipio;

    private Double areaHectares;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produtor_id", nullable = false)
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

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public Double getAreaHectares() {
        return areaHectares;
    }

    public void setAreaHectares(Double areaHectares) {
        this.areaHectares = areaHectares;
    }

    public Produtor getProdutor() {
        return produtor;
    }

    public void setProdutor(Produtor produtor) {
        this.produtor = produtor;
    }
}