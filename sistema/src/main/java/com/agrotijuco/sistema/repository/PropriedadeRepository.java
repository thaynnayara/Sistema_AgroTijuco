package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Propriedade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropriedadeRepository extends JpaRepository<Propriedade, UUID> {
    List<Propriedade> findByProdutorId(UUID produtorId);

    @Query(value = "SELECT * FROM tb_propriedades ORDER BY nome_fazenda ASC", nativeQuery = true)
    List<Propriedade> findAllGlobal();

    @Query(value = "SELECT * FROM tb_propriedades WHERE produtor_id = :produtorId ORDER BY nome_fazenda ASC", nativeQuery = true)
    List<Propriedade> findByProdutorIdGlobal(@Param("produtorId") UUID produtorId);

    @Query(value = "SELECT * FROM tb_propriedades WHERE id = :id LIMIT 1", nativeQuery = true)
    Optional<Propriedade> findByIdIgnoringTenant(@Param("id") UUID id);
}
