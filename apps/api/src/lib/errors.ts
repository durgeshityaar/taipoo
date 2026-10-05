import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { z } from "zod";

// Operational errors: expected failures we answer with a 4xx. Anything else is a bug → 500.
export class AppError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: string,
    message: string,
    public details?: unknown, // e.g. per-field validation issues, sent to the client as-is
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what: string) => new AppError(404, "not_found", `${what} not found`);
export const forbidden = () => new AppError(403, "forbidden", "Forbidden");
export const unauthorized = () => new AppError(401, "unauthorized", "Sign in required");

// One { path, message } per zod issue, e.g. { path: "blocks.0.title", message: "Too small…" }.
export const toDetails = (error: Pick<z.core.$ZodError, "issues">) =>
  error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));

export const invalidInput = (error: Pick<z.core.$ZodError, "issues">, message = "Invalid input") =>
  new AppError(400, "invalid_input", message, toDetails(error));
