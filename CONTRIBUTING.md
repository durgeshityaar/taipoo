# Contributing to taipoo

Thanks for helping. This guide covers setting up and getting a change merged.

## Before you start

- **Bugs and small fixes:** open a PR directly.
- **Features or larger changes:** open an issue first to agree on the approach, so your work doesn't get rejected late.
- Check the [open issues](https://github.com/durgeshityaar/taipoo/issues) for something to pick up.

## Setup

Follow the [quick start](README.md#quick-start). You need Bun and Docker.

## Making a change

1. Branch from `main`.
2. Keep each PR to one change. Small PRs get reviewed faster.
3. Match the code around you. Each package's `AGENTS.md` lists its conventions: [api](apps/api/AGENTS.md), [web](apps/web/AGENTS.md), and the [root](AGENTS.md) for the whole repo.
4. Add or update tests for behavior you change: API routes in `apps/api/test`, schemas in `packages/form-core`, logic in `apps/web/src/**/*.test.ts`.
5. Changing the database schema? Run `make db-generate name=<what_changed>` and commit the generated migration.
6. Editor changes keep the "write it like a doc" feel: inline, keyboard-first, autosaved. See the product principle in [`AGENTS.md`](AGENTS.md).
7. UI changes follow [`apps/web/DESIGN.md`](apps/web/DESIGN.md).

## Before you open a PR

```bash
make check   # type-check every package
make test    # all tests (starts Postgres)
```

CI runs both on every PR. In the PR description, say what changed and why, and add a screenshot for UI changes.

## Commits

Write short, imperative subject lines that say what the change does, e.g. "Add page breaks to the public form". Explain why in the body if it isn't obvious.

## Common tasks

- **New question type:** follow the "Adding a type" steps in [`packages/form-core/src/schema/questions/index.ts`](packages/form-core/src/schema/questions/index.ts).
- **New layout block:** follow "Adding a layout block" in [`packages/form-core/src/schema/blocks/index.ts`](packages/form-core/src/schema/blocks/index.ts).
- **New API module:** see "Modules" in [`apps/api/AGENTS.md`](apps/api/AGENTS.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
