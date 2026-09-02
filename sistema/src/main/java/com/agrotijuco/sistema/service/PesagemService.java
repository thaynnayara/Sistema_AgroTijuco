package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.dto.PesagemRequestDTO;
import com.agrotijuco.sistema.dto.PesagemResponseDTO;
import com.agrotijuco.sistema.model.Animal;
import com.agrotijuco.sistema.model.Pesagem;
import com.agrotijuco.sistema.repository.AnimalRepository;
import com.agrotijuco.sistema.repository.PesagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PesagemService {

    private final PesagemRepository pesagemRepository;
    private final AnimalRepository animalRepository;

    public PesagemService(PesagemRepository pesagemRepository, AnimalRepository animalRepository) {
        this.pesagemRepository = pesagemRepository;
        this.animalRepository = animalRepository;
    }

    public List<PesagemResponseDTO> listarTodas() {
        List<Pesagem> pesagens = pesagemRepository.findAll();
        return pesagens.stream().map(this::mapParaResponseDTO).collect(Collectors.toList());
    }

    public List<PesagemResponseDTO> listarPorAnimal(UUID animalId) {
        List<Pesagem> pesagens = pesagemRepository.findByAnimalIdOrderByDataPesagemDesc(animalId);
        return pesagens.stream().map(this::mapParaResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public PesagemResponseDTO registrarPesagem(PesagemRequestDTO dto, UUID animalId) {

        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado para o ID fornecido."));

        if (dto.dataPesagem() != null && dto.dataPesagem().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data da pesagem não pode ser uma data futura.");
        }

        if (dto.pesoKg() == null || dto.pesoKg().signum() <= 0) {
            throw new IllegalArgumentException("O peso registrado deve ser maior que zero.");
        }

        Pesagem pesagem = new Pesagem();
        pesagem.setAnimal(animal);
        pesagem.setDataPesagem(dto.dataPesagem() != null ? dto.dataPesagem() : LocalDate.now());
        pesagem.setPesoKg(dto.pesoKg());
        pesagem.setObservacao(dto.observacao());

        Pesagem salva = pesagemRepository.save(pesagem);
        return mapParaResponseDTO(salva);
    }

    /**
     * RN01 - Cálculo do GMD (Ganho Médio Diário):
     * GMD = (Peso Atual - Peso Anterior) / Dias entre as pesagens
     */
    public PesagemResponseDTO mapParaResponseDTO(Pesagem pesagem) {
        List<Pesagem> historico = pesagemRepository.findByAnimalIdOrderByDataPesagemDesc(pesagem.getAnimal().getId());

        BigDecimal gmd = null;
        Long diasEntre = null;

        // Procurar a pesagem imediatamente anterior no histórico
        int index = historico.indexOf(pesagem);
        if (index != -1 && index + 1 < historico.size()) {
            Pesagem anterior = historico.get(index + 1);
            if (anterior != null && anterior.getDataPesagem() != null && pesagem.getDataPesagem() != null) {
                diasEntre = ChronoUnit.DAYS.between(anterior.getDataPesagem(), pesagem.getDataPesagem());
                if (diasEntre > 0) {
                    BigDecimal diferencaPeso = pesagem.getPesoKg().subtract(anterior.getPesoKg());
                    gmd = diferencaPeso.divide(BigDecimal.valueOf(diasEntre), 3, RoundingMode.HALF_UP);
                }
            }
        }

        return new PesagemResponseDTO(
                pesagem.getId(),
                pesagem.getAnimal().getId(),
                pesagem.getAnimal().getBrinco(),
                pesagem.getDataPesagem(),
                pesagem.getPesoKg(),
                gmd,
                diasEntre,
                pesagem.getObservacao()
        );
    }
}