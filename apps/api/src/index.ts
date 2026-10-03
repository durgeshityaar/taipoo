import app from "./app";
import { sql } from "./db/client";
import { env } from "./env";
import { log } from "./lib/logger";

// Errors outside a request never reach app.onError. They're bugs: log them, then crash and let the
// process manager restart us (state may be corrupt, so carrying on is worse).
function crash(kind: string, reason: unknown) {
  log.fatal({ err: reason instanceof Error ? reason : new Error(String(reason)) }, kind);
  process.exit(1);
}
process.on("uncaughtException", (err) => crash("uncaught exception", err));
process.on("unhandledRejection", (reason) => crash("unhandled rejection", reason));

const server = Bun.serve({ port: env.PORT, fetch: app.fetch });
log.info(`API listening on ${server.url}`);

async function shutdown(signal: string) {
  log.info(`${signal} received, shutting down`);
  await server.stop(); // finish in-flight requests, refuse new ones
  await sql.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
