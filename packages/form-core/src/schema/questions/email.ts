import { z } from "zod";
import { questionBase } from "./base";

export const emailQuestion = z.object({
  ...questionBase,
  type: z.literal("email"),
});

export type EmailQuestion = z.infer<typeof emailQuestion>;

export const emailAnswer = (_q: EmailQuestion) => z.email();
