# apps/web

SvelteKit (Svelte 5 runes) on Vite, Tailwind v4, shadcn-svelte. This app is the exception to the root CLAUDE.md's "Frontend" section: it runs on Vite, not `Bun.serve()` HTML imports. Bun is still the package manager and script runner.

## Design

Read `DESIGN.md` before any UI work — styling a page, choosing a color, type size, radius or shadow, or adding/restyling a component. Style with its semantic roles and type classes (`bg-primary`, `text-muted-foreground`, `text-heading-2`, `rounded-lg`, `bg-hover`); raw values live only in `src/routes/tokens.css`.

## shadcn components (`src/lib/components/ui`)

Files starting with a `design:` comment carry our customizations. `shadcn-svelte add` prompts to overwrite shared dependencies (button, input, label…), and `--overwrite` restores the registry version. When adding components:

1. Copy `src/lib/components/ui` aside first.
2. Run `bunx shadcn-svelte@latest add <names> --yes --overwrite < /dev/null`.
3. Restore every component folder that existed before, then style the new ones per DESIGN.md with a `design:` comment of their own.

## Talking to the API

- Browser: `api(fetch)` from `$lib/api` — typed from the API's `AppType`, same-origin `/api/*` through the Vite proxy, session cookie included.
- `+page.server.ts`: `serverApi(fetch)` from `$lib/server/api` — calls `API_URL` directly and forwards no cookies, so public endpoints only.
- Auth: `authClient` from `$lib/auth-client`. `(app)` routes are client-rendered (`ssr = false`) behind the session guard in `(app)/+layout.ts`; that guard is UX only — the API's `requireAuth` protects the data.
- The dev server must run on port 5173 (`strictPort`): the API trusts only `WEB_URL=http://localhost:5173` as an auth origin.

## State

Shared UI state: runes (`$state`) in `.svelte.ts` modules. Server data: `load` functions, refreshed with `invalidate()`.

## Done means

`bun run check` passes. It also type-checks `apps/api` through `AppType`, so an API type error fails here too.
