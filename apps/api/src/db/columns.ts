import { sql } from "drizzle-orm";
import { customType, timestamp, uuid } from "drizzle-orm/pg-core";

// Row ids come from Postgres 18's uuidv7(): time-ordered, so inserts append to the index instead of scattering.
export const uuidv7 = () => uuid().primaryKey().default(sql`uuidv7()`);

export const timestamptz = () => timestamp({ withTimezone: true });

// Drizzle's built-in jsonb JSON.stringify()s values, and Bun.sql then JSON-encodes that string again, so
// Postgres stores a JSON *string* ("{\"title\":…}") instead of an object and every ->> / jsonb query breaks.
// Bun.sql encodes objects itself, so pass values through untouched in both directions.
export const jsonb = customType<{ data: unknown; driverData: unknown }>({
  dataType: () => "jsonb",
  toDriver: (value) => value,
  fromDriver: (value) => value,
});
