# @taipoo/form-core

Shared [zod](https://zod.dev) schemas and helpers for taipoo forms. The API validates with them on the server, the web app validates the same way in the browser, and both share the inferred TypeScript types. It has no runtime dependencies besides zod.

## What's in it

| File | |
|---|---|
| `src/schema/form.ts` | `formDraft` (what the editor saves: structure only) and `formDefinition` (a draft that's ready to publish) |
| `src/schema/blocks/` | `block`: the union of questions and layout blocks (page breaks); `pagesOf` and `questionsOf` |
| `src/schema/questions/` | one file per question type: schema, blank draft, publish rules, answer validator |
| `src/schema/answers.ts` | `Answers` (the stored shape: question id → answer) and `answersSchemaFor(form)` to validate a submission |
| `src/results.ts` | turns stored answers into results-table columns and cells, across versions |

## Adding a question type or layout block

Follow the numbered steps at the top of `src/schema/questions/index.ts` or `src/schema/blocks/index.ts`. TypeScript reports an error until every registry, including the web editor's, includes the new type.

## Scripts

```bash
bun test        # unit tests
bun run check   # type check
```
