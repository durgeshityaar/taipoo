import { z } from "zod";
import { questionBase } from "./base";

export const longTextQuestion = z.object({
  ...questionBase,
  type: z.literal("long_text"),
  maxLength: z.number().int().positive().max(10_000).default(10_000),
});

export type LongTextQuestion = z.infer<typeof longTextQuestion>;

export const blankLongText = (id: string) => longTextQuestion.parse({ id, type: "long_text", title: "" });

export const longTextAnswer = (q: LongTextQuestion) => z.string().trim().max(q.maxLength);
