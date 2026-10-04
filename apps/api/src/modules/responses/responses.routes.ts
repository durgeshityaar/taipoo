import { answers } from "@taipoo/form-core";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { requireAuth, type AuthEnv } from "../../auth";
import { notFound } from "../../lib/errors";
import { pageQuery } from "../../lib/pagination";
import { clientIp, rateLimit } from "../../lib/rate-limit";
import { idParam, validate } from "../../lib/validate";
import * as service from "./responses.service";

// HTTP layer only: validate input, call the service, shape the response. Rules live in responses.service.ts.
// Routes stay chained so Hono can infer the RPC client types.

// Slugs are generated (12 hex chars) today; allow the charset custom slugs would use. Anything else can't
// exist, so 404 without touching the database.
const slugParam = zValidator("param", z.object({ slug: z.string().regex(/^[a-z0-9-]{1,64}$/) }), (result) => {
  if (!result.success) throw notFound("Form");
});

const submissionBody = z.object({
  versionId: z.uuid(),
  answers, // loose shape here; checked against the form's own questions in the service
  website: z.string().optional(), // honeypot: hidden in the form UI, must stay empty
});

// Per IP *and* form: one busy form (or a shared office IP) can't lock visitors out of other forms.
const submitLimit = rateLimit({ max: 10, windowMs: 60_000, key: (c) => `${clientIp(c)}:${c.req.param("slug")}` });

// Public, no sign-in: what visitors of /f/<slug> use.
export const publicFormRoutes = new Hono()
  // GET /api/f/:slug: the published version of a form (404 if unknown or unpublished)
  .get("/:slug", slugParam, async (c) => {
    const { slug } = c.req.valid("param");
    const form = await service.getPublicForm(slug);
    return c.json(form);
  })

  // POST /api/f/:slug/responses: submit answers to the published version
  .post("/:slug/responses", submitLimit, slugParam, validate("json", submissionBody), async (c) => {
    const { slug } = c.req.valid("param");
    await service.submitResponse(slug, c.req.valid("json"));
    return c.json({ submitted: true }, 201);
  });

// Owner-only: mounted under /api/forms next to formsRoutes. requireAuth is per-route, not `.use()`:
// a sub-app's `.use()` would also run for every formsRoutes request sharing the /api/forms prefix.
export const formResponsesRoutes = new Hono<AuthEnv>()
  // GET /api/forms/:id/responses?cursor=&limit=: a page of responses, newest first
  .get("/:id/responses", requireAuth, idParam("Form"), validate("query", pageQuery), async (c) => {
    const { id } = c.req.valid("param");
    const page = await service.listResponses(c.get("user").id, id, c.req.valid("query"));
    return c.json(page);
  })

  // GET /api/forms/:id/responses.csv: every response as a CSV download
  .get("/:id/responses.csv", requireAuth, idParam("Form"), async (c) => {
    const { id } = c.req.valid("param");
    const { csv, filename } = await service.exportResponsesCsv(c.get("user").id, id);
    return c.body(csv, 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
  });
