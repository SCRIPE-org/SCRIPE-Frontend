import { describe, expect, it } from "vitest";
import { en } from "./operations-calendar.en";
import { ar } from "./operations-calendar.ar";

function entries(value: unknown, prefix = ""): Array<[string, string]> {
  if (!value || typeof value !== "object") {
    return [[prefix, String(value)]];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    entries(child, prefix ? `${prefix}.${key}` : key)
  );
}

function placeholders(text: string): string[] {
  return Array.from(text.matchAll(/\{\{(\w+)\}\}/g), (match) => match[1]).sort();
}

describe("Operations Calendar locales", () => {
  it("keeps English and Arabic key parity with native Arabic content", () => {
    const enEntries = entries(en).sort(([a], [b]) => a.localeCompare(b));
    const arEntries = entries(ar).sort(([a], [b]) => a.localeCompare(b));

    expect(arEntries.map(([key]) => key)).toEqual(enEntries.map(([key]) => key));
    expect(JSON.stringify(ar)).toMatch(/[\u0600-\u06ff]/);

    for (const [key, value] of arEntries) {
      expect(value.trim().length, `Empty AR value for ${key}`).toBeGreaterThan(0);
      expect(value, `Expected Arabic characters for ${key}`).toMatch(/[\u0600-\u06ff]/);
    }
  });

  it("prevents leading '+ ' prefixes in action labels (Double Plus trap)", () => {
    for (const [key, value] of [...entries(en), ...entries(ar)]) {
      expect(value.trimStart().startsWith("+ "), `Leading '+ ' found in ${key}`).toBe(false);
    }
  });

  it("keeps interpolation placeholders identical between English and Arabic", () => {
    const arMap = new Map(entries(ar));
    for (const [key, enVal] of entries(en)) {
      const arVal = arMap.get(key) ?? "";
      expect(placeholders(arVal), `Placeholder mismatch on ${key}`).toEqual(placeholders(enVal));
    }
  });

  it("owns only the operationsCalendar namespace without cross-module pollution", () => {
    expect(Object.keys(en)).toEqual(["operationsCalendar"]);
    expect(Object.keys(ar)).toEqual(["operationsCalendar"]);
  });
});
