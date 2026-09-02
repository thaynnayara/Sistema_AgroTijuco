package com.agrotijuco.sistema.dto;

import com.agrotijuco.sistema.model.StatusAnimal;
import java.time.LocalDate;
import java.util.UUID;

public record AnimalResponseDTO(
        UUID id,
        String brinco,
        String rfid,
        String lote,
        UUID piqueteId,
        String nomePiquete,
        String nome,
        Character sexo,
        String raca,
        LocalDate dataNascimento,
        StatusAnimal status,
        boolean emCarenciaSanitaria,
        LocalDate dataFimCarencia,
        String nomeFazenda
) {}