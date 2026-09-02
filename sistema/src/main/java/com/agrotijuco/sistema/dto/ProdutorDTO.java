package com.agrotijuco.sistema.dto;

import java.util.UUID;

public record ProdutorDTO(
        UUID id,
        String nome,
        String cpfOuCnpj,
        String email,
        String telefone
) {}