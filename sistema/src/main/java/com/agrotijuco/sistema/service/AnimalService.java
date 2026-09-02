package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.dto.AnimalRequestDTO;
import com.agrotijuco.sistema.dto.AnimalResponseDTO;
import com.agrotijuco.sistema.model.Animal;
import com.agrotijuco.sistema.model.Piquete;
import com.agrotijuco.sistema.model.Propriedade;
import com.agrotijuco.sistema.model.RegistroSanitario;
import com.agrotijuco.sistema.model.StatusAnimal;
import com.agrotijuco.sistema.repository.AnimalRepository;
import com.agrotijuco.sistema.repository.PiqueteRepository;
import com.agrotijuco.sistema.repository.PropriedadeRepository;
import com.agrotijuco.sistema.repository.RegistroSanitarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnimalService {

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private PropriedadeRepository propriedadeRepository;

    @Autowired
    private PiqueteRepository piqueteRepository;

    @Autowired
    private RegistroSanitarioRepository registroSanitarioRepository;

    public List<AnimalResponseDTO> listarTodos() {
        return animalRepository.findAll().stream().map(this::mapParaResponseDTO).collect(Collectors.toList());
    }

    public List<AnimalResponseDTO> listarPorPropriedade(UUID propriedadeId) {
        return animalRepository.findByPropriedadeId(propriedadeId).stream().map(this::mapParaResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public AnimalResponseDTO cadastrar(AnimalRequestDTO dto, UUID propriedadeId) {
        Propriedade propriedade = propriedadeRepository.findById(propriedadeId)
                .orElseThrow(() -> new RuntimeException("Propriedade não encontrada com o ID: " + propriedadeId));

        if (dto.brinco() == null || dto.brinco().trim().isEmpty()) {
            throw new IllegalArgumentException("O número do brinco é obrigatório para cadastrar o animal.");
        }

        boolean brincoJaExiste = animalRepository.existsByBrincoAndPropriedadeId(dto.brinco(), propriedadeId);
        if (brincoJaExiste) {
            throw new IllegalArgumentException(
                    "O brinco " + dto.brinco() + " já está cadastrado na propriedade " + propriedade.getNomeFazenda()
            );
        }

        Animal animal = new Animal();
        animal.setPropriedade(propriedade);
        animal.setBrinco(dto.brinco());
        animal.setRfid(dto.rfid());
        animal.setLote(dto.lote());
        animal.setNome(dto.nome());
        animal.setSexo(dto.sexo() != null ? dto.sexo() : 'M');
        animal.setRaca(dto.raca());
        animal.setDataNascimento(dto.dataNascimento());
        animal.setStatus(dto.status() != null ? dto.status() : StatusAnimal.ATIVO);

        if (dto.piqueteId() != null) {
            Piquete piquete = piqueteRepository.findById(dto.piqueteId()).orElse(null);
            animal.setPiquete(piquete);
        }

        Animal salvo = animalRepository.save(animal);
        return mapParaResponseDTO(salvo);
    }

    /**
     * RF01 - Cadastro em Lote de Animais
     */
    @Transactional
    public List<AnimalResponseDTO> cadastrarEmLote(List<AnimalRequestDTO> dtoList, UUID propriedadeId) {
        List<AnimalResponseDTO> criados = new ArrayList<>();
        for (AnimalRequestDTO dto : dtoList) {
            criados.add(cadastrar(dto, propriedadeId));
        }
        return criados;
    }

    /**
     * Atualização de Status com verificação da Regra de Negócio RN02 (Bloqueio por Carência Sanitária)
     */
    @Transactional
    public AnimalResponseDTO atualizarStatus(UUID id, StatusAnimal novoStatus) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado."));

        // RN02 - Bloqueio por Carência Sanitária
        if (novoStatus == StatusAnimal.VENDIDO || novoStatus == StatusAnimal.ABATIDO) {
            List<RegistroSanitario> registrosEmCarencia = registroSanitarioRepository.findEmCarencia(animal.getId(), LocalDate.now());
            if (!registrosEmCarencia.isEmpty()) {
                RegistroSanitario r = registrosEmCarencia.get(0);
                throw new IllegalStateException(
                        "BLOQUEIO POR CARÊNCIA SANITÁRIA (RN02): O animal brinco [" + animal.getBrinco() + 
                        "] está sob efeito do medicamento/vacina '" + r.getMedicamentoVacina() + 
                        "' com carência ativa até " + r.getDataFimCarencia() + ". Operação de Venda/Abate cancelada."
                );
            }
        }

        animal.setStatus(novoStatus);
        Animal atualizado = animalRepository.save(animal);
        return mapParaResponseDTO(atualizado);
    }

    public AnimalResponseDTO buscarPorId(UUID id) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado."));
        return mapParaResponseDTO(animal);
    }

    public AnimalResponseDTO mapParaResponseDTO(Animal animal) {
        List<RegistroSanitario> carencias = registroSanitarioRepository.findEmCarencia(animal.getId(), LocalDate.now());
        boolean emCarencia = !carencias.isEmpty();
        LocalDate dataFim = emCarencia ? carencias.get(0).getDataFimCarencia() : null;

        return new AnimalResponseDTO(
                animal.getId(),
                animal.getBrinco(),
                animal.getRfid(),
                animal.getLote(),
                animal.getPiquete() != null ? animal.getPiquete().getId() : null,
                animal.getPiquete() != null ? animal.getPiquete().getNomePiquete() : null,
                animal.getNome(),
                animal.getSexo(),
                animal.getRaca(),
                animal.getDataNascimento(),
                animal.getStatus(),
                emCarencia,
                dataFim,
                animal.getPropriedade() != null ? animal.getPropriedade().getNomeFazenda() : null
        );
    }
}
