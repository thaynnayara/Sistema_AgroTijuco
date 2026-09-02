# 🗺️ Guia Completo de Modificação e Manutenção do AgroTijuco

Este guia orienta a localização e alteração de todos os **Requisitos Funcionais (RF)**, **Regras de Negócio (RN)** e **Requisitos Não Funcionais (RNF)** do sistema **AgroTijuco**.

---

## 🎯 Mapeamento de Requisitos Implementados

| Código | Descrição do Requisito | Camada Backend (Java/SQL) | Camada Frontend (React/TS) |
| :--- | :--- | :--- | :--- |
| **RF01** | **Cadastro & Identificação (Brincos + RFID + Lote)** | [Animal.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/Animal.java)<br>[AnimalService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/AnimalService.java)<br>[AnimalController.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/controller/AnimalController.java) | [Animais.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Animais.tsx)<br>[animalService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/animalService.ts) |
| **RF02** | **Gestão Reprodutiva (IATF, Toque, Parto, Previsões)** | [EventoReprodutivo.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/EventoReprodutivo.java)<br>[ReprodutivoService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/ReprodutivoService.java)<br>[ReprodutivoController.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/controller/ReprodutivoController.java) | [Reprodutivo.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Reprodutivo.tsx)<br>[reprodutivoService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/reprodutivoService.ts) |
| **RF03** | **Calendário Sanitário (Vacinas & Vermífugos)** | [RegistroSanitario.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/RegistroSanitario.java)<br>[SanitarioService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/SanitarioService.java) | [Sanidade.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Sanidade.tsx)<br>[sanitarioService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/sanitarioService.ts) |
| **RF04** | **Histórico de Pesagem** | [Pesagem.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/Pesagem.java)<br>[PesagemService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/PesagemService.java) | [Pesagens.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Pesagens.tsx)<br>[pesagemService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/pesagemService.ts) |
| **RF05** | **Gestão de Pastagens & Piquetes** | [Piquete.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/Piquete.java)<br>[PastagemService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/PastagemService.java) | [Pastagens.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Pastagens.tsx)<br>[pastagemService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/pastagemService.ts) |
| **RF06** | **Controle Nutricional & Trato** | [DietaTrato.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/DietaTrato.java)<br>[NutricaoService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/NutricaoService.java) | [Nutricao.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Nutricao.tsx)<br>[nutricaoService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/nutricaoService.ts) |
| **RF07** | **Apuração de Custos por @ e Litro** | [DespesaOperacional.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/DespesaOperacional.java)<br>[FinanceiroService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/FinanceiroService.java) | [Financeiro.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Financeiro.tsx)<br>[financeiroService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/financeiroService.ts) |
| **RF08** | **Gestão de Estoque & Alerta Mínimo** | [ItemEstoque.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/ItemEstoque.java)<br>[EstoqueService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/EstoqueService.java) | [Estoque.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Estoque.tsx)<br>[estoqueService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/estoqueService.ts) |
| **RN01** | **Cálculo do GMD (Ganho Médio Diário)** | [PesagemService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/PesagemService.java) (`mapParaResponseDTO`) | [Pesagens.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Pesagens.tsx) |
| **RN02** | **Bloqueio por Carência Sanitária** | [AnimalService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/AnimalService.java) (`atualizarStatus`) | [Animais.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Animais.tsx)<br>[Sanidade.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Sanidade.tsx) |
| **RN03** | **Taxa de Desfrute Rebanho** | [FinanceiroService.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/service/FinanceiroService.java) | [Financeiro.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Financeiro.tsx)<br>[Dashboard.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Dashboard.tsx) |
| **RNF01**<br>**RNF02** | **Offline-First & Sincronização Assíncrona** | Controle HTTP REST Standard | [offlineSyncService.ts](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/services/offlineSyncService.ts)<br>[DashboardLayout.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/layouts/DashboardLayout.tsx) |
| **RNF04** | **Interface Responsiva & Design System** | Tailwind CSS `tailwind.config.js` | [DashboardLayout.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/layouts/DashboardLayout.tsx) |

---

## 🟢 1. Modificações no Backend (`sistema/`)

### Migrações de Banco de Dados (Flyway SQL):
- [V1__init_schema_and_rls.sql](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/resources/db/migration/V1__init_schema_and_rls.sql) (Schema inicial e RLS)
- [V2__add_produtor_id_to_usuario.sql](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/resources/db/migration/V2__add_produtor_id_to_usuario.sql)
- [V3__modulo_zootecnico_operacoes_financeiro.sql](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/resources/db/migration/V3__modulo_zootecnico_operacoes_financeiro.sql) (Novas tabelas de Piquetes, Eventos Reprodutivos, Sanidade, Dietas, Despesas e Estoque)

### Entidades Java JPA (`model/`):
- `Animal.java` (Brinco, RFID, Lote, Piquete)
- `StatusAnimal.java` (ATIVO, VENDIDO, ABATIDO, MORTO, EM_TRATAMENTO)
- `Piquete.java`
- `EventoReprodutivo.java`
- `RegistroSanitario.java`
- `DietaTrato.java`
- `DespesaOperacional.java`
- `ItemEstoque.java`

### Controladores REST (`controller/`):
- `AnimalController.java` (`POST /animais/propriedade/{id}/lote`, `PATCH /animais/{id}/status`)
- `PesagemController.java` (`GET`, `POST /pesagens/animal/{id}`)
- `ReprodutivoController.java` (`GET`, `POST /reproducao/...`)
- `SanitarioController.java` (`GET`, `POST /sanidade/...`)
- `PastagemController.java` (`GET`, `POST /pastagens/...`)
- `NutricaoController.java` (`GET`, `POST /nutricao/...`)
- `FinanceiroController.java` (`GET`, `POST /financeiro/...`)
- `EstoqueController.java` (`GET`, `POST /estoque/...`)

---

## 🔵 2. Modificações no Frontend (`FrontEnd_AgroTijuco/`)

### Módulo Offline-First & Background Sync (RNF01 / RNF02):
- `src/services/offlineSyncService.ts`
- Injetado no `DashboardLayout.tsx` com alerta visual no cabeçalho e botão de sincronização.

### Novas Telas & Módulos (`src/pages/`):
- [Dashboard.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Dashboard.tsx) (Resumo dos módulos e Taxa de Desfrute RN03)
- [Animais.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Animais.tsx) (RF01 Brinco/RFID/Lote + Trava RN02)
- [Pesagens.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Pesagens.tsx) (RF04 & RN01 Cálculo GMD)
- [Reprodutivo.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Reprodutivo.tsx) (RF02 Gestão Reprodutiva)
- [Sanidade.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Sanidade.tsx) (RF03 & RN02 Calendário Sanitário)
- [Pastagens.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Pastagens.tsx) (RF05 Manejo de Pastagens)
- [Nutricao.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Nutricao.tsx) (RF06 Controle Nutricional)
- [Estoque.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Estoque.tsx) (RF08 Gestão de Estoque)
- [Financeiro.tsx](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/src/pages/Financeiro.tsx) (RF07 & RN03 Financeiro e Desfrute)
