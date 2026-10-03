// Typed RPC client for the frontend (imported as "api/client"). Type-only import of the app: nothing
// server-side is bundled into the web app, just `hono/client` + the route types.
import { hc } from "hono/client";
import type { AppType } from "./app";

export type { AppType };

// Instantiating the client type once here (instead of `hc<AppType>` at every call site) keeps the
// editor fast as routes grow — Hono's recommended setup for monorepos.
const client = hc<AppType>("");
export type Client = typeof client;
export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args);
