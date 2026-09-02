# 🚜 AgroTijuco — Sistema SaaS B2B Agrotech

Plataforma completa de Gestão Pecuária Inteligente Multi-Tenant (B2B SaaS) composta por um **Backend REST Spring Boot 3** e um **Frontend SPA React + Vite + TypeScript + Tailwind CSS**.

---

## 📁 Estrutura Geral do Repositório

```
Sistema_AgroTijuco/
├── sistema/               # 🟢 Backend API REST (Java 21 / Spring Boot 3 / PostgreSQL)
├── FrontEnd_AgroTijuco/   # 🔵 Frontend SPA (React / Vite / TypeScript / Tailwind CSS)
├── GUIA_DE_MODIFICACAO.md # 📖 Guia de Modificação e Mapeamento Completo de Arquivos
├── iniciar.sh             # 🚀 Script de Inicialização Rápida e Verificação
└── README.md              # 📄 Documentação Geral (este arquivo)
```

---

## ⚡ Como Inicializar o Projeto

### Opção 1: Usando o Script Automatizado (Recomendado)

No terminal, execute:
```bash
bash iniciar.sh
```
O script apresentará um menu interativo para:
1. Iniciar o Frontend Vite Dev Server (`http://localhost:5173`)
2. Compilar e Iniciar o Backend Spring Boot (`http://localhost:8080`)
3. Executar verificação de compilação de ambos os projetos (Build Healthcheck)
4. Subir ambiente completo com Docker Compose

---

### Opção 2: Inicialização Manual do Backend (`sistema/`)

1. Navegue até a pasta do backend:
   ```bash
   cd sistema
   ```
2. Verifique se o arquivo `.env` existe (caso não exista, copie do exemplo):
   ```bash
   cp .env.example .env
   ```
3. Garanta que o PostgreSQL esteja em execução ou suba via Docker Compose:
   ```bash
   docker-compose up -d postgres
   ```
4. Inicie o servidor Spring Boot:
   ```bash
   ./mvnw spring-boot:run
   ```
5. A API estará acessível em `http://localhost:8080` (Healthcheck em `http://localhost:8080/actuator/health`).

---

### Opção 3: Inicialização Manual do Frontend (`FrontEnd_AgroTijuco/`)

1. Navegue até a pasta do frontend:
   ```bash
   cd FrontEnd_AgroTijuco
   ```
2. Instale as dependências Node.js (caso ainda não tenham sido instaladas):
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```
4. Acesse no navegador: `http://localhost:5173`.
5. **Modo de Demonstração (Demo UUID):** Se o backend ainda não estiver em execução, você pode clicar em **"🚀 Entrar em Modo de Demonstração Rápida (Demo UUID)"** na tela de login para navegar e testar todas as funcionalidades visualmente.

---

## 📖 Onde Encontrar as Documentações Detalhadas

Para saber exatamente **onde modificar cada parte do sistema**, consulte os documentos listados abaixo:

1. 🗺️ **[GUIA_DE_MODIFICACAO.md](file:///home/thaynna-yara/Sistema_AgroTijuco/GUIA_DE_MODIFICACAO.md)**
   - Mapeia cada funcionalidade, tela, entidade, endpoint e estilo para o seu arquivo fonte exato no projeto.
2. 📐 **[ARCHITECTURE_AND_DEVOPS_GUIDE.md](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/ARCHITECTURE_AND_DEVOPS_GUIDE.md)**
   - Detalhes sobre a arquitetura Multi-Tenant, Spring Security 6, JWT, PostgreSQL RLS, HikariCP, Actuator e rotinas de backup S3.
3. 💻 **[FrontEnd README.md](file:///home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco/README.md)**
   - Guia de componentes React, design system Tailwind CSS e integração com Axios.
4. ⚙️ **[Backend README.md](file:///home/thaynna-yara/Sistema_AgroTijuco/sistema/README.md)**
   - Guia do desenvolvedor backend Spring Boot 3.

---

## 🎨 Paleta de Cores Oficial (Design System)

| Token Tailwind | Cor Hex | Utilização |
| :--- | :--- | :--- |
| **`agro-bg`** | `#fefae0` | Fundo principal da aplicação |
| **`agro-primary`** | `#588157` | Botões primários, destaques, navbar |
| **`agro-secondary`** | `#cfe1b9` | Badges, hovers, cards destacados |
| **`agro-accent`** | `#cb997e` | Botões de ação secundária, alertas |
| **`agro-dark`** | `#344e41` | Textos principais e cabeçalhos |
