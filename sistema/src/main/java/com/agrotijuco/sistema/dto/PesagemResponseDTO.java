package com.agrotijuco.sistema.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PesagemResponseDTO(
        UUID id,
        UUID animalId,
        String brincoAnimal,
        LocalDate dataPesagem,
        BigDecimal pesoKg,
        BigDecimal gmdKgDia,
        Long diasEntrePesagens,
        String observacao
) {}