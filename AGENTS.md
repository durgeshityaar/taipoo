# taipoo

A form builder in one Bun workspace. Each package has its own `AGENTS.md` with its conventions; read it before working there.

| Path | Owns |
|---|---|
| `packages/form-core` | Zod schemas for forms, blocks, questions and answers, plus results helpers. The single source of truth for these shapes. |
| `apps/api` | Hono API on `Bun.serve`, Drizzle + Postgres 18, Better Auth ([AGENTS.md](apps/api/AGENTS.md)) |
| `apps/web` | SvelteKit on Vite ([AGENTS.md](apps/web/AGENTS.md), [DESIGN.md](apps/web/DESIGN.md)) |

## Product principle

taipoo's differentiator is that building a form feels like writing a doc. The editor is keyboard-first and inline: `/` inserts a block, Enter keeps writing, edits autosave, and settings sit on the block itself. New editor features should keep that feel. Prefer inline controls and keyboard paths over dialogs, wizards, side panels and Save buttons. If a feature can't fit that, raise it in an issue before building it.

## Rules

- Use Bun for everything: `bun install`, `bun run`, `bun test`, `bunx`. Never npm, yarn, pnpm or node.
- Bun loads `.env` itself, so don't add dotenv.
- Shared dependency versions (`hono`, `zod`) live in the root `package.json` `catalog`. Reference them as `"catalog:"`.
- A change to a shape flows form-core → api → web. Never redefine a form-core type in an app.
- `make help` lists the dev commands (Postgres, migrations, dev servers).

## Done means

From the root: `make check` (type-checks every package) and `make test` (all tests; needs Docker for Postgres) pass. CI runs both.
