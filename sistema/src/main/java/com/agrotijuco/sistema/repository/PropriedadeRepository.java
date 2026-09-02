package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Propriedade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropriedadeRepository extends JpaRepository<Propriedade, UUID> {
    List<Propriedade> findByProdutorId(UUID produtorId);
}
