package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.Animal;
import com.agrotijuco.sistema.model.RegistroSanitario;
import com.agrotijuco.sistema.repository.AnimalRepository;
import com.agrotijuco.sistema.repository.RegistroSanitarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class SanitarioService {

    @Autowired
    private RegistroSanitarioRepository repository;

    @Autowired
    private AnimalRepository animalRepository;

    public List<RegistroSanitario> listarPorAnimal(UUID animalId) {
        return repository.findByAnimalIdOrderByDataAplicacaoDesc(animalId);
    }

    public List<RegistroSanitario> listarCarenciasAtivas() {
        return repository.findAllEmCarencia(LocalDate.now());
    }

    @Transactional
    public RegistroSanitario registrar(UUID animalId, String lote, String medicamento, String tipo, String dose, LocalDate dataAplicacao, Integer diasCarencia, String observacao) {
        Animal animal = animalId != null ? animalRepository.findById(animalId).orElse(null) : null;
        LocalDate dataApp = dataAplicacao != null ? dataAplicacao : LocalDate.now();
        int carencia = diasCarencia != null ? diasCarencia : 0;
        LocalDate dataFim = dataApp.plusDays(carencia);

        RegistroSanitario reg = new RegistroSanitario(animal, lote, medicamento, tipo.toUpperCase(), dose, dataApp, carencia, dataFim, observacao);
        return repository.save(reg);
    }
}
