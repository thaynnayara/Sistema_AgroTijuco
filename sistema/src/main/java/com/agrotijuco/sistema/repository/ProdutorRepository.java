package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Produtor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

// O segundo parâmetro do JpaRepository deve ser UUID
public interface ProdutorRepository extends JpaRepository<Produtor, UUID> {

}
