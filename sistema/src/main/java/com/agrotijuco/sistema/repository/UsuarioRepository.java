package com.agrotijuco.sistema.repository;

import com.agrotijuco.sistema.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(value = "SELECT * FROM tb_usuarios WHERE LOWER(email) = LOWER(:email) LIMIT 1", nativeQuery = true)
    Optional<Usuario> findByEmailIgnoringTenant(@Param("email") String email);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END FROM tb_usuarios WHERE LOWER(email) = LOWER(:email)", nativeQuery = true)
    boolean existsByEmailIgnoringTenant(@Param("email") String email);

    @Query(value = "SELECT * FROM tb_usuarios ORDER BY created_at DESC NULLS LAST, nome ASC", nativeQuery = true)
    java.util.List<Usuario> findAllUsersGlobal();

    @Query(value = "SELECT * FROM tb_usuarios WHERE id = :id LIMIT 1", nativeQuery = true)
    Optional<Usuario> findByIdIgnoringTenant(@Param("id") UUID id);
}
