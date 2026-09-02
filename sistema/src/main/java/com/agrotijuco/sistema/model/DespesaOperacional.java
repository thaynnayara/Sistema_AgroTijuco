package com.agrotijuco.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_despesas")
public class DespesaOperacional extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    @Column(nullable = false, length = 200)
    private String descricao;

    @Column(nullable = false, length = 50)
    private String categoria; // RACAO, MEDICAMENTOS, MAO_DE_OBRA, MANUTENCAO, COMBUSTIVEL, OUTROS

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_despesa", nullable = false)
    private LocalDate dataDespesa;

    @Column(name = "tipo_producao", length = 50)
    private String tipoProducao; // CORTE_ARROBA, LEITE_LITRO

    @Column(name = "total_produzido_periodo", precision = 12, scale = 2)
    private BigDecimal totalProduzidoPeriodo;

    public DespesaOperacional() {}

    public DespesaOperacional(Propriedade propriedade, String descricao, String categoria, BigDecimal valor, LocalDate dataDespesa, String tipoProducao, BigDecimal totalProduzidoPeriodo) {
        this.propriedade = propriedade;
        this.descricao = descricao;
        this.categoria = categoria;
        this.valor = valor;
        this.dataDespesa = dataDespesa;
        this.tipoProducao = tipoProducao;
        this.totalProduzidoPeriodo = totalProduzidoPeriodo;
    }

    public Propriedade getPropriedade() {
        return propriedade;
    }

    public void setPropriedade(Propriedade propriedade) {
        this.propriedade = propriedade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataDespesa() {
        return dataDespesa;
    }

    public void setDataDespesa(LocalDate dataDespesa) {
        this.dataDespesa = dataDespesa;
    }

    public String getTipoProducao() {
        return tipoProducao;
    }

    public void setTipoProducao(String tipoProducao) {
        this.tipoProducao = tipoProducao;
    }

    public BigDecimal getTotalProduzidoPeriodo() {
        return totalProduzidoPeriodo;
    }

    public void setTotalProduzidoPeriodo(BigDecimal totalProduzidoPeriodo) {
        this.totalProduzidoPeriodo = totalProduzidoPeriodo;
    }
}
