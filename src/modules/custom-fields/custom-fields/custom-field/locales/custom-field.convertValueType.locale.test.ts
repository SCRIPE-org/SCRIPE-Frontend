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

describe("Custom Field Value-Type Conversion Locale Parity", () => {
  it("en and ar both define convertValueType namespace with matching keys", () => {
    expect((en as any).customField.convertValueType).toBeDefined();
    expect((ar as any).customField.convertValueType).toBeDefined();

    const enKeys = collectLeafKeys((en as any).customField.convertValueType).sort();
    const arKeys = collectLeafKeys((ar as any).customField.convertValueType).sort();

    expect(enKeys).toEqual(arKeys);
  });

  it("all Arabic convertValueType strings contain genuine Arabic characters", () => {
    const arConversion = (ar as any).customField.convertValueType;
    const arKeys = collectLeafKeys(arConversion);

    for (const key of arKeys) {
      const val = getByPath(arConversion, key);
      if (typeof val === "string") {
        expect(val).toMatch(ARABIC_CHAR);
      }
    }
  });

  it("en includes descriptions of lossless, lossy, and dry-run refusals", () => {
    const enConversion = (en as any).customField.convertValueType;
    expect(enConversion.notes.lossless).toMatch(/lossless/i);
    expect(enConversion.notes.lossy).toMatch(/loss/i);
    expect(enConversion.result.refusedDescription).toMatch(/refused/i);
  });
});
