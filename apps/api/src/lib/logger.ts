import pino from "pino";
import { createMiddleware } from "hono/factory";
import type { RequestIdVariables } from "hono/request-id";
import { env } from "../env";

type Colors = Record<"bold" | "red" | "gray" | "magenta", (s: string) => string>;
type SerializedErr = { type?: string; message?: string; stack?: string; code?: string; cause?: SerializedErr };

// "    at fn (/abs/path/file.ts:3:15)" → { fn, file }
const parseStack = (stack: string) =>
  stack.split("\n").flatMap((line) => {
    const m = line.match(/^\s*at (?:(.*?) \()?(\/[^()\s]+:\d+:\d+)\)?\s*$/);
    return m ? [{ fn: m[1] || "<anonymous>", file: m[2]! }] : [];
  });

const shortPath = (file: string) =>
  file.replace(`${process.cwd()}/`, "").replace(/^.*\/node_modules\/(\.bun\/[^/]+\/node_modules\/)?/, "");

// Dev-only error block: type + message, then only our frames (library frames collapsed to a count;
// LOG_STACK=full shows everything).
function formatErr(err: SerializedErr, c: Colors): string[] {
  const frames = parseStack(err.stack ?? "");
  // skip library frames and this file (requestLogger wraps every request, so it's never the cause)
  const ours = frames.filter((f) => !f.file.includes("/node_modules/") && !f.file.startsWith(import.meta.path));
  // error entirely inside a library: show its top frames
  const shown = env.LOG_STACK === "full" ? frames : ours.length ? ours : frames.slice(0, 3);
  const width = Math.max(...shown.map((f) => f.fn.length), 0);
  const lines = [
    `${c.bold(c.red(err.type ?? "Error"))}: ${err.message ?? ""}${err.code ? c.gray(` [${err.code}]`) : ""}`,
    ...shown.map((f) => `  ${c.gray("at")} ${f.fn.padEnd(width)}  ${c.magenta(shortPath(f.file))}`),
  ];
  const hidden = frames.length - shown.length;
  if (hidden > 0) lines.push(c.gray(`  … ${hidden} library frames hidden`));
  if (err.cause) lines.push(c.gray("caused by:"), ...formatErr(err.cause, c).map((l) => `  ${l}`));
  return lines;
}

// JSON lines to stdout; pretty-printed only in development.
const pretty =
  env.NODE_ENV === "development"
    ? (await import("pino-pretty")).default({
        sync: true,
        translateTime: "SYS:HH:MM:ss",
        // request fields and `err` are rendered by messageFormat instead of pino-pretty's key/value dump
        ignore: "pid,hostname,module,reqId,method,path,status,ms,err",
        messageFormat: (entry, messageKey, _level, { colors: c }) => {
          const { method, path, status, ms, err, reqId } = entry as Record<string, any>;
          // short request id ties an error block to its request line when requests interleave
          const tag = reqId ? c.gray(`[${String(reqId).slice(0, 8)}] `) : "";
          if (typeof status !== "number" || typeof ms !== "number") {
            const msg = `${tag}${entry[messageKey]}`;
            return err ? [msg, ...formatErr(err, c).map((l) => `    ${l}`)].join("\n") : msg;
          }
          const statusColor =
            status >= 500
              ? c.red
              : status >= 400
                ? c.yellow
                : status >= 300
                  ? c.cyan
                  : c.green;
          const msColor = ms >= 1000 ? c.red : ms >= 200 ? c.yellow : c.gray;
          return `${tag}${c.bold(String(method))} ${path} ${statusColor(String(status))} ${msColor(`${ms}ms`)}`;
        },
      })
    : undefined;

// errWithCause keeps `cause` as a nested error instead of merging it into message/stack
const options = { level: env.LOG_LEVEL, serializers: { err: pino.stdSerializers.errWithCause } };
export const log = pretty ? pino(options, pretty) : pino(options);

export const requestLogger = createMiddleware<{
  Variables: RequestIdVariables;
}>(async (c, next) => {
  const start = performance.now();
  await next();
  const { method, path } = c.req;
  const status = c.res.status;
  const ms = Math.round(performance.now() - start);
  log[status >= 500 ? "error" : status >= 400 ? "warn" : "info"](
    { reqId: c.get("requestId"), method, path, status, ms },
    `${method} ${path} ${status} ${ms}ms`,
  );
});
