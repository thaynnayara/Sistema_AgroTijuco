package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.DespesaOperacional;
import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.repository.AnimalRepository;
import com.agrotijuco.sistema.repository.DespesaOperacionalRepository;
import com.agrotijuco.sistema.repository.PropriedadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class FinanceiroService {

    @Autowired
    private DespesaOperacionalRepository repository;

    @Autowired
    private PropriedadeRepository propriedadeRepository;

    @Autowired
    private AnimalRepository animalRepository;

    public List<DespesaOperacional> listarPorPropriedade(UUID propriedadeId) {
        return repository.findByPropriedadeIdOrderByDataDespesaDesc(propriedadeId);
    }

    @Transactional
    public DespesaOperacional registrarDespesa(UUID propriedadeId, String descricao, String categoria, BigDecimal valor, LocalDate dataDespesa, String tipoProducao, BigDecimal totalProduzidoPeriodo) {
        Propriedade prop = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RuntimeException("Propriedade não encontrada."));

        LocalDate data = dataDespesa != null ? dataDespesa : LocalDate.now();
        DespesaOperacional d = new DespesaOperacional(prop, descricao, categoria.toUpperCase(), valor, data, tipoProducao, totalProduzidoPeriodo);
        return repository.save(d);
    }

    public record ResumoApuracaoCustosDTO(
            BigDecimal totalDespesas,
            BigDecimal custoPorArroba,
            BigDecimal custoPorLitroLeite,
            BigDecimal taxaDesfrutePercentual,
            long totalRebanho,
            long comercializadosNoAno
    ) {}

    /**
     * RF07 - Apuração de Custos & RN03 - Taxa de Desfrute
     */
    public ResumoApuracaoCustosDTO calcularApuracaoCustos(UUID propriedadeId, BigDecimal totalArrobasProduzidas, BigDecimal totalLitrosLeiteProduzidos) {
        BigDecimal totalDespesas = repository.sumValorTotalPorPropriedade(propriedadeId);
        if (totalDespesas == null) totalDespesas = BigDecimal.ZERO;

        BigDecimal custoArroba = BigDecimal.ZERO;
        if (totalArrobasProduzidas != null && totalArrobasProduzidas.compareTo(BigDecimal.ZERO) > 0) {
            custoArroba = totalDespesas.divide(totalArrobasProduzidas, 2, RoundingMode.HALF_UP);
        }

        BigDecimal custoLitro = BigDecimal.ZERO;
        if (totalLitrosLeiteProduzidos != null && totalLitrosLeiteProduzidos.compareTo(BigDecimal.ZERO) > 0) {
            custoLitro = totalDespesas.divide(totalLitrosLeiteProduzidos, 2, RoundingMode.HALF_UP);
        }

        // RN03 - Taxa de Desfrute: (Comercializados / Total Rebanho) * 100
        long totalRebanho = animalRepository.countByPropriedadeId(propriedadeId);
        long comercializados = animalRepository.countDesfruteComercializados();

        BigDecimal desfrutePercentual = BigDecimal.ZERO;
        if (totalRebanho > 0) {
            desfrutePercentual = BigDecimal.valueOf(comercializados)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalRebanho), 2, RoundingMode.HALF_UP);
        }

        return new ResumoApuracaoCustosDTO(
                totalDespesas,
                custoArroba,
                custoLitro,
                desfrutePercentual,
                totalRebanho,
                comercializados
        );
    }
}
