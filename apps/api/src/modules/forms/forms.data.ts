import type { FormDefinition } from "@taipoo/form-core";
import { and, desc, eq, max, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { formVersions, forms } from "../../db/schema";

// Every query is scoped to the owner, so another user's form behaves exactly like a missing one.
const owned = (id: string, ownerId: string) => and(eq(forms.id, id), eq(forms.ownerId, ownerId));

export async function insertForm(ownerId: string, draft: FormDefinition) {
  const [form] = await db.insert(forms).values({ ownerId, draft }).returning();
  return form!;
}

export const listFormsByOwner = (ownerId: string) =>
  db
    .select({
      id: forms.id,
      slug: forms.slug,
      title: sql<string>`${forms.draft}->>'title'`, // list view doesn't need the whole definition
      publishedVersionId: forms.publishedVersionId,
      updatedAt: forms.updatedAt,
    })
    .from(forms)
    .where(eq(forms.ownerId, ownerId))
    .orderBy(desc(forms.updatedAt));

export async function findOwnedForm(id: string, ownerId: string) {
  const [form] = await db.select().from(forms).where(owned(id, ownerId));
  return form;
}

export async function updateOwnedDraft(id: string, ownerId: string, draft: FormDefinition) {
  const [form] = await db.update(forms).set({ draft }).where(owned(id, ownerId)).returning();
  return form;
}

// Snapshot the current draft as the next version and make it the live one, atomically.
// The row lock serializes concurrent publishes of the same form, so version numbers never collide.
export function publishOwnedDraft(id: string, ownerId: string) {
  return db.transaction(async (tx) => {
    const [form] = await tx.select().from(forms).where(owned(id, ownerId)).for("update");
    if (!form) return undefined;
    const [{ latest } = { latest: null }] = await tx
      .select({ latest: max(formVersions.version) })
      .from(formVersions)
      .where(eq(formVersions.formId, id));
    const [version] = await tx
      .insert(formVersions)
      .values({ formId: id, version: (latest ?? 0) + 1, definition: form.draft })
      .returning();
    await tx.update(forms).set({ publishedVersionId: version!.id }).where(eq(forms.id, id));
    return version!;
  });
}
