import { describe, expect, it } from "vitest";
import { en } from "./operations-calendar.en";
import { ar } from "./operations-calendar.ar";

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe("Operations Calendar locales", () => {
  it("keeps English and Arabic key parity with native Arabic content", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
    expect(JSON.stringify(ar)).toMatch(/[\u0600-\u06ff]/);
  });
});
