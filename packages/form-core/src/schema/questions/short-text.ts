import { z } from "zod";
import { questionBase } from "./base";

export const shortTextQuestion = z.object({
  ...questionBase,
  type: z.literal("short_text"),
  maxLength: z.number().int().positive().max(1000).default(1000),
});

export type ShortTextQuestion = z.infer<typeof shortTextQuestion>;

export const blankShortText = (id: string) => shortTextQuestion.parse({ id, type: "short_text", title: "" });

export const shortTextAnswer = (q: ShortTextQuestion) => z.string().trim().max(q.maxLength);
