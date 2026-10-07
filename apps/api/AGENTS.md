# apps/api

Hono on Bun, Drizzle on Postgres 18 (through `Bun.sql`), Better Auth. The README covers setup, scripts and layout; this file covers the rules the code doesn't make obvious.

## Modules (`src/modules/<name>/`)

- `*.routes.ts`: HTTP only. Validate with `validate(...)` / `idParam(...)` from `lib/validate`, call the service, return `c.json`. Keep routes **chained** (`new Hono().get(...).post(...)`) or the RPC types in `AppType` break.
- `*.service.ts`: rules and errors. Throw `AppError` helpers from `lib/errors` (`notFound`, `forbidden`, `invalidInput`…), never return error responses.
- `*.data.ts`: Drizzle queries only. Scope owner data in the query (`owned(id, ownerId)` in `forms.data.ts`), so another user's row looks exactly like a missing one (404, not 403).
- New module: create the three files, then mount its routes in `src/app.ts` and add `test/<name>.test.ts`.
- `analytics/` and `workspaces/` (and their tests) are empty placeholders. They aren't mounted.

## Database

- Schema change: edit `src/db/schema/*`, run `make db-generate name=<what_changed>`, and commit the SQL in `drizzle/`. Never edit generated migrations or the `meta/` snapshots.
- Use the `jsonb`, `uuidv7` and `timestamptz` helpers from `src/db/columns.ts`. Drizzle's own `jsonb()` encodes values twice under Bun.sql and stores a JSON string.
- Casing is `snake_case`: write camelCase in TS, and columns come out snake_case.
- Ids are uuidv7 (time-ordered). List endpoints use keyset pagination (`lib/pagination.ts`, `id < cursor`), not OFFSET.

## Forms and responses

- Form, block and answer shapes come from `@taipoo/form-core`. Import them; never redefine them here.
- `forms.draft` is the editor's working copy. Respondents only ever see `form_versions.definition` (the version `published_version_id` points at). Each response references the version it answered, so read questions for a response from that version, never from the draft.
- Validate submissions with `answersSchemaFor(version.definition)`.

## Contract with apps/web

`apps/web` imports `AppType` through `api/client`. Renaming a route, a param or a response field changes the web app's types, so run `bun run check` in `apps/web` after API shape changes.

## Done means

From `apps/api`: `bun run check` and `bun test` pass (Postgres must be up: `make up`). A schema change also needs its committed migration.
