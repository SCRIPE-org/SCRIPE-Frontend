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

  it("enforces <= 260 lines per production source file across CRM & Kanban and < 200 lines per workflow .tsx component", () => {
    const kanbanRoot = path.resolve(CRM_ROOT, "../../core/crud/kanban");
    const srcRoot = path.resolve(CRM_ROOT, "../..");
    const includeFilter = (p: string) => isProdSourceFile(p) && !p.includes(`${path.sep}locales${path.sep}`);
    const allProdFiles = [
      ...walkFiles(CRM_ROOT, includeFilter),
      ...walkFiles(kanbanRoot, includeFilter),
    ];
    const over260: string[] = [];
    const over200Workflow: string[] = [];

    for (const file of allProdFiles) {
      const lineCount = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
      if (lineCount > 260) {
        over260.push(`${path.relative(srcRoot, file)} (${lineCount} lines)`);
      }
      if (
        file.endsWith(".tsx") &&
        (file.includes(`${path.sep}components${path.sep}workflow${path.sep}`) ||
          file.includes(`${path.sep}workflows${path.sep}src${path.sep}presentation${path.sep}`)) &&
        lineCount >= 200
      ) {
        over200Workflow.push(`${path.relative(CRM_ROOT, file)} (${lineCount} lines)`);
      }
      if (file.endsWith("View.tsx") && lineCount > 200) {
        over200Workflow.push(`${path.relative(CRM_ROOT, file)} (${lineCount} lines > 200 View limit)`);
      }
    }

    expect(over260).toEqual([]);
    expect(over200Workflow).toEqual([]);
  });

  it("enforces FE-030..FE-033, zero any types, zero useCrmSettingsStore, and repository-mapper contracts across CRM", () => {
    const allProdFiles = walkFiles(
      CRM_ROOT,
      (p) => isProdSourceFile(p) && !p.includes(`${path.sep}locales${path.sep}`),
    );
    const persistViolations: string[] = [];
    const anyViolations: string[] = [];
    const legacyStoreViolations: string[] = [];
    const memberDepViolations: string[] = [];
    const mapperViolations: string[] = [];

    for (const file of allProdFiles) {
      const content = fs.readFileSync(file, "utf8");
      const rel = path.relative(CRM_ROOT, file).replace(/\\/g, "/");

      if (/\bpersist\s*\(/.test(content) && !rel.endsWith("useCrmClientPrefsStore.ts")) {
        persistViolations.push(rel);
      }
      if (/useCrmSettingsStore/.test(content)) {
        legacyStoreViolations.push(rel);
      }
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (!/^\s*(?:\/\/|\/?\*)/.test(line) && /:\s*any\b|\bas\s+any\b/.test(line)) {
          anyViolations.push(`${rel}:${idx + 1}`);
        }
      });
      if (rel.includes("presentation/")) {
        const hookDepRegex = /\b(?:useEffect|useCallback|useMemo)\s*\([\s\S]*?,\s*\[([^\]]*)\]\s*\)/g;
        for (const m of content.matchAll(hookDepRegex)) {
          const deps = m[1];
          if (/\b[a-zA-Z_$][\w$]*\??\.[a-zA-Z_$][\w$]*/.test(deps)) {
            memberDepViolations.push(`${rel}: [${deps.trim()}]`);
          }
        }
      }
      if (rel.includes("data/repositories/") && /Repository\.ts$/.test(rel) && !/Mapper\.toEntity/.test(content)) {
        mapperViolations.push(rel);
      }
    }

    expect(persistViolations).toEqual([]);
    expect(legacyStoreViolations).toEqual([]);
    expect(anyViolations).toEqual([]);
    expect(memberDepViolations).toEqual([]);
    expect(mapperViolations).toEqual([]);
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

  it("enforces Light-theme Signal Lime contrast, semantic tokens, and safe overlay stacking across CRM", () => {
    const allProdFiles = walkFiles(
      CRM_ROOT,
      (p) => isProdSourceFile(p) && !p.includes(`${path.sep}locales${path.sep}`),
    );
    const violations: string[] = [];

    for (const file of allProdFiles) {
      const content = fs.readFileSync(file, "utf8");
      const rel = path.relative(CRM_ROOT, file);
      if (/bg-nx-accent(?![-a-z])[^\n"'`]*text-nx-on-fill|text-nx-on-fill[^\n"'`]*bg-nx-accent(?![-a-z])/.test(content)) {
        violations.push(`${rel}: bg-nx-accent paired with text-nx-on-fill`);
      }
      if (/\brounded-nx-xs\b/.test(content)) {
        violations.push(`${rel}: undefined rounded-nx-xs token`);
      }
      if (/\btext-warning\b/.test(content)) {
        violations.push(`${rel}: low-contrast text-warning token`);
      }
      if (/\bz-\[100\d{2}\]/.test(content)) {
        violations.push(`${rel}: hardcoded z-[100xx] overlay override`);
      }
      if (/<section\b[^>]*role=["']region["']/.test(content)) {
        violations.push(`${rel}: redundant role="region" on semantic <section>`);
      }
      if (rel.endsWith("crmWorkflowColorPalette.ts") && /badgeClass:[^\n]*text-(?:zinc|blue|sky|cyan|teal|green|lime|orange|red|pink|fuchsia|purple|violet|indigo)-(?:400|500)\b/.test(content)) {
        violations.push(`${rel}: pale Light-theme badgeClass foreground color`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces 'use client' in presentation, V1 in endpoints, zero NODE_ENV test bypasses, and DI boundary purity", () => {
    const allProdFiles = walkFiles(
      CRM_ROOT,
      (p) => isProdSourceFile(p) && !p.includes(`${path.sep}locales${path.sep}`),
    );
    const missingUseClient: string[] = [];
    const hardcodedEndpoints: string[] = [];
    const testEnvBypasses: string[] = [];
    const illegalDiCalls: string[] = [];

    for (const file of allProdFiles) {
      const content = fs.readFileSync(file, "utf8");
      const rel = path.relative(CRM_ROOT, file).replace(/\\/g, "/");

      if (rel.includes("presentation/") && !rel.endsWith("/index.ts")) {
        if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
          missingUseClient.push(rel);
        }
      }
      if (rel.endsWith(".endpoints.ts")) {
        if (!content.includes("V1") || /["']\/v1\//.test(content)) {
          hardcodedEndpoints.push(rel);
        }
      }
      if (/\bNODE_ENV\b/.test(content)) {
        testEnvBypasses.push(rel);
      }
      if (
        content.includes("getCrmContainer") &&
        !rel.endsWith("di.ts") &&
        !rel.includes("presentation/viewmodels/") &&
        !rel.includes("presentation/stores/")
      ) {
        illegalDiCalls.push(rel);
      }
    }

    expect(missingUseClient).toEqual([]);
    expect(hardcodedEndpoints).toEqual([]);
    expect(testEnvBypasses).toEqual([]);
    expect(illegalDiCalls).toEqual([]);
  });
});

