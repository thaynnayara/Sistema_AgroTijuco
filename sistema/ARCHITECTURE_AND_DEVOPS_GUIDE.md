# 🚜 AgroTijuco SaaS - Guia Completo de Arquitetura, Segurança e DevOps

Este documento detalha o plano de ação arquitetural, os padrões de código e a infraestrutura implementada para elevar a plataforma **AgroTijuco** ao nível comercial de produção B2B no agronegócio.

---

## 📐 Visão Geral da Arquitetura Comercial

```
[ Cliente / Frontend / App Mobile ]
                │
                ▼ (HTTPS / JWT Bearer)
[ Nginx Reverse Proxy / WAF / SSL Termination ]
                │
                ▼
[ AgroTijuco Spring Boot 3 Engine ]
 ├── 1. JwtAuthenticationFilter (Extract TenantContext & MDC)
 ├── 2. Spring Security 6 (Stateless Authorization & BCrypt)
 ├── 3. Hibernate 6 (@TenantId Discriminator Resolution)
 └── 4. Spring Data JPA Auditing (CreatedBy / ModifiedBy)
                │
                ▼ (HikariCP Connection Pool)
[ PostgreSQL 16 Database Cluster ]
 ├── Row Level Security (RLS) Ativo
 ├── Índices Compostos Multi-Tenant (tenant_id, ...)
 └── WAL Archiving + Automated S3 Backups
```

---

## 1. Multi-Tenancy (Isolamento de Dados em SaaS B2B)

### Abordagem Escolhida
Utilizamos o modelo de **Tabela Compartilhada com Coluna Discriminadora (`tenant_id`) integrada ao Hibernate 6 nativo (`@TenantId`) e reforçada pelo PostgreSQL Row Level Security (RLS)**.

### Componentes Implementados

1. **Contexto de Requisição (`TenantContext.java`)**:
   - Localização: [TenantContext.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/config/tenant/TenantContext.java)
   - Armazena o `tenant_id` da requisição atual em um `ThreadLocal` isolado.

2. **Resolver do Hibernate 6 (`HeaderTenantIdentifierResolver.java`)**:
   - Localização: [HeaderTenantIdentifierResolver.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/config/tenant/HeaderTenantIdentifierResolver.java)
   - Injeta dinamicamente o `tenant_id` ativo em todas as consultas executadas pelo Hibernate.

3. **Entidade Base Multi-tenant (`BaseEntity.java`)**:
   - Localização: [BaseEntity.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/BaseEntity.java)
   - Contém a anotação nativa `@TenantId` da Hibernate 6 que impede qualquer vazamento de dados entre clientes.

4. **Isolamento Físico no Banco de Dados (PostgreSQL RLS)**:
   - Localização: [V1__init_schema_and_rls.sql](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/resources/db/migration/V1__init_schema_and_rls.sql)
   - Define políticas nativas de `ENABLE ROW LEVEL SECURITY` em todas as tabelas do sistema.

---

## 2. Segurança e Autenticação

### Pilares de Segurança Implementados

1. **Spring Security Stateless com JWT**:
   - Localização: [SecurityConfig.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/config/security/SecurityConfig.java)
   - Sessões HTTP desativadas (`SessionCreationPolicy.STATELESS`).
   - CSRF desativado por padrão (pois a API é stateless e não armazena cookies de sessão).

2. **Filtro de Autenticação e Transmissão de Contexto (`JwtAuthenticationFilter.java`)**:
   - Localização: [JwtAuthenticationFilter.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/config/security/JwtAuthenticationFilter.java)
   - Extrai o token Bearer, valida a assinatura HMAC-SHA256/512 via `JwtTokenService`, extrai as claims de `tenant_id` e atribui o contexto de autorização e logs MDC.

3. **Criptografia de Senhas**:
   - Utilização de `BCryptPasswordEncoder` com fator de custo `12`.

---

## 3. Rotinas de Backup e Disaster Recovery

### Estratégia de Backup
- **Script de Backup Automatizado**: [backup-s3.sh](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/scripts/backup-s3.sh)
- **Compactação e Criptografia**: Gera dumps com `pg_dump` compactados (`gzip -9`) e envia via AWS CLI para bucket S3 seguro usando criptografia KMS (`--sse aws:kms`).
- **Alvo RTO / RPO**:
  - **RPO (Recovery Point Objective)**: $\le 5$ minutos via WAL Archiving.
  - **RTO (Recovery Time Objective)**: $\le 1$ hora em restaurações completas.

---

## 4. Otimização de Performance e Banco de Dados

### HikariCP Connection Pool
Configurado no [application.yml](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/resources/application.yml):
- `maximum-pool-size`: 20 conexões simultâneas.
- `leak-detection-threshold`: 5000ms (detecta e alerta vazamentos de conexões).

### Paginação de Alta Performance nas Pesagens e Animais
- **Standard `Pageable`**: [PesagemRepository.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/repository/PesagemRepository.java#L18)
- **Seek / Keyset Pagination**: Método `findNextPageSeek` implementado em [PesagemRepository.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/repository/PesagemRepository.java#L25-L33) para evitar gargalo computacional do `OFFSET` em tabelas com milhões de registros.

---

## 5. Infraestrutura e Deploy com Docker

- **Dockerfile Multi-Stage**: [Dockerfile](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/Dockerfile) com build Maven em JDK 21 e execução em JRE 21 Alpine sob usuário sem privilégios de root.
- **Docker Compose de Produção**: [docker-compose.yml](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/docker-compose.yml) incluindo API Spring Boot, PostgreSQL 16, volumes persistentes, limites de memória/CPU e healthchecks.
- **Template de Variáveis**: [.env.example](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/.env.example).

---

## 6. Observabilidade e Auditoria

1. **Auditoria JPA Automatizada**:
   - `Auditable.java`: [Auditable.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/model/Auditable.java) registra `created_at`, `updated_at`, `created_by` e `updated_by`.
   - `SpringSecurityAuditorAware.java`: [SpringSecurityAuditorAware.java](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/java/com/agrotijuco/sistema/config/audit/SpringSecurityAuditorAware.java) preenche automaticamente o usuário responsável.

2. **Logs Estruturados e Diagnóstico MDC**:
   - [logback-spring.xml](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/src/main/resources/logback-spring.xml) insere `traceId`, `tenantId` e `userId` em cada linha de log.

3. **Métricas Actuator + Prometheus**:
   - Endpoints `/actuator/health` e `/actuator/prometheus` expostos para integração com dashboards Grafana.

---

### 🚀 Executando o Projeto

```bash
# 1. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 2. Suba o ambiente via Docker Compose
docker-compose up --build -d

# 3. Teste o endpoint de saúde da aplicação
curl -i http://localhost:8080/actuator/health
```
