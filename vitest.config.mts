import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    setupFiles: ["tests/setup-env.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "apps/web"),
      "@constructa/utils": path.resolve(rootDir, "packages/utils/src/index.ts"),
      "@constructa/types": path.resolve(rootDir, "packages/types/src/index.ts"),
      "@constructa/schemas": path.resolve(
        rootDir,
        "packages/schemas/src/index.ts",
      ),
    },
  },
});
