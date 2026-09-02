package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.RegistroSanitario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RegistroSanitarioRepository extends JpaRepository<RegistroSanitario, UUID> {
    List<RegistroSanitario> findByAnimalIdOrderByDataAplicacaoDesc(UUID animalId);
    
    @Query("SELECT r FROM RegistroSanitario r WHERE r.animal.id = :animalId AND r.dataFimCarencia > :dataAtual")
    List<RegistroSanitario> findEmCarencia(UUID animalId, LocalDate dataAtual);
    
    @Query("SELECT r FROM RegistroSanitario r WHERE r.dataFimCarencia >= :dataAtual ORDER BY r.dataFimCarencia ASC")
    List<RegistroSanitario> findAllEmCarencia(LocalDate dataAtual);
}
