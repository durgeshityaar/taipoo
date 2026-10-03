import type { Server } from "bun";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { AppError } from "./errors";

// Fixed-window limiter kept in this process's memory.
// ponytail: per-process state; with more than one API instance each has its own counts → move to Bun.redis.
type Window = { count: number; resetAt: number };

export function rateLimit(opts: { max: number; windowMs: number; key: (c: Context) => string }) {
  const windows = new Map<string, Window>();

  return createMiddleware(async (c, next) => {
    const now = Date.now();
    if (windows.size > 10_000) for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k); // bound memory

    const key = opts.key(c);
    const w = windows.get(key);
    if (!w || w.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + opts.windowMs });
    } else if (++w.count > opts.max) {
      c.header("Retry-After", String(Math.ceil((w.resetAt - now) / 1000)));
      throw new AppError(429, "rate_limited", "Too many requests, try again shortly");
    }
    await next();
  });
}

// Client IP from the socket. Bun.serve passes its server as Hono's `c.env` (in-process test requests
// have none → "unknown"). Behind a reverse proxy this is the proxy's IP: read X-Forwarded-For from the
// trusted proxy instead (never trust that header without one — clients can set it).
export const clientIp = (c: Context) => (c.env as Server<unknown> | undefined)?.requestIP?.(c.req.raw)?.address ?? "unknown";
