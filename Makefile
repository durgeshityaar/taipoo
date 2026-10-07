COMPOSE := docker compose -f apps/api/docker-compose.yml
API := cd apps/api && bun run

.PHONY: help install up down reset logs psql dev-api dev-web test check db-generate db-migrate db-studio

help: ## list commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## install all workspace deps
	bun install

up: ## start postgres (waits until healthy)
	$(COMPOSE) up -d --wait

down: ## stop postgres, keep data
	$(COMPOSE) down

reset: ## stop postgres and DELETE all data, then start fresh + migrate
	$(COMPOSE) down -v
	$(COMPOSE) up -d --wait
	$(API) db:migrate

logs: ## follow postgres logs
	$(COMPOSE) logs -f postgres

psql: ## open a psql shell
	$(COMPOSE) exec postgres psql -U taipoo -d taipoo

dev-api: up ## run the API with hot reload (starts postgres first)
	$(API) dev

dev-web: ## run the SvelteKit dev server
	cd apps/web && bun run dev

test: up ## run all tests (API tests use the separate taipoo_test database)
	cd packages/form-core && bun test
	cd apps/web && bun run test
	$(API) test

check: ## type-check every package
	cd packages/form-core && bun run check
	$(API) check
	cd apps/web && bun run check

db-generate: ## create a migration from schema changes (make db-generate name=add_forms)
	$(API) db:generate $(if $(name),--name $(name))

db-migrate: ## apply pending migrations
	$(API) db:migrate

db-studio: ## open Drizzle Studio
	$(API) db:studio
