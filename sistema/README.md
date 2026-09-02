# 🚜 AgroTijuco — Backend API REST (Spring Boot 3)

API RESTful Multi-Tenant de Alta Performance construída com **Java 21/24**, **Spring Boot 3**, **Spring Security 6**, **Hibernate 6**, **Flyway** e **PostgreSQL 16**.

---

## 🏛️ Arquitetura e Recursos Comercial B2B

- **Isolamento Multi-Tenant**: Modelo de tabela compartilhada com a anotação nativa `@TenantId` do Hibernate 6 e políticas de **PostgreSQL Row Level Security (RLS)** habilitadas.
- **Autenticação Stateless**: JWT (JSON Web Tokens) assinados com algoritmo HMAC (HS512) via filtro customizado `JwtAuthenticationFilter`.
- **Pool de Conexões de Alta Performance**: Configurado via **HikariCP** com detecção de vazamentos em tempo de execução.
- **Auditoria Automatizada**: `created_at`, `updated_at`, `created_by` e `updated_by` gerenciados via Spring Data JPA Auditing.
- **Diagnóstico e Observabilidade**: Registros estruturados via Logback com suporte a MDC (`traceId`, `tenantId`, `userId`) e métricas via Spring Boot Actuator / Prometheus (`/actuator/health`, `/actuator/prometheus`).

---

## 🚀 Como Executar o Backend Localmente

### Pré-requisitos
- **Java JDK 21+** instalado.
- **PostgreSQL 16** em execução na porta `5432` (ou via Docker).

### Passo 1: Configurar Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### Passo 2: Inicializar o Banco de Dados (Docker Compose)
Para rodar a instância isolada do PostgreSQL com o banco `agrotijuco_prod`:
```bash
docker-compose up -d postgres
```

### Passo 3: Executar a Aplicação Spring Boot
Execute via Maven Wrapper:
```bash
./mvnw spring-boot:run
```

A aplicação iniciará na porta `8080`.

---

## 🧪 Testes e Compilação

Para compilar e validar o código:
```bash
./mvnw clean compile
```

Para executar a suíte de testes automatizados:
```bash
./mvnw test
```

---

## 📑 Endpoints Principais

| Método | Endpoint | Descrição | Requer Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica um usuário e retorna o Token JWT. | ❌ Não |
| `POST` | `/auth/register` | Cadastra um novo usuário no tenant. | ❌ Não |
| `GET` / `POST` | `/produtores` | Listar e cadastrar produtores rurais. | ✅ Sim |
| `GET` / `POST` | `/propriedades/produtor/{id}` | Gerenciar fazendas por produtor. | ✅ Sim |
| `GET` / `POST` | `/animais/propriedade/{id}` | Gerenciar rebanho da propriedade. | ✅ Sim |
| `GET` / `POST` | `/pesagens/animal/{id}` | Registrar e consultar pesagens por animal. | ✅ Sim |
| `GET` | `/actuator/health` | Status de saúde da API e banco de dados. | ❌ Não |

---

## 📘 Documentação Arquitetural
Consulte o guia completo em [ARCHITECTURE_AND_DEVOPS_GUIDE.md](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/ARCHITECTURE_AND_DEVOPS_GUIDE.md) para detalhes de Disaster Recovery, backup S3, RLS no PostgreSQL e estratégias de deploy.
