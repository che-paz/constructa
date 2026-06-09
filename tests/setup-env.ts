import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import WebSocket from "ws";

const envPath = path.resolve(process.cwd(), "apps/web/.env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}
