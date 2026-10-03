import { z } from "zod";

// Stable ids (not array positions) so reordering questions never scrambles stored answers.
export const id = z.string().min(1).max(32);

// Fields every question type has. Spread into each type's schema.
export const questionBase = {
  id,
  title: z.string().trim().min(1).max(500),
  description: z.string().max(2000).optional(),
  required: z.boolean().default(false),
};
