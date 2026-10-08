/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { DocsRepository } from "../data/repositories/DocsRepository";
import "../data/content/registry";
import {
  allDocsEn,
  allDocsAr,
  allDocsDe,
  allDocsEs,
  allDocsFr,
  allDocsRu,
  allDocsZh,
} from "./docs-registry";

function resolveKey(obj: Record<string, any>, key: string): string | undefined {
  if (!key) return undefined;
  const parts = key.split(".");
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

const docsRepo = new DocsRepository();

describe("Deep Audit of All Page Content Keys Across All 7 Languages", () => {
  const registries = {
    en: allDocsEn,
    ar: allDocsAr,
    de: allDocsDe,
    es: allDocsEs,
    fr: allDocsFr,
    ru: allDocsRu,
    zh: allDocsZh,
  };

  const allPages = docsRepo.getAllPages();

  it("checks total registered pages count and sections", () => {
    console.log(`Total registered pages: ${allPages.length}`);
    expect(allPages.length).toBeGreaterThan(50);
  });

  it("checks that every page titleKey and descriptionKey resolves in all 7 languages", () => {
    const missing: string[] = [];

    for (const page of allPages) {
      for (const [lang, reg] of Object.entries(registries)) {
        if (page.titleKey) {
          const val = resolveKey(reg, page.titleKey);
          if (!val || val.trim() === "" || val === page.titleKey) {
            missing.push(`Page [${page.slug}] [${lang}] titleKey missing: ${page.titleKey}`);
          }
        }
        if (page.descriptionKey) {
          const val = resolveKey(reg, page.descriptionKey);
          if (!val || val.trim() === "" || val === page.descriptionKey) {
            missing.push(`Page [${page.slug}] [${lang}] descriptionKey missing: ${page.descriptionKey}`);
          }
        }
      }
    }

    if (missing.length > 0) {
      console.log(`Missing page headers count: ${missing.length}`);
      console.log(missing.slice(0, 30));
    }
    expect(missing).toEqual([]);
  });

  it("checks section content keys for all pages across all 7 languages", () => {
    const missingContent: string[] = [];

    function isDottedKey(str: any): boolean {
      if (typeof str !== "string") return false;
      const prefixes = [
        "modules.",
        "commercial.",
        "apiReference.",
        "infrastructure.",
        "features.",
        "security.",
        "common.",
        "getStarted.",
        "architecture.",
        "tutorials.",
        "frontend.",
      ];
      return prefixes.some((p) => str.startsWith(p));
    }

    function collectKeysFromSection(sec: any, keys: string[]) {
      if (sec.titleKey) keys.push(sec.titleKey);
      if (sec.contentKey) keys.push(sec.contentKey);
      if (sec.descriptionKey) keys.push(sec.descriptionKey);
      if (sec.introKey) keys.push(sec.introKey);
      if (sec.subtitleKey) keys.push(sec.subtitleKey);
      if (sec.badgeKey) keys.push(sec.badgeKey);
      if (sec.primaryCtaKey) keys.push(sec.primaryCtaKey);
      if (sec.secondaryCtaKey) keys.push(sec.secondaryCtaKey);
      if (sec.captionKey) keys.push(sec.captionKey);

      // Flowchart nodes and connections
      if (sec.nodes && Array.isArray(sec.nodes)) {
        for (const node of sec.nodes) {
          if (node.labelKey) keys.push(node.labelKey);
          if (node.descriptionKey) keys.push(node.descriptionKey);
        }
      }
      if (sec.connections && Array.isArray(sec.connections)) {
        for (const conn of sec.connections) {
          if (conn.labelKey) keys.push(conn.labelKey);
        }
      }

      // API Table endpoints
      if (sec.endpoints && Array.isArray(sec.endpoints)) {
        for (const ep of sec.endpoints) {
          if (ep.descriptionKey) keys.push(ep.descriptionKey);
        }
      }

      // Step Guides
      if (sec.steps && Array.isArray(sec.steps)) {
        for (const step of sec.steps) {
          if (step.titleKey) keys.push(step.titleKey);
          if (step.contentKey) keys.push(step.contentKey);
          if (step.descriptionKey) keys.push(step.descriptionKey);
        }
      }

      // Tables (headers and cell rows)
      if (sec.headers && Array.isArray(sec.headers)) {
        for (const h of sec.headers) {
          if (isDottedKey(h)) keys.push(h);
        }
      }
      if (sec.rows && Array.isArray(sec.rows)) {
        for (const row of sec.rows) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              if (isDottedKey(cell)) keys.push(cell);
            }
          }
        }
      }

      // Feature grids and comparison items
      if (sec.items && Array.isArray(sec.items)) {
        for (const item of sec.items) {
          if (item.titleKey) keys.push(item.titleKey);
          if (item.descriptionKey) keys.push(item.descriptionKey);
          if (item.contentKey) keys.push(item.contentKey);
        }
      }
      if (sec.columns && Array.isArray(sec.columns)) {
        for (const col of sec.columns) {
          if (col.titleKey) keys.push(col.titleKey);
          if (col.descriptionKey) keys.push(col.descriptionKey);
        }
      }

      // Recursive sub-sections
      if (sec.sections && Array.isArray(sec.sections)) {
        for (const sub of sec.sections) {
          collectKeysFromSection(sub, keys);
        }
      }
    }

    for (const page of allPages) {
      const pageKeys: string[] = [];
      for (const sec of page.sections || []) {
        collectKeysFromSection(sec, pageKeys);
      }

      for (const key of pageKeys) {
        // Skip literal strings that are not registered translation key namespaces
        if (!isDottedKey(key)) continue;

        for (const [lang, reg] of Object.entries(registries)) {
          const val = resolveKey(reg, key);
          if (!val || val.trim() === "" || val === key) {
            missingContent.push(`Page [${page.slug}] [${lang}] section key missing: ${key}`);
          }
        }
      }
    }

    if (missingContent.length > 0) {
      console.log(`Total missing section keys across all languages: ${missingContent.length}`);
      console.log("Sample missing keys (first 50):", missingContent.slice(0, 50));
    }

    expect(missingContent).toEqual([]);
  });
});
