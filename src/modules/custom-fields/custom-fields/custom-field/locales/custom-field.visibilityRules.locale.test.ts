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

describe("Custom Field Visibility Rules Locale Parity", () => {
  it("en and ar both define visibilityRules namespace with matching keys", () => {
    expect((en as any).customField.visibilityRules).toBeDefined();
    expect((ar as any).customField.visibilityRules).toBeDefined();

    const enKeys = collectLeafKeys((en as any).customField.visibilityRules).sort();
    const arKeys = collectLeafKeys((ar as any).customField.visibilityRules).sort();

    expect(enKeys).toEqual(arKeys);
  });

  it("all Arabic visibilityRules strings contain genuine Arabic characters", () => {
    const arVisibility = (ar as any).customField.visibilityRules;
    const arKeys = collectLeafKeys(arVisibility);

    for (const key of arKeys) {
      const val = getByPath(arVisibility, key);
      if (typeof val === "string") {
        expect(val).toMatch(ARABIC_CHAR);
      }
    }
  });

  it("en includes descriptions of monotone logic and acyclicity", () => {
    const enRules = (en as any).customField.visibilityRules;
    expect(enRules.andLogicNote).toMatch(/all.*satisfied/i);
    expect(enRules.requiredFieldDescription).toMatch(/required field/i);
  });
});
