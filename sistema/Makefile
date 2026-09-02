.PHONY: all help up down ac restart logs ps build test

help:
	@echo "Comandos disponíveis no Makefile:"
	@echo "  make up       - Constrói e inicializa os containers em segundo plano"
	@echo "  make down     - Para e remove os containers e volumes"
	@echo "  make ac       - Reinicia o ambiente completo (down + up)"
	@echo "  make restart  - Alias para 'make ac'"
	@echo "  make logs     - Exibe os logs dos containers em tempo real"
	@echo "  make ps       - Exibe o status dos containers"
	@echo "  make build    - Constrói as imagens Docker"
	@echo "  make test     - Executa os testes automatizados da aplicação"

up:
	docker compose up -d --build

down:
	docker compose down -v

ac: down up

restart: ac

logs:
	docker compose logs -f

ps:
	docker compose ps

build:
	docker compose build

test:
	./mvnw test