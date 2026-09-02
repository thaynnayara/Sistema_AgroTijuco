package com.agrotijuco.sistema.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PesagemRequestDTO(
        LocalDate dataPesagem,
        BigDecimal pesoKg,
        String observacao
) {}