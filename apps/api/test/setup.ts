// Preloaded by `bun test` (bunfig.toml): make sure the test database exists, is migrated, and starts empty.
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { env } from "../src/env";

const url = new URL(env.DATABASE_URL);
const dbName = url.pathname.slice(1);
if (!dbName.endsWith("_test")) {
  throw new Error(`Refusing to run tests against "${dbName}": DATABASE_URL must point at a *_test database`);
}

const adminUrl = new URL(url);
adminUrl.pathname = "/postgres";
const admin = new SQL(adminUrl.toString());
const [exists] = await admin`select 1 from pg_database where datname = ${dbName}`;
if (!exists) await admin.unsafe(`create database "${dbName}"`);
await admin.close();

const sql = new SQL(env.DATABASE_URL);
await migrate(drizzle({ client: sql }), { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
await sql`truncate "user" cascade`; // cascades to sessions, accounts, forms, versions, responses
await sql.close();
