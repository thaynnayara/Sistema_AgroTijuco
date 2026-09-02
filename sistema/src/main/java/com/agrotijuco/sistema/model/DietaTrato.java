package com.agrotijuco.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_dietas_trato")
public class DietaTrato extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    @Column(name = "nome_dieta", nullable = false, length = 150)
    private String nomeDieta;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String ingredientes;

    @Column(name = "quantidade_kg_cabeca", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantidadeKgCabeca;

    @Column(name = "lote_destino", length = 100)
    private String loteDestino;

    @Column(name = "data_trato", nullable = false)
    private LocalDate dataTrato;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public DietaTrato() {}

    public DietaTrato(Propriedade propriedade, String nomeDieta, String ingredientes, BigDecimal quantidadeKgCabeca, String loteDestino, LocalDate dataTrato, String observacoes) {
        this.propriedade = propriedade;
        this.nomeDieta = nomeDieta;
        this.ingredientes = ingredientes;
        this.quantidadeKgCabeca = quantidadeKgCabeca;
        this.loteDestino = loteDestino;
        this.dataTrato = dataTrato;
        this.observacoes = observacoes;
    }

    public Propriedade getPropriedade() {
        return propriedade;
    }

    public void setPropriedade(Propriedade propriedade) {
        this.propriedade = propriedade;
    }

    public String getNomeDieta() {
        return nomeDieta;
    }

    public void setNomeDieta(String nomeDieta) {
        this.nomeDieta = nomeDieta;
    }

    public String getIngredientes() {
        return ingredientes;
    }

    public void setIngredientes(String ingredientes) {
        this.ingredientes = ingredientes;
    }

    public BigDecimal getQuantidadeKgCabeca() {
        return quantidadeKgCabeca;
    }

    public void setQuantidadeKgCabeca(BigDecimal quantidadeKgCabeca) {
        this.quantidadeKgCabeca = quantidadeKgCabeca;
    }

    public String getLoteDestino() {
        return loteDestino;
    }

    public void setLoteDestino(String loteDestino) {
        this.loteDestino = loteDestino;
    }

    public LocalDate getDataTrato() {
        return dataTrato;
    }

    public void setDataTrato(LocalDate dataTrato) {
        this.dataTrato = dataTrato;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
