/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { en } from "./custom-field.en";
import { ar } from "./custom-field.ar";

const ARABIC_CHAR = /[؀-ۿ]/;

function collectLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...collectLeafKeys(v as Record<string, unknown>, nextKey));
    } else {
      keys.push(nextKey);
    }
  }
  return keys;
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: any, part) => (acc ? acc[part] : undefined), obj);
}

describe("Custom Field Definition Versions & Drafts Locale Parity", () => {
  it("en and ar both define versions namespace with matching keys", () => {
    expect((en as any).customField.versions).toBeDefined();
    expect((ar as any).customField.versions).toBeDefined();

    const enKeys = collectLeafKeys((en as any).customField.versions).sort();
    const arKeys = collectLeafKeys((ar as any).customField.versions).sort();

    expect(enKeys).toEqual(arKeys);
  });

  it("all Arabic versions strings contain genuine Arabic characters", () => {
    const arVersions = (ar as any).customField.versions;
    const arKeys = collectLeafKeys(arVersions);

    for (const key of arKeys) {
      const val = getByPath(arVersions, key);
      if (typeof val === "string") {
        expect(val).toMatch(ARABIC_CHAR);
      }
    }
  });

  it("en includes descriptions of draft, publish, and discard lifecycle", () => {
    const enVersions = (en as any).customField.versions;
    expect(enVersions.publishDraftButton).toMatch(/publish/i);
    expect(enVersions.discardDraftButton).toMatch(/discard/i);
    expect(enVersions.createDraftButton).toMatch(/create draft/i);
  });
});
