package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.DietaTrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DietaTratoRepository extends JpaRepository<DietaTrato, UUID> {
    List<DietaTrato> findByPropriedadeIdOrderByDataTratoDesc(UUID propriedadeId);
}
