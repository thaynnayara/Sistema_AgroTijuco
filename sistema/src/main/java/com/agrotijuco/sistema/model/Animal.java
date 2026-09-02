package com.agrotijuco.sistema.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "animais")
public class Animal extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piquete_id")
    private Piquete piquete;

    @Column(length = 100)
    private String nome;

    @Column(nullable = false, length = 50)
    private String brinco;

    @Column(length = 100)
    private String rfid;

    @Column(length = 100)
    private String lote;

    @Column(nullable = false, length = 1)
    private Character sexo;

    @Column(length = 100)
    private String raca;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAnimal status;

    public Animal() {}

    public Animal(Propriedade propriedade, String nome, String brinco, String rfid, String lote, Character sexo, String raca, LocalDate dataNascimento, StatusAnimal status) {
        this.propriedade = propriedade;
        this.nome = nome;
        this.brinco = brinco;
        this.rfid = rfid;
        this.lote = lote;
        this.sexo = sexo;
        this.raca = raca;
        this.dataNascimento = dataNascimento;
        this.status = status;
    }

    public Propriedade getPropriedade() {
        return propriedade;
    }

    public void setPropriedade(Propriedade propriedade) {
        this.propriedade = propriedade;
    }

    public Piquete getPiquete() {
        return piquete;
    }

    public void setPiquete(Piquete piquete) {
        this.piquete = piquete;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getBrinco() {
        return brinco;
    }

    public void setBrinco(String brinco) {
        this.brinco = brinco;
    }

    public String getRfid() {
        return rfid;
    }

    public void setRfid(String rfid) {
        this.rfid = rfid;
    }

    public String getLote() {
        return lote;
    }

    public void setLote(String lote) {
        this.lote = lote;
    }

    public Character getSexo() {
        return sexo;
    }

    public void setSexo(Character sexo) {
        this.sexo = sexo;
    }

    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public StatusAnimal getStatus() {
        return status;
    }

    public void setStatus(StatusAnimal status) {
        this.status = status;
    }
}
