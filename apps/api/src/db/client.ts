import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { env } from "../env";
import * as schema from "./schema";
import * as relations from "./relations";

export const sql = new SQL(env.DATABASE_URL);

export const db = drizzle({
  client: sql,
  schema: { ...schema, ...relations },
  casing: "snake_case",
});

export type DB = typeof db;
