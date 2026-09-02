package com.agrotijuco.sistema.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tb_registros_sanitarios")
public class RegistroSanitario extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    @Column(length = 100)
    private String lote;

    @Column(name = "medicamento_vacina", nullable = false, length = 150)
    private String medicamentoVacina;

    @Column(nullable = false, length = 50)
    private String tipo; // VACINA, VERMIFUGO, ANTIBIOTICO, OUTRO

    @Column(length = 50)
    private String dose;

    @Column(name = "data_aplicacao", nullable = false)
    private LocalDate dataAplicacao;

    @Column(name = "dias_carencia", nullable = false)
    private Integer diasCarencia;

    @Column(name = "data_fim_carencia", nullable = false)
    private LocalDate dataFimCarencia;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public RegistroSanitario() {}

    public RegistroSanitario(Animal animal, String lote, String medicamentoVacina, String tipo, String dose, LocalDate dataAplicacao, Integer diasCarencia, LocalDate dataFimCarencia, String observacao) {
        this.animal = animal;
        this.lote = lote;
        this.medicamentoVacina = medicamentoVacina;
        this.tipo = tipo;
        this.dose = dose;
        this.dataAplicacao = dataAplicacao;
        this.diasCarencia = diasCarencia;
        this.dataFimCarencia = dataFimCarencia;
        this.observacao = observacao;
    }

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    public String getLote() {
        return lote;
    }

    public void setLote(String lote) {
        this.lote = lote;
    }

    public String getMedicamentoVacina() {
        return medicamentoVacina;
    }

    public void setMedicamentoVacina(String medicamentoVacina) {
        this.medicamentoVacina = medicamentoVacina;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDose() {
        return dose;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public LocalDate getDataAplicacao() {
        return dataAplicacao;
    }

    public void setDataAplicacao(LocalDate dataAplicacao) {
        this.dataAplicacao = dataAplicacao;
    }

    public Integer getDiasCarencia() {
        return diasCarencia;
    }

    public void setDiasCarencia(Integer diasCarencia) {
        this.diasCarencia = diasCarencia;
    }

    public LocalDate getDataFimCarencia() {
        return dataFimCarencia;
    }

    public void setDataFimCarencia(LocalDate dataFimCarencia) {
        this.dataFimCarencia = dataFimCarencia;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
