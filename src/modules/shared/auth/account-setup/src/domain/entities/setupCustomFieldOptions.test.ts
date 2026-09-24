import { describe, it, expect } from "vitest";
import { parseSetupCustomFieldOptions } from "./setupCustomFieldOptions";

describe("parseSetupCustomFieldOptions", () => {
  it("returns empty array when options is null or undefined", () => {
    expect(parseSetupCustomFieldOptions(null)).toEqual([]);
    expect(parseSetupCustomFieldOptions(undefined)).toEqual([]);
    expect(parseSetupCustomFieldOptions("")).toEqual([]);
  });

  it("parses newline-separated options correctly (fixing country delimiter bug)", () => {
    const raw = "Afghanistan\nMasr\nAlbania\nAlgeria";
    const options = parseSetupCustomFieldOptions(raw);
    expect(options).toEqual([
      { value: "Afghanistan", label: "Afghanistan" },
      { value: "Masr", label: "Masr" },
      { value: "Albania", label: "Albania" },
      { value: "Algeria", label: "Algeria" },
    ]);
  });

  it("parses comma-separated options correctly", () => {
    const raw = "Red, Green, Blue";
    const options = parseSetupCustomFieldOptions(raw);
    expect(options).toEqual([
      { value: "Red", label: "Red" },
      { value: "Green", label: "Green" },
      { value: "Blue", label: "Blue" },
    ]);
  });

  it("parses JSON array of strings", () => {
    const raw = JSON.stringify(["Apple", "Banana", "Cherry"]);
    const options = parseSetupCustomFieldOptions(raw);
    expect(options).toEqual([
      { value: "Apple", label: "Apple" },
      { value: "Banana", label: "Banana" },
      { value: "Cherry", label: "Cherry" },
    ]);
  });

  it("parses JSON array of objects", () => {
    const raw = JSON.stringify([
      { value: "tier1", label: "Standard" },
      { value: "tier2", labelEn: "Premium" },
    ]);
    const options = parseSetupCustomFieldOptions(raw);
    expect(options).toEqual([
      { value: "tier1", label: "Standard" },
      { value: "tier2", label: "Premium" },
    ]);
  });

  it("aligns Arabic translations positionally when isRtl is true", () => {
    const en = "Afghanistan\nMasr\nAlbania";
    const ar = "أفغانستان\nمصر\nألبانيا";
    const options = parseSetupCustomFieldOptions(en, ar, true);
    expect(options).toEqual([
      { value: "Afghanistan", label: "أفغانستان" },
      { value: "Masr", label: "مصر" },
      { value: "Albania", label: "ألبانيا" },
    ]);
  });

  it("falls back to English label when Arabic translation for an index is missing", () => {
    const en = "Afghanistan\nMasr\nAlbania";
    const ar = "أفغانستان\nمصر";
    const options = parseSetupCustomFieldOptions(en, ar, true);
    expect(options).toEqual([
      { value: "Afghanistan", label: "أفغانستان" },
      { value: "Masr", label: "مصر" },
      { value: "Albania", label: "Albania" },
    ]);
  });

  it("ignores Arabic options when isRtl is false", () => {
    const en = "Afghanistan\nMasr";
    const ar = "أفغانستان\nمصر";
    const options = parseSetupCustomFieldOptions(en, ar, false);
    expect(options).toEqual([
      { value: "Afghanistan", label: "Afghanistan" },
      { value: "Masr", label: "Masr" },
    ]);
  });
});
