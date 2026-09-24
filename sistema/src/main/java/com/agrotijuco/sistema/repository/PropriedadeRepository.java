package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Propriedade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropriedadeRepository extends JpaRepository<Propriedade, UUID> {

    @Query("SELECT DISTINCT p FROM Propriedade p LEFT JOIN p.produtores prod WHERE p.produtor.id = :produtorId OR prod.id = :produtorId")
    List<Propriedade> findByProdutorId(@Param("produtorId") UUID produtorId);

    @Query(value = "SELECT * FROM tb_propriedades ORDER BY nome_fazenda ASC", nativeQuery = true)
    List<Propriedade> findAllGlobal();

    @Query(value = "SELECT DISTINCT p.* FROM tb_propriedades p " +
            "LEFT JOIN tb_propriedade_produtores pp ON p.id = pp.propriedade_id " +
            "WHERE p.produtor_id = :produtorId OR pp.produtor_id = :produtorId " +
            "ORDER BY p.nome_fazenda ASC", nativeQuery = true)
    List<Propriedade> findByProdutorIdGlobal(@Param("produtorId") UUID produtorId);

    @Query(value = "SELECT * FROM tb_propriedades WHERE id = :id LIMIT 1", nativeQuery = true)
    Optional<Propriedade> findByIdIgnoringTenant(@Param("id") UUID id);
}
