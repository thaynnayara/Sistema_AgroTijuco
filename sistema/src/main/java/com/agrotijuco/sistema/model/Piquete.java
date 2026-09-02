package com.agrotijuco.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_piquetes")
public class Piquete extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    @Column(name = "nome_piquete", nullable = false, length = 100)
    private String nomePiquete;

    @Column(name = "area_hectares", nullable = false, precision = 10, scale = 2)
    private BigDecimal areaHectares;

    @Column(name = "capacidade_cabecas", nullable = false)
    private Integer capacidadeCabecas;

    @Column(name = "tipo_capim", length = 100)
    private String tipoCapim;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public Piquete() {}

    public Piquete(Propriedade propriedade, String nomePiquete, BigDecimal areaHectares, Integer capacidadeCabecas, String tipoCapim, String observacao) {
        this.propriedade = propriedade;
        this.nomePiquete = nomePiquete;
        this.areaHectares = areaHectares;
        this.capacidadeCabecas = capacidadeCabecas;
        this.tipoCapim = tipoCapim;
        this.observacao = observacao;
    }

    public Propriedade getPropriedade() {
        return propriedade;
    }

    public void setPropriedade(Propriedade propriedade) {
        this.propriedade = propriedade;
    }

    public String getNomePiquete() {
        return nomePiquete;
    }

    public void setNomePiquete(String nomePiquete) {
        this.nomePiquete = nomePiquete;
    }

    public BigDecimal getAreaHectares() {
        return areaHectares;
    }

    public void setAreaHectares(BigDecimal areaHectares) {
        this.areaHectares = areaHectares;
    }

    public Integer getCapacidadeCabecas() {
        return capacidadeCabecas;
    }

    public void setCapacidadeCabecas(Integer capacidadeCabecas) {
        this.capacidadeCabecas = capacidadeCabecas;
    }

    public String getTipoCapim() {
        return tipoCapim;
    }

    public void setTipoCapim(String tipoCapim) {
        this.tipoCapim = tipoCapim;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
