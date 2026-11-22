import { defineConfig } from "vitest/config";
import path from "path";
import fs from "fs";

// Load tsconfig paths programmatically to resolve nested module directories under workspaces
const tsconfigPath = path.resolve(__dirname, "./tsconfig.json");
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
const tsconfigAliases: Record<string, string> = {};

if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
  for (const [key, value] of Object.entries(tsconfig.compilerOptions.paths)) {
    const aliasKey = key.replace(/\/\*$/, "");
    const aliasVal = (value as string[])[0].replace(/\/\*$/, "");
    tsconfigAliases[aliasKey] = path.resolve(__dirname, aliasVal);
  }
}

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist", "e2e"],
    // Vitest's 5000ms default is too tight for this suite's view-level tests,
    // which mount a whole screen (GenericCrudView / 2D Workflow Studio + Radix
    // primitives + react-query) inside jsdom or scan monorepo contract files.
    // Those pass in ~1-7s on an idle machine but reach ~14-19s when all CPU
    // workers run in parallel on Windows, turning correct tests into flakes.
    // Genuinely hung tests still fail, just at 30s instead of 15s.
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "src/core/ui/*.tsx", // Shadcn-pattern primitives live directly here, not in a components/ subdir
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
  resolve: {
    alias: {
      ...tsconfigAliases,
      "@core": path.resolve(__dirname, "./src/core"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
