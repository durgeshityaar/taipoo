import { z } from "zod";

// Keyset ("after this row") pagination over uuidv7 ids: they're time-ordered, so `id < cursor` ordered by
// id desc walks newest → oldest and stays fast at any depth (unlike OFFSET, which rescans skipped rows).
export const pageQuery = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PageQuery = z.infer<typeof pageQuery>;

// Queries fetch `limit + 1` rows; the extra row only signals that another page exists.
export function toPage<T extends { id: string }>(rows: T[], limit: number) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? items.at(-1)!.id : null };
}
