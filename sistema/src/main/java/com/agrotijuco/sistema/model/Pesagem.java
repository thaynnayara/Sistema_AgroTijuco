package com.agrotijuco.sistema.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pesagens")
public class Pesagem extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "data_pesagem", nullable = false)
    private LocalDate dataPesagem;

    @Column(name = "peso_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal pesoKg;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public Pesagem() {}

    public Pesagem(Animal animal, LocalDate dataPesagem, BigDecimal pesoKg, String observacao) {
        this.animal = animal;
        this.dataPesagem = dataPesagem;
        this.pesoKg = pesoKg;
        this.observacao = observacao;
    }

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    public LocalDate getDataPesagem() {
        return dataPesagem;
    }

    public void setDataPesagem(LocalDate dataPesagem) {
        this.dataPesagem = dataPesagem;
    }

    public BigDecimal getPesoKg() {
        return pesoKg;
    }

    public void setPesoKg(BigDecimal pesoKg) {
        this.pesoKg = pesoKg;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
