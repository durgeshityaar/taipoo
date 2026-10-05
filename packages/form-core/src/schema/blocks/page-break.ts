import { z } from "zod";
import { id } from "../questions/base";

// Starts a new page: respondents see one page at a time, with Next between them.
export const pageBreak = z.object({
  id,
  type: z.literal("page_break"),
});

export type PageBreak = z.infer<typeof pageBreak>;

export const blankPageBreak = (id: string): PageBreak => ({ id, type: "page_break" });
