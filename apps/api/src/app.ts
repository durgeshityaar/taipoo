import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { auth } from "./auth";
import { env } from "./env";
import { AppError } from "./lib/errors";
import { log, requestLogger } from "./lib/logger";
import { formsRoutes } from "./modules/forms/forms.routes";
import { formResponsesRoutes, publicFormRoutes } from "./modules/responses/responses.routes";

const app = new Hono()
  .basePath("/api")
  .use(requestId())
  .use(requestLogger)
  .use(cors({ origin: env.WEB_URL, credentials: true }))
  .use(
    bodyLimit({
      maxSize: 1024 * 1024, // 1 MB: a 200-question form is well under; blocks memory-exhaustion payloads
      onError: (c) => c.json({ error: { code: "payload_too_large", message: "Request body too large" } }, 413),
    }),
  )
  .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/health", (c) => c.json({ ok: true }))
  .route("/forms", formsRoutes)
  .route("/forms", formResponsesRoutes)
  .route("/f", publicFormRoutes);

app.onError((err, c) => {
  if (err instanceof AppError) {
    const { code, message, details } = err;
    return c.json({ error: { code, message, ...(details === undefined ? {} : { details }) } }, err.status);
  }
  if (err instanceof HTTPException) return err.getResponse();

  log.error({ err, reqId: c.get("requestId") }, "unhandled error");
  return c.json({ error: { code: "internal", message: "Internal server error" } }, 500);
});

app.notFound((c) => c.json({ error: { code: "not_found", message: "Route not found" } }, 404));

export default app;
export type AppType = typeof app;
