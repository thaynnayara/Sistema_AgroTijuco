package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.Animal;
import com.agrotijuco.sistema.model.EventoReprodutivo;
import com.agrotijuco.sistema.repository.AnimalRepository;
import com.agrotijuco.sistema.repository.EventoReprodutivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReprodutivoService {

    @Autowired
    private EventoReprodutivoRepository repository;

    @Autowired
    private AnimalRepository animalRepository;

    public List<EventoReprodutivo> listarPorAnimal(UUID animalId) {
        return repository.findByAnimalIdOrderByDataEventoDesc(animalId);
    }

    public List<EventoReprodutivo> listarAlertasPrevisao() {
        LocalDate hoje = LocalDate.now();
        LocalDate proximoMes = hoje.plusDays(45);
        return repository.findAlertasPrevisao(hoje, proximoMes);
    }

    @Transactional
    public EventoReprodutivo registrarEvento(UUID animalId, String tipo, LocalDate dataEvento, String observacao) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado."));

        LocalDate dataEv = dataEvento != null ? dataEvento : LocalDate.now();
        LocalDate dataPrevisao = null;

        if ("INSEMINACAO".equalsIgnoreCase(tipo) || "IATF".equalsIgnoreCase(tipo)) {
            dataPrevisao = dataEv.plusDays(283); // Previsão de Parto Bovino (~283 dias)
        } else if ("TOQUE".equalsIgnoreCase(tipo)) {
            dataPrevisao = dataEv.plusDays(250);
        } else if ("PARTO".equalsIgnoreCase(tipo)) {
            dataPrevisao = dataEv.plusDays(45); // Previsão do próximo ciclo reprodutivo
        } else if ("SECAGEM".equalsIgnoreCase(tipo)) {
            dataPrevisao = dataEv.plusDays(60);
        }

        EventoReprodutivo evento = new EventoReprodutivo(animal, tipo.toUpperCase(), dataEv, dataPrevisao, observacao);
        return repository.save(evento);
    }
}
