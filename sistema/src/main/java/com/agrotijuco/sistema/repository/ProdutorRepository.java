package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Produtor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProdutorRepository extends JpaRepository<Produtor, UUID> {

    @Query(value = "SELECT * FROM tb_produtores ORDER BY nome ASC", nativeQuery = true)
    List<Produtor> findAllGlobal();

    @Query(value = "SELECT * FROM tb_produtores WHERE id = :id LIMIT 1", nativeQuery = true)
    Optional<Produtor> findByIdIgnoringTenant(@Param("id") UUID id);

    @Query(value = "SELECT * FROM tb_produtores WHERE LOWER(email) = LOWER(:email) LIMIT 1", nativeQuery = true)
    Optional<Produtor> findByEmailIgnoringTenant(@Param("email") String email);
}
