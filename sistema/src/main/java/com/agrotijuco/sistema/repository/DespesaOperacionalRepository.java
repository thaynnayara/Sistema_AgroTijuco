package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.DespesaOperacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface DespesaOperacionalRepository extends JpaRepository<DespesaOperacional, UUID> {
    List<DespesaOperacional> findByPropriedadeIdOrderByDataDespesaDesc(UUID propriedadeId);

    @Query("SELECT SUM(d.valor) FROM DespesaOperacional d WHERE d.propriedade.id = :propriedadeId")
    BigDecimal sumValorTotalPorPropriedade(UUID propriedadeId);
}
