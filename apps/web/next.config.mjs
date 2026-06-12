import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Monorepo: incluir packages/ en el trace serverless (Vercel)
    outputFileTracingRoot: new URL("../..", import.meta.url).pathname,
  },
};

export default withSerwist(nextConfig);
