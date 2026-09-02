package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Pesagem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PesagemRepository extends JpaRepository<Pesagem, UUID> {

    List<Pesagem> findByAnimalIdOrderByDataPesagemDesc(UUID animalId);

    // Standard Pageable pagination
    Page<Pesagem> findByAnimalId(UUID animalId, Pageable pageable);

    /**
     * Keyset / Seek Pagination for high-scale tables (millions of records).
     * Bypasses heavy OFFSET CPU/IO penalties in PostgreSQL.
     */
    @Query("""
        SELECT p FROM Pesagem p 
        WHERE p.animal.id = :animalId 
          AND (p.dataPesagem < :lastDate OR (p.dataPesagem = :lastDate AND p.id < :lastId))
        ORDER BY p.dataPesagem DESC, p.id DESC
    """)
    List<Pesagem> findNextPageSeek(
        @Param("animalId") UUID animalId,
        @Param("lastDate") LocalDate lastDate,
        @Param("lastId") UUID lastId,
        Pageable pageable
    );
}
