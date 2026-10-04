import { z } from "zod";

// Stable ids (not array positions) so reordering questions never scrambles stored answers.
export const id = z.string().min(1).max(32);

// 12 hex chars: unique enough within one form, and well under `id`'s max.
export const newId = () => crypto.randomUUID().replaceAll("-", "").slice(0, 12);

// Fields every question type has. Spread into each type's schema.
// Titles may be empty in a draft; publishing requires one (see formDefinition).
export const questionBase = {
  id,
  title: z.string().trim().max(500),
  description: z.string().max(2000).optional(),
  required: z.boolean().default(false),
};

// A publish rule broken by one question; `path` is relative to the question.
export type PublishIssue = { path: PropertyKey[]; message: string };
