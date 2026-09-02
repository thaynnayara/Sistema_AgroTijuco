package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Animal;
import com.agrotijuco.sistema.model.StatusAnimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, UUID> {

    List<Animal> findByPropriedadeId(UUID propriedadeId);

    List<Animal> findByPropriedadeIdIn(List<UUID> propriedadeIds);

    Page<Animal> findByPropriedadeId(UUID propriedadeId, Pageable pageable);

    Page<Animal> findByPropriedadeIdAndStatus(UUID propriedadeId, StatusAnimal status, Pageable pageable);

    Optional<Animal> findByPropriedadeIdAndBrinco(UUID propriedadeId, String brinco);

    boolean existsByBrincoAndPropriedadeId(String brinco, UUID propriedadeId);

    long countByPropriedadeId(UUID propriedadeId);

    long countByPropriedadeIdAndStatus(UUID propriedadeId, StatusAnimal status);

    @Query("SELECT COUNT(a) FROM Animal a WHERE a.status IN ('VENDIDO', 'ABATIDO')")
    long countDesfruteComercializados();

    @Query("SELECT COUNT(a) FROM Animal a")
    long countTotalRebanho();
}
