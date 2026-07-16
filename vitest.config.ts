import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
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
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "src/core/ui/components/**", // Shadcn components
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
