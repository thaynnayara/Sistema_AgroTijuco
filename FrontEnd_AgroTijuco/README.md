# AgroTijuco — Frontend SaaS B2B Agrotech

O **AgroTijuco** é uma plataforma Single Page Application (SPA) SaaS B2B de alta performance voltada para a gestão pecuária inteligente. A aplicação frontend foi desenvolvida utilizando **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **React Router DOM**, **Axios**, **Zod** e **React Hook Form**.

---

## 🎨 Identidade Visual & Design System

A paleta de cores foi desenhada especificamente para proporcionar alta legibilidade e harmonia visual no campo:

- **`agro-bg`** (`#f8faf7`): Fundo suave da tela (off-white fresco).
- **`agro-primary`** (`#2d6a4f`): Verde floresta nobre (botões principais, navegação e destaques).
- **`agro-primary-hover`** (`#1b4332`): Verde profundo para estados de foco/hover.
- **`agro-secondary`** (`#d8f3dc`): Verde pasto claro para badges, cards suaves e seleções.
- **`agro-accent`** (`#d97706`): Âmbar colheita para indicadores de balança e atenção.
- **`agro-dark`** (`#1e293b`): Grafite escuro para leitura confortável.
- **`agro-forest`** (`#16281e`): Verde escuro de alto contraste.

---

## 🔒 Conexão com o Backend (API REST Spring Boot)

A integração com a API REST Spring Boot é feita via Axios (`src/services/api.ts`):

- **Base URL:** `http://localhost:8080` (configurável via `VITE_API_URL` em arquivo `.env`).
- **Suporte a UUIDs:** Todos os registros (Produtores, Propriedades, Animais e Pesagens) utilizam identificadores UUID v4.
- **Multi-tenancy:** Cabeçalho JWT `Authorization: Bearer <token>` é injetado automaticamente em todas as requisições autenticadas.
- **Tratamento de 401 Unauthorized:** O interceptor intercepta erros 401, limpa os tokens do `localStorage`/`sessionStorage` e redireciona automaticamente o usuário para `/login`.

---

## 📑 Endpoints Mapeados na Aplicação

| Entidade | Método | Endpoint Backend | Descrição no Frontend |
| :--- | :--- | :--- | :--- |
| **Autenticação** | `POST` | `/auth/login` | Login com e-mail/senha, salvando token JWT e dados do Tenant. |
| **Produtores** | `POST` | `/produtores` | Cadastra produtor rural e retorna o UUID gerado pelo backend. |
| **Propriedades** | `POST` | `/propriedades/produtor/{uuid}` | Vincula a propriedade rural ao UUID de um Produtor existente. |
| **Animais** | `POST` | `/animais/propriedade/{uuid}` | Cadastra animal/brinco vinculado ao UUID de uma Propriedade. |
| **Pesagens** | `POST` | `/pesagens/animal/{uuid}` | Lança pesagem e calcula o Ganho Médio Diário (GMD) por UUID de Animal. |

---

## 🛠️ Requisitos Pré-existentes

- **Node.js:** Versão `>= 18.0.0`
- **npm:** Versão `>= 9.0.0`

---

## 🚀 Guia Passo a Passo para Inicializar o Sistema

### 1. Clonar ou Acessar a Pasta do Frontend
```bash
cd /home/thaynna-yara/Sistema_AgroTijuco/FrontEnd_AgroTijuco
```

### 2. Instalar as Dependências do Projeto
Execute o comando abaixo no terminal:
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento (Dev Server)
Para rodar a aplicação localmente com Live Reloading (Hot Module Replacement):
```bash
npm run dev
```
O Vite iniciará o servidor local e fornecerá o endereço de acesso, como:
`http://localhost:5173/`

### 4. Acessar a Aplicação
1. Abra o navegador no endereço `http://localhost:5173/`.
2. Você será direcionado para a tela de **Login**.
3. **Acesso Direto como Gestora:** Na tela de login, clique no botão **"🌱 Entrar como Thaynná Yara (Gestora)"** para navegar imediatamente por todas as telas com dados demonstrativos pré-carregados e alternância de modo técnico.
4. Para conectar com a API real, certifique-se de que o backend Spring Boot esteja rodando na porta `8080`.

---

## 🏗️ Gerar Build para Produção

Para validar a compilação de tipos e gerar o bundle de produção otimizado em `dist/`:
```bash
npm run build
```

Para visualizar a versão de produção criada localmente:
```bash
npm run preview
```

---

## 📁 Estrutura do Código Fonte (`src/`)

```
src/
├── components/         # Componentes reutilizáveis (PrivateRoute, etc.)
├── contexts/           # Contexto de Autenticação JWT (AuthContext.tsx)
├── layouts/            # DashboardLayout.tsx (Navbar + Sidebar responsivos)
├── pages/              # Telas da aplicação (Login, Dashboard, Produtores, Propriedades, Animais, Pesagens)
├── services/           # Instância Axios (api.ts) e serviços de API (.ts)
├── types/              # Modelos de dados TypeScript (interfaces UUID)
├── App.tsx             # Roteador principal com react-router-dom
├── index.css           # Estilos globais e tokens Tailwind CSS
└── main.tsx            # Ponto de entrada da aplicação React
```
