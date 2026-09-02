package com.agrotijuco.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_itens_estoque")
public class ItemEstoque extends Auditable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propriedade_id", nullable = false)
    private Propriedade propriedade;

    @Column(name = "nome_item", nullable = false, length = 150)
    private String nomeItem;

    @Column(nullable = false, length = 50)
    private String categoria; // RACAO, MEDICAMENTO, SUPLEMENTO, FERRAMENTA, OUTROS

    @Column(name = "quantidade_atual", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantidadeAtual;

    @Column(name = "quantidade_minima", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantidadeMinima;

    @Column(name = "unidade_medida", nullable = false, length = 30)
    private String unidadeMedida; // KG, LITRO, UNIDADE, DOSE, SACO

    public ItemEstoque() {}

    public ItemEstoque(Propriedade propriedade, String nomeItem, String categoria, BigDecimal quantidadeAtual, BigDecimal quantidadeMinima, String unidadeMedida) {
        this.propriedade = propriedade;
        this.nomeItem = nomeItem;
        this.categoria = categoria;
        this.quantidadeAtual = quantidadeAtual;
        this.quantidadeMinima = quantidadeMinima;
        this.unidadeMedida = unidadeMedida;
    }

    public Propriedade getPropriedade() {
        return propriedade;
    }

    public void setPropriedade(Propriedade propriedade) {
        this.propriedade = propriedade;
    }

    public String getNomeItem() {
        return nomeItem;
    }

    public void setNomeItem(String nomeItem) {
        this.nomeItem = nomeItem;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getQuantidadeAtual() {
        return quantidadeAtual;
    }

    public void setQuantidadeAtual(BigDecimal quantidadeAtual) {
        this.quantidadeAtual = quantidadeAtual;
    }

    public BigDecimal getQuantidadeMinima() {
        return quantidadeMinima;
    }

    public void setQuantidadeMinima(BigDecimal quantidadeMinima) {
        this.quantidadeMinima = quantidadeMinima;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public boolean isEstoqueBaixo() {
        return quantidadeAtual != null && quantidadeMinima != null && quantidadeAtual.compareTo(quantidadeMinima) <= 0;
    }
}
