#!/usr/bin/env bash

# =============================================================================
# 🚜 AgroTijuco SaaS - Script de Inicialização Rápida e Verificação
# =============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN} 🚜 AgroTijuco - Sistema de Gestão Pecuária SaaS B2B ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

show_menu() {
    echo -e "${YELLOW}Escolha uma opção de inicialização:${NC}"
    echo "1) 🚀 Iniciar Frontend Dev Server (React + Vite)"
    echo "2) ⚙️  Compilar e Iniciar Backend (Spring Boot 3)"
    echo "3) 🧪 Executar Verificação de Build (Backend + Frontend)"
    echo "4) 🐳 Iniciar Containers com Docker Compose"
    echo "5) 📖 Abrir Localização das Documentações"
    echo "6) ❌ Sair"
    echo ""
}

run_frontend() {
    echo -e "${GREEN}Iniciando o Frontend em http://localhost:5173...${NC}"
    cd "${BASE_DIR}/FrontEnd_AgroTijuco" || exit
    npm run dev
}

run_backend() {
    echo -e "${GREEN}Iniciando o Backend Spring Boot na porta 8080...${NC}"
    cd "${BASE_DIR}/sistema" || exit
    ./mvnw spring-boot:run
}

check_build() {
    echo -e "${BLUE}1/2 Testando compilação do Backend (Java/Spring)...${NC}"
    cd "${BASE_DIR}/sistema" || exit
    if ./mvnw clean compile -q; then
        echo -e "${GREEN}✓ Backend compilado com sucesso!${NC}"
    else
        echo -e "${RED}✗ Falha na compilação do Backend.${NC}"
        return 1
    fi

    echo -e "${BLUE}2/2 Testando compilação do Frontend (React/TypeScript/Vite)...${NC}"
    cd "${BASE_DIR}/FrontEnd_AgroTijuco" || exit
    if npm run build; then
        echo -e "${GREEN}✓ Frontend compilado com sucesso!${NC}"
    else
        echo -e "${RED}✗ Falha na compilação do Frontend.${NC}"
        return 1
    fi

    echo -e "\n${GREEN}🎉 AMBOS OS PROJETOS FORAM COMPILADOS COM SUCESSO!${NC}\n"
}

run_docker() {
    echo -e "${BLUE}Subindo containers via Docker Compose...${NC}"
    cd "${BASE_DIR}/sistema" || exit
    docker-compose up --build -d
}

show_docs() {
    echo -e "${GREEN}Documentações disponíveis no projeto:${NC}"
    echo -e " - ${BLUE}Geral & Guia de Modificação:${NC} ${BASE_DIR}/GUIA_DE_MODIFICACAO.md"
    echo -e " - ${BLUE}Arquitetura & DevOps Backend:${NC} ${BASE_DIR}/sistema/ARCHITECTURE_AND_DEVOPS_GUIDE.md"
    echo -e " - ${BLUE}Documentação Backend:${NC} ${BASE_DIR}/sistema/README.md"
    echo -e " - ${BLUE}Documentação Frontend:${NC} ${BASE_DIR}/FrontEnd_AgroTijuco/README.md"
}

if [ "$1" == "frontend" ]; then
    run_frontend
elif [ "$1" == "backend" ]; then
    run_backend
elif [ "$1" == "check" ]; then
    check_build
elif [ "$1" == "docker" ]; then
    run_docker
else
    show_menu
    read -p "Opção [1-6]: " opcao
    case $opcao in
        1) run_frontend ;;
        2) run_backend ;;
        3) check_build ;;
        4) run_docker ;;
        5) show_docs ;;
        6) echo "Saindo..."; exit 0 ;;
        *) echo -e "${RED}Opção inválida.${NC}" ;;
    esac
fi
