package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.ItemEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemEstoqueRepository extends JpaRepository<ItemEstoque, UUID> {
    List<ItemEstoque> findByPropriedadeId(UUID propriedadeId);

    @Query("SELECT e FROM ItemEstoque e WHERE e.propriedade.id = :propriedadeId AND e.quantidadeAtual <= e.quantidadeMinima")
    List<ItemEstoque> findItensEstoqueBaixo(UUID propriedadeId);
}
