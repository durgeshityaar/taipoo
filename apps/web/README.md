# apps/web

The taipoo frontend: [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5 runes) on Vite, styled with Tailwind v4 and [shadcn-svelte](https://shadcn-svelte.com). Its core is the form editor, which behaves like a document: `/` inserts a block, Enter keeps writing, and edits autosave. The app also covers the dashboard, results, auth pages and the public form respondents fill in. All data comes from [`apps/api`](../api) through a typed client, so API changes show up here as type errors.

## Quick start

You need [Bun](https://bun.sh) and Docker. The web app needs the API running, so set that up first (see the [API README](../api/README.md)). Commands run from the repo root.

```bash
bun install
cp apps/web/.env.example apps/web/.env
make dev-api      # terminal 1: Postgres + API on :3000
make dev-web      # terminal 2: http://localhost:5173
```

The dev server must use port 5173: the API only trusts that origin (its `WEB_URL`) for auth cookies. Vite proxies `/api/*` to the API, so the browser sees a single origin.

## Environment

| Variable | Default | |
|---|---|---|
| `API_URL` | `http://localhost:3000` | where the API listens; used by the dev proxy and server-side `load` functions |

## Scripts

Run inside `apps/web`.

| | |
|---|---|
| `bun run dev` | dev server on :5173 |
| `bun run check` | Svelte and TypeScript checks, including the API's types |
| `bun run test` | unit tests (`bun:test`, `*.test.ts` under `src/`) |
| `bun run build` / `bun run preview` | production build and a local preview of it |

## Layout

```
src/
  routes/
    +page.svelte                 landing page
    (auth)/login, signup         sign in / sign up
    (app)/dashboard              the signed-in user's forms
    (app)/forms/[id]/edit        form editor
    (app)/forms/[id]/results     responses and CSV export
    f/[slug]                     public form respondents fill in
    tokens.css                   design tokens (the only place raw colors and sizes live)
  lib/
    api.ts, server/api.ts        typed API clients (browser / server load functions)
    auth-client.ts               Better Auth client
    form-editor/                 editor state and draft operations
    components/questions/        one editor block per question type
    components/form-view/        renders a form for respondents and previews
    components/ui/               shadcn-svelte components (customized; see AGENTS.md before updating)
```

Form, question and answer schemas are shared with the API in [`packages/form-core`](../../packages/form-core).

## Contributing

- UI work follows [`DESIGN.md`](DESIGN.md): use its semantic tokens and type classes, not raw values.
- Before opening a PR, run `bun run check` and `bun run test`.
- Adding a question or layout block type: see the "Blocks" section of [`AGENTS.md`](AGENTS.md).

Deployment isn't set up yet: the app still uses `adapter-auto`.
