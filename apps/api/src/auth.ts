import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createMiddleware } from "hono/factory";
import { db } from "./db/client";
import { env } from "./env";
import { unauthorized } from "./lib/errors";
import { log } from "./lib/logger";

const authLog = log.child({ module: "better-auth" });

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_URL],
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  logger: {
    // route Better Auth's own logs through pino instead of its console printer
    log: (level, message, ...args) => {
      const err = args.find((a) => a instanceof Error);
      authLog[level](err ? { err } : {}, `[better-auth] ${message}`);
    },
  },
});

export type Session = typeof auth.$Infer.Session;

// Hono env for routes behind requireAuth: c.get("user") / c.get("session") are always set.
export type AuthEnv = { Variables: { user: Session["user"]; session: Session["session"] } };

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) throw unauthorized();
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});
