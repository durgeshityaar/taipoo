import { expect } from "bun:test";
import { testClient } from "hono/testing";
import app from "../src/app";
import { env } from "../src/env";

// Typed RPC client for the whole API, optionally carrying a session cookie.
export const client = (cookie?: string) =>
  testClient(app, undefined, undefined, { headers: { Origin: env.WEB_URL, ...(cookie ? { Cookie: cookie } : {}) } }).api;

// Signs up a fresh user (unique email) and returns a client with their session, so tests never share data.
export async function signedInClient() {
  const res = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: env.WEB_URL },
    body: JSON.stringify({ name: "Test", email: `u-${crypto.randomUUID()}@test.local`, password: "password1234" }),
  });
  expect(res.status).toBe(200);
  return client(res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; "));
}

export const sampleDraft = {
  title: "Feedback",
  blocks: [{ id: "q1", type: "short_text" as const, title: "Your name?", required: true }],
};
