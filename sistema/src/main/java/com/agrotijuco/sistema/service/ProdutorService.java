package com.agrotijuco.sistema.service;

import com.agrotijuco.sistema.model.Produtor;
import com.agrotijuco.sistema.repository.ProdutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProdutorService {

    @Autowired
    private ProdutorRepository repository;

    public List<Produtor> listarTodos() {
        return repository.findAll();
    }

    @Transactional
    public Produtor cadastrar(Produtor produtor) {

        //Regra básica: Garantir que CPF/CNPJ e Nome sejam informados
        if (produtor.getCpfOuCnpj() == null || produtor.getCpfOuCnpj().trim().isEmpty()) {
            throw new IllegalArgumentException("CPF ou CNPJ é obrigatório.");
        }

        //O Spring Data JPA + anotação @Column(unique=true) na entidade
        //já vai bloquear no banco se alguém tentar salvar um CPF duplicado.

        return repository.save(produtor);
    }

    public Produtor buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produtor não encontrado com o ID: " + id));
    }
}