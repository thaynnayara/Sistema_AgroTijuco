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

    @Transactional(readOnly = true)
    public List<AnimalResponseDTO> listarTodos() {
        return animalRepository.findAllWithRelations().stream().map(this::mapParaResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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
     * Atualização dos dados do animal
     */
     @Transactional
     public AnimalResponseDTO atualizar(UUID id, AnimalRequestDTO dto) {
         Animal animal = animalRepository.findByIdWithRelations(id)
                 .orElseThrow(() -> new RuntimeException("Animal não encontrado com ID: " + id));

         if (dto.brinco() == null || dto.brinco().trim().isEmpty()) {
             throw new IllegalArgumentException("O número do brinco é obrigatório.");
         }

         UUID propId = null;
         try {
             if (animal.getPropriedade() != null) {
                 propId = animal.getPropriedade().getId();
             }
         } catch (Exception ignored) {}

         if (propId != null) {
             boolean brincoJaExiste = animalRepository.existsByBrincoAndPropriedadeIdAndIdNot(dto.brinco().trim(), propId, id);
             if (brincoJaExiste) {
                 throw new IllegalArgumentException("O brinco " + dto.brinco() + " já está em uso por outro animal nesta propriedade.");
             }
         }

         // RN02 - Bloqueio por Carência Sanitária se for alterado para VENDIDO ou ABATIDO
         if (dto.status() != null && dto.status() != animal.getStatus() &&
                 (dto.status() == StatusAnimal.VENDIDO || dto.status() == StatusAnimal.ABATIDO)) {
             validarCarenciaSanitaria(animal);
         }

         animal.setBrinco(dto.brinco().trim());
         animal.setRfid(dto.rfid());
         animal.setLote(dto.lote());
         animal.setNome(dto.nome());
         if (dto.sexo() != null) animal.setSexo(dto.sexo());
         if (dto.raca() != null) animal.setRaca(dto.raca());
         if (dto.dataNascimento() != null) animal.setDataNascimento(dto.dataNascimento());
         if (dto.status() != null) animal.setStatus(dto.status());

         if (dto.piqueteId() != null) {
             Piquete piquete = piqueteRepository.findById(dto.piqueteId()).orElse(null);
             animal.setPiquete(piquete);
         } else {
             animal.setPiquete(null);
         }

         Animal salvo = animalRepository.save(animal);
         return mapParaResponseDTO(salvo);
     }

    /**
     * Exclusão de animal
     */
    @Transactional
    public void excluir(UUID id) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado com ID: " + id));
        animalRepository.delete(animal);
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
            validarCarenciaSanitaria(animal);
        }

        animal.setStatus(novoStatus);
        Animal atualizado = animalRepository.save(animal);
        return mapParaResponseDTO(atualizado);
    }

    private void validarCarenciaSanitaria(Animal animal) {
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

    @Transactional(readOnly = true)
    public AnimalResponseDTO buscarPorId(UUID id) {
        Animal animal = animalRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado."));
        return mapParaResponseDTO(animal);
    }

    public AnimalResponseDTO mapParaResponseDTO(Animal animal) {
        List<RegistroSanitario> carencias = registroSanitarioRepository.findEmCarencia(animal.getId(), LocalDate.now());
        boolean emCarencia = !carencias.isEmpty();
        LocalDate dataFim = emCarencia ? carencias.get(0).getDataFimCarencia() : null;

        UUID propId = null;
        String nomeFazenda = null;
        try {
            if (animal.getPropriedade() != null) {
                propId = animal.getPropriedade().getId();
                nomeFazenda = animal.getPropriedade().getNomeFazenda();
            }
        } catch (Exception ignored) {}

        UUID piqueteId = null;
        String nomePiquete = null;
        try {
            if (animal.getPiquete() != null) {
                piqueteId = animal.getPiquete().getId();
                nomePiquete = animal.getPiquete().getNomePiquete();
            }
        } catch (Exception ignored) {}

        return new AnimalResponseDTO(
                animal.getId(),
                animal.getBrinco(),
                animal.getRfid(),
                animal.getLote(),
                piqueteId,
                nomePiquete,
                animal.getNome(),
                animal.getSexo(),
                animal.getRaca(),
                animal.getDataNascimento(),
                animal.getStatus(),
                emCarencia,
                dataFim,
                propId,
                nomeFazenda
        );
    }
}
