# apps/api

The taipoo backend: a JSON API on [Hono](https://hono.dev), running on Bun, with Postgres 18 through [Drizzle](https://orm.drizzle.team) and email/password auth from [Better Auth](https://better-auth.com). Every route lives under `/api`. The web app calls it through a typed client (`api/client`), so request and response types are shared without codegen.

## Quick start

You need [Bun](https://bun.sh) and Docker. Commands run from the repo root.

```bash
bun install
cp apps/api/.env.example apps/api/.env
# set BETTER_AUTH_SECRET in apps/api/.env to the output of: openssl rand -base64 32
make up           # Postgres 18 on localhost:5433
make db-migrate
make dev-api      # http://localhost:3000/api/health → {"ok":true}
```

`make help` lists every command.

## Environment

Validated at startup in `src/env.ts`. The process exits with a readable error if anything is missing.

| Variable | Default | |
|---|---|---|
| `DATABASE_URL` | required | `.env.example` points at the Docker Postgres |
| `BETTER_AUTH_SECRET` | required | at least 32 chars |
| `BETTER_AUTH_URL` | required | this API's public URL |
| `WEB_URL` | required | the web app's origin; the only origin allowed by CORS and auth |
| `PORT` | `3000` | |
| `LOG_LEVEL` | `info` | `fatal` … `trace`, or `silent` |
| `LOG_STACK` | `short` | `full` also prints library stack frames |

## Scripts

Run inside `apps/api`, or use the `make` targets from the root.

| | |
|---|---|
| `bun run dev` | API with hot reload |
| `bun test` | test suite (see below) |
| `bun run check` | type check |
| `bun run db:generate --name <name>` | create a migration from schema changes |
| `bun run db:migrate` | apply pending migrations |
| `bun run db:studio` | browse the database in Drizzle Studio |

## Tests

`bun test` loads `.env.test` on top of `.env`, so tests use a separate `taipoo_test` database. `test/setup.ts` creates it if needed, migrates it and empties it before each run. It refuses to run against any database whose name doesn't end in `_test`. Tests call the app in-process through the typed client in `test/helpers.ts`, and each test signs up its own user so tests don't share data.

Postgres must be running (`make up`). `make test` starts it and also runs the `packages/form-core` tests.

## Layout

```
src/
  index.ts         server start-up and shutdown
  app.ts           middleware, route mounting, error → JSON mapping; exports AppType
  client.ts        typed RPC client for the web app
  auth.ts          Better Auth setup and the requireAuth middleware
  env.ts           environment validation
  db/
    schema/        tables (forms, form_versions, responses, Better Auth's)
    columns.ts     shared column helpers (uuidv7 ids, timestamptz, jsonb)
  lib/             errors, validation, pagination, rate limiting, CSV, logging
  modules/<name>/  <name>.routes.ts → <name>.service.ts → <name>.data.ts
drizzle/           generated SQL migrations (committed)
test/              API tests
```

## Data model

- **`forms`**: the editable `draft` (jsonb), the public `slug`, and `published_version_id` (null means unpublished).
- **`form_versions`**: an immutable copy of the draft, taken on every publish.
- **`responses`**: one row per submission. `answers` (jsonb) maps question id → answer, and `form_version_id` records the version that was answered.

The draft, definition and answer shapes are zod schemas in [`packages/form-core`](../../packages/form-core). The API and the web app both validate with them.

## Errors

Every error response has the same shape:

```json
{ "error": { "code": "invalid_input", "message": "Invalid json", "details": [{ "path": "blocks.0.title", "message": "Required" }] } }
```

Throw an `AppError` (`src/lib/errors.ts`) for an expected 4xx. Any other thrown error is logged and returned as a 500 `internal`.
