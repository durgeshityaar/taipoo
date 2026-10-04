import { z } from "zod";
import { questionBase } from "./base";

export const emailQuestion = z.object({
  ...questionBase,
  type: z.literal("email"),
});

export type EmailQuestion = z.infer<typeof emailQuestion>;

export const blankEmail = (id: string) => emailQuestion.parse({ id, type: "email", title: "" });

export const emailAnswer = (_q: EmailQuestion) => z.email();
