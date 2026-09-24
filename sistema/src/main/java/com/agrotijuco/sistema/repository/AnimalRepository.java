package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Animal;
import com.agrotijuco.sistema.model.StatusAnimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, UUID> {

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.propriedade LEFT JOIN FETCH a.piquete WHERE a.propriedade.id = :propriedadeId ORDER BY a.createdAt DESC")
    List<Animal> findByPropriedadeId(@Param("propriedadeId") UUID propriedadeId);

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.propriedade LEFT JOIN FETCH a.piquete ORDER BY a.createdAt DESC")
    List<Animal> findAllWithRelations();

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.propriedade LEFT JOIN FETCH a.piquete WHERE a.id = :id")
    Optional<Animal> findByIdWithRelations(@Param("id") UUID id);

    List<Animal> findByPropriedadeIdIn(List<UUID> propriedadeIds);

    Page<Animal> findByPropriedadeId(UUID propriedadeId, Pageable pageable);

    Page<Animal> findByPropriedadeIdAndStatus(UUID propriedadeId, StatusAnimal status, Pageable pageable);

    Optional<Animal> findByPropriedadeIdAndBrinco(UUID propriedadeId, String brinco);

    boolean existsByBrincoAndPropriedadeId(String brinco, UUID propriedadeId);

    @Query("SELECT COUNT(a) > 0 FROM Animal a WHERE a.brinco = :brinco AND a.propriedade.id = :propriedadeId AND a.id <> :id")
    boolean existsByBrincoAndPropriedadeIdAndIdNot(@Param("brinco") String brinco, @Param("propriedadeId") UUID propriedadeId, @Param("id") UUID id);

    long countByPropriedadeId(UUID propriedadeId);

    long countByPropriedadeIdAndStatus(UUID propriedadeId, StatusAnimal status);

    @Query("SELECT COUNT(a) FROM Animal a WHERE a.status IN ('VENDIDO', 'ABATIDO')")
    long countDesfruteComercializados();

    @Query("SELECT COUNT(a) FROM Animal a")
    long countTotalRebanho();
}
