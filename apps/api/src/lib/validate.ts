import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z } from "zod";
import { invalidInput, notFound } from "./errors";

// zValidator with our error shape: 400 { error: { code: "invalid_input", message, details: [{ path, message }] } }.
// Keeps zValidator's generics, so RPC clients still get typed inputs.
export const validate = <T extends keyof ValidationTargets, S extends z.ZodType>(target: T, schema: S) =>
  zValidator(target, schema, (result) => {
    if (!result.success) throw invalidInput(result.error, `Invalid ${target}`);
  });

// `:id` route param that must be a uuid. A malformed id can't match any row, so answer 404 (not 400)
// and never hand Postgres a non-uuid (it would throw → 500).
export const idParam = (what: string) =>
  zValidator("param", z.object({ id: z.uuid() }), (result) => {
    if (!result.success) throw notFound(what);
  });
