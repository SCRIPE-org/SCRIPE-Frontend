import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CRM_ROOT = path.resolve(__dirname, "..");

function walkFiles(dir: string, filterFn: (fullPath: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, filterFn));
    } else if (filterFn(full)) {
      results.push(full);
    }
  }
  return results;
}

const isProdSourceFile = (p: string) =>
  (p.endsWith(".ts") || p.endsWith(".tsx")) &&
  !p.endsWith(".test.ts") &&
  !p.endsWith(".test.tsx") &&
  !p.includes(`${path.sep}__tests__${path.sep}`);

describe("CRM Frontend Localization & Architecture Gate", () => {
  const presentationFiles = walkFiles(
    CRM_ROOT,
    (p) => isProdSourceFile(p) && p.includes(`${path.sep}presentation${path.sep}`),
  );

  it("prohibits raw Arabic Unicode [\\u0600-\\u06FF] inside any presentation file", () => {
    const violations: string[] = [];
    const arabicRegex = /[\u0600-\u06FF]/;
    for (const file of presentationFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (arabicRegex.test(content)) {
        violations.push(path.relative(CRM_ROOT, file));
      }
    }
    expect(violations).toEqual([]);
  });

  it("prohibits inline isAr / isRtl static string ternaries inside presentation files", () => {
    const violations: string[] = [];
    const inlineStringTernaryRegex = /\b(?:isAr|isRtl)\s*\?\s*["'`]([^"'`]+)["'`]\s*:\s*["'`]([^"'`]+)["'`]/g;
    const allowedTokens = new Set(["rtl", "ltr", "ar", "en", "ar-SA", "en-US", "ar-EG", "right", "left"]);
    for (const file of presentationFiles) {
      const content = fs.readFileSync(file, "utf8");
      for (const match of content.matchAll(inlineStringTernaryRegex)) {
        const [, a, b] = match;
        if (!allowedTokens.has(a) && !allowedTokens.has(b)) {
          violations.push(`${path.relative(CRM_ROOT, file)}: ${match[0]}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("prohibits native <table> HTML elements in presentation components (must use @core/ui/table)", () => {
    const violations: string[] = [];
    const nativeTableRegex = /<table[\s>]/;
    for (const file of presentationFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (nativeTableRegex.test(content)) {
        violations.push(path.relative(CRM_ROOT, file));
      }
    }
    expect(violations).toEqual([]);
  });

  it("enforces FE-025 hook naming convention (use*.ts) for all files in presentation/viewmodels", () => {
    const viewModelFiles = walkFiles(
      CRM_ROOT,
      (p) => isProdSourceFile(p) && p.includes(`${path.sep}presentation${path.sep}viewmodels${path.sep}`),
    );
    const violations = viewModelFiles
      .filter((f) => !path.basename(f).startsWith("use"))
      .map((f) => path.relative(CRM_ROOT, f));
    expect(violations).toEqual([]);
  });

  it("enforces <= 300 lines per production source file and < 200 lines per workflow .tsx component", () => {
    const allProdFiles = walkFiles(
      CRM_ROOT,
      (p) => isProdSourceFile(p) && !p.includes(`${path.sep}locales${path.sep}`),
    );
    const over300: string[] = [];
    const over200Workflow: string[] = [];

    for (const file of allProdFiles) {
      const lineCount = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
      if (lineCount > 300) {
        over300.push(`${path.relative(CRM_ROOT, file)} (${lineCount} lines)`);
      }
      if (
        file.endsWith(".tsx") &&
        file.includes(`${path.sep}components${path.sep}workflow${path.sep}`) &&
        lineCount >= 200
      ) {
        over200Workflow.push(`${path.relative(CRM_ROOT, file)} (${lineCount} lines)`);
      }
    }

    expect(over300).toEqual([]);
    expect(over200Workflow).toEqual([]);
  });

  it("enforces single exported React component per .tsx file across CRM presentation", () => {
    const tsxFiles = presentationFiles.filter((p) => p.endsWith(".tsx"));
    const multiComponentFiles: string[] = [];
    const exportedComponentRegex =
      /^\s*export\s+(?:default\s+)?function\s+([A-Z][a-z][A-Za-z0-9_]*)|^\s*export\s+const\s+([A-Z][a-z][A-Za-z0-9_]*)\s*(?::[^=]+)?=/gm;

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf8");
      const matches = [...content.matchAll(exportedComponentRegex)].map(
        (m) => m[1] || m[2],
      );
      if (matches.length > 1) {
        multiComponentFiles.push(`${path.relative(CRM_ROOT, file)} -> [${matches.join(", ")}]`);
      }
    }

    expect(multiComponentFiles).toEqual([]);
  });

  it("keeps Zustand stores in presentation/stores without re-export shims in presentation/viewmodels", () => {
    const viewmodelStoreShims = presentationFiles.filter(
      (p) =>
        p.includes(`${path.sep}viewmodels${path.sep}`) &&
        p.endsWith("Store.ts"),
    );
    expect(viewmodelStoreShims).toEqual([]);
  });
});

