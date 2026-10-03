import { formDefinition } from "@taipoo/form-core";
import { Hono } from "hono";
import { z } from "zod";
import { requireAuth, type AuthEnv } from "../../auth";
import { idParam, validate } from "../../lib/validate";
import * as service from "./forms.service";

// HTTP layer only: validate input, call the service, shape the response. Rules live in forms.service.ts.
// Routes stay chained (not `app.get(...)` statements) so Hono can infer the RPC client types.

const formId = idParam("Form");
const createFormBody = z.object({ draft: formDefinition.optional() });

export const formsRoutes = new Hono<AuthEnv>()
  .use(requireAuth)

  // GET /api/forms: the signed-in user's forms, most recently updated first
  .get("/", async (c) => {
    const forms = await service.listForms(c.get("user").id);
    return c.json(forms);
  })

  // POST /api/forms: create a form (blank, untitled, unless a draft is given)
  .post("/", validate("json", createFormBody), async (c) => {
    const { draft } = c.req.valid("json");
    const form = await service.createForm(c.get("user").id, draft);
    return c.json(form, 201);
  })

  // GET /api/forms/:id: one form, including its draft
  .get("/:id", formId, async (c) => {
    const { id } = c.req.valid("param");
    const form = await service.getForm(c.get("user").id, id);
    return c.json(form);
  })

  // PUT /api/forms/:id/draft: replace the draft (the live version is unaffected until publish)
  .put("/:id/draft", formId, validate("json", formDefinition), async (c) => {
    const { id } = c.req.valid("param");
    const form = await service.updateDraft(c.get("user").id, id, c.req.valid("json"));
    return c.json(form);
  })

  // POST /api/forms/:id/publish: snapshot the draft as the next version and make it live
  .post("/:id/publish", formId, async (c) => {
    const { id } = c.req.valid("param");
    const version = await service.publishForm(c.get("user").id, id);
    return c.json(version, 201);
  });
