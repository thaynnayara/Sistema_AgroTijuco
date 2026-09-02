package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.EventoReprodutivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventoReprodutivoRepository extends JpaRepository<EventoReprodutivo, UUID> {
    List<EventoReprodutivo> findByAnimalIdOrderByDataEventoDesc(UUID animalId);
    
    @Query("SELECT e FROM EventoReprodutivo e WHERE e.dataPrevisaoProximaEtapa >= :dataInicio AND e.dataPrevisaoProximaEtapa <= :dataFim ORDER BY e.dataPrevisaoProximaEtapa ASC")
    List<EventoReprodutivo> findAlertasPrevisao(LocalDate dataInicio, LocalDate dataFim);
}
