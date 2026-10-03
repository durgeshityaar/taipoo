import type { Answers } from "@taipoo/form-core";
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../../db/client";
import { formVersions, forms, responses } from "../../db/schema";
import type { PageQuery } from "../../lib/pagination";

// The live version of a form by its public slug. Undefined if the slug is unknown or nothing is published.
export async function findPublishedBySlug(slug: string) {
  const [row] = await db
    .select({ formId: forms.id, version: formVersions })
    .from(forms)
    .innerJoin(formVersions, eq(formVersions.id, forms.publishedVersionId))
    .where(eq(forms.slug, slug));
  return row;
}

export async function insertResponse(values: { formId: string; formVersionId: string; answers: Answers }) {
  const [row] = await db.insert(responses).values(values).returning({ id: responses.id });
  return row!;
}

// Newest first; fetches limit + 1 so toPage() can tell whether another page exists.
export const listByForm = (formId: string, { cursor, limit }: PageQuery) =>
  db
    .select({
      id: responses.id,
      formVersionId: responses.formVersionId,
      answers: responses.answers,
      submittedAt: responses.submittedAt,
    })
    .from(responses)
    .where(and(eq(responses.formId, formId), cursor ? lt(responses.id, cursor) : undefined))
    .orderBy(desc(responses.id))
    .limit(limit + 1);
