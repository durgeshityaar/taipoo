# taipoo

**Forms you write like a document.** taipoo is an open-source form builder with no field palette and no settings dialogs. You type a title, press Enter, and keep writing. Type `/` to insert a question, publish a link, and read every response in one table.

> Early MVP: things move fast and the data model may still change.

## Features

- **A document-style editor:** type `/` to insert a block, press Enter to keep writing, drag to reorder, and every edit autosaves, with no Save button
- Short text, long text, email and multiple-choice questions, plus page breaks for multi-page forms
- Draft and publish: edit freely while the published version stays live, and every publish is kept as a version
- Public form at `/f/<slug>`, validated with the same schemas on the client and the server
- Results table and CSV export; answers stay readable after questions are renamed or deleted
- Email and password accounts

## Stack

[Bun](https://bun.sh) workspaces · [Hono](https://hono.dev) API · Postgres 18 through [Drizzle](https://orm.drizzle.team) · [Better Auth](https://better-auth.com) · [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5, Tailwind v4 and [shadcn-svelte](https://shadcn-svelte.com) · [zod](https://zod.dev) schemas shared end to end

## Quick start

You need Bun and Docker.

```bash
bun install
cp apps/api/.env.example apps/api/.env   # then set BETTER_AUTH_SECRET: openssl rand -base64 32
cp apps/web/.env.example apps/web/.env
make up && make db-migrate               # Postgres on localhost:5433
make dev-api                             # terminal 1: API on :3000
make dev-web                             # terminal 2: open http://localhost:5173
```

`make help` lists every command. `make test` runs all tests and `make check` type-checks every package.

## Repository

| Path | What it is |
|---|---|
| [`apps/api`](apps/api) | JSON API: auth, forms, versions, responses, CSV export |
| [`apps/web`](apps/web) | SvelteKit app: dashboard, editor, results, public form |
| [`packages/form-core`](packages/form-core) | Shared zod schemas for forms, blocks and answers, plus results helpers |

Each one has a README with more detail.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and report vulnerabilities as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
