/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { navigationData } from "../data/navigation";
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
  const parts = key.split(".");
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

const docsRepo = new DocsRepository();

describe("Docs Navigation and Page Completeness", () => {
  const allItems: { category: string; id: string; titleKey: string; slug?: string }[] = [];

  function collectItems(catName: string, items: any[]) {
    for (const item of items) {
      allItems.push({
        category: catName,
        id: item.id,
        titleKey: item.titleKey,
        slug: item.slug,
      });
      if (item.children && Array.isArray(item.children)) {
        collectItems(catName, item.children);
      }
    }
  }

  for (const cat of navigationData) {
    collectItems(cat.id, cat.items);
  }

  it("all navigation slugs resolve to registered pages in DocsRepository", () => {
    const missingPages: string[] = [];
    for (const item of allItems) {
      if (item.slug) {
        const page = docsRepo.getPage(item.slug);
        if (!page) {
          missingPages.push(`${item.category} -> ${item.id} (slug: ${item.slug})`);
        }
      }
    }
    expect(missingPages).toEqual([]);
  });

  it("all navigation titleKeys resolve in all 7 languages", () => {
    const registries = {
      en: allDocsEn,
      ar: allDocsAr,
      de: allDocsDe,
      es: allDocsEs,
      fr: allDocsFr,
      ru: allDocsRu,
      zh: allDocsZh,
    };

    const missingTranslations: string[] = [];

    // Also check category titleKeys
    for (const cat of navigationData) {
      for (const [lang, reg] of Object.entries(registries)) {
        const val = resolveKey(reg, cat.titleKey);
        if (!val || val.trim() === "" || val === cat.titleKey) {
          missingTranslations.push(`Category ${cat.id} [${lang}]: missing ${cat.titleKey}`);
        }
      }
    }

    for (const item of allItems) {
      for (const [lang, reg] of Object.entries(registries)) {
        const val = resolveKey(reg, item.titleKey);
        if (!val || val.trim() === "" || val === item.titleKey) {
          missingTranslations.push(
            `Item ${item.id} [${lang}]: missing ${item.titleKey}`
          );
        }
      }
    }

    expect(missingTranslations).toEqual([]);
  });
});
