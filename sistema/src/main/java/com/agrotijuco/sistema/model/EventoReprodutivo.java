package com.agrotijuco.sistema.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tb_eventos_reprodutivos")
public class EventoReprodutivo extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false, length = 50)
    private String tipo; // INSEMINACAO, IATF, TOQUE, PARTO, SECAGEM

    @Column(name = "data_evento", nullable = false)
    private LocalDate dataEvento;

    @Column(name = "data_previsao_proxima_etapa")
    private LocalDate dataPrevisaoProximaEtapa;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public EventoReprodutivo() {}

    public EventoReprodutivo(Animal animal, String tipo, LocalDate dataEvento, LocalDate dataPrevisaoProximaEtapa, String observacao) {
        this.animal = animal;
        this.tipo = tipo;
        this.dataEvento = dataEvento;
        this.dataPrevisaoProximaEtapa = dataPrevisaoProximaEtapa;
        this.observacao = observacao;
    }

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDate getDataEvento() {
        return dataEvento;
    }

    public void setDataEvento(LocalDate dataEvento) {
        this.dataEvento = dataEvento;
    }

    public LocalDate getDataPrevisaoProximaEtapa() {
        return dataPrevisaoProximaEtapa;
    }

    public void setDataPrevisaoProximaEtapa(LocalDate dataPrevisaoProximaEtapa) {
        this.dataPrevisaoProximaEtapa = dataPrevisaoProximaEtapa;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
