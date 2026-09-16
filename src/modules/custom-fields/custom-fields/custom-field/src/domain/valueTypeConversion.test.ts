import { describe, it, expect } from "vitest";
import {
  classifyValueTypeConversion,
  isConversionLossy,
  LOSSLESS_CONVERSIONS,
  LOSSY_CONVERSIONS,
} from "./valueTypeConversion";

describe("valueTypeConversion", () => {
  describe("classifyValueTypeConversion", () => {
    it("returns NoChange when source and target types are identical", () => {
      expect(classifyValueTypeConversion("Text", "Text")).toBe("NoChange");
      expect(classifyValueTypeConversion("Number", "Number")).toBe("NoChange");
      expect(classifyValueTypeConversion("Date", "Date")).toBe("NoChange");
    });

    it("identifies Lossless conversions correctly", () => {
      expect(classifyValueTypeConversion("Text", "LongText")).toBe("Lossless");
      expect(classifyValueTypeConversion("Number", "Text")).toBe("Lossless");
      expect(classifyValueTypeConversion("Number", "LongText")).toBe("Lossless");
      expect(classifyValueTypeConversion("Percent", "Text")).toBe("Lossless");
      expect(classifyValueTypeConversion("Rating", "Text")).toBe("Lossless");
      expect(classifyValueTypeConversion("Percent", "Number")).toBe("Lossless");
      expect(classifyValueTypeConversion("Rating", "Number")).toBe("Lossless");
    });

    it("identifies Lossy conversions correctly", () => {
      expect(classifyValueTypeConversion("LongText", "Text")).toBe("Lossy");
      expect(classifyValueTypeConversion("Text", "Number")).toBe("Lossy");
    });

    it("identifies Impossible conversions for unsupported pairs", () => {
      expect(classifyValueTypeConversion("Date", "Number")).toBe("Impossible");
      expect(classifyValueTypeConversion("Checkbox", "Text")).toBe("Impossible");
      expect(classifyValueTypeConversion("Select", "MultiSelect")).toBe("Impossible");
      expect(classifyValueTypeConversion("File", "Text")).toBe("Impossible");
      expect(classifyValueTypeConversion("EntityReference", "Number")).toBe("Impossible");
    });
  });

  describe("isConversionLossy", () => {
    it("returns true only for Lossy conversions", () => {
      expect(isConversionLossy("LongText", "Text")).toBe(true);
      expect(isConversionLossy("Text", "Number")).toBe(true);
      expect(isConversionLossy("Text", "LongText")).toBe(false);
      expect(isConversionLossy("Text", "Text")).toBe(false);
      expect(isConversionLossy("Date", "Number")).toBe(false);
    });
  });

  describe("Catalog definitions", () => {
    it("has 7 lossless conversion rules", () => {
      expect(LOSSLESS_CONVERSIONS.length).toBe(7);
    });

    it("has 2 lossy conversion rules", () => {
      expect(LOSSY_CONVERSIONS.length).toBe(2);
    });
  });
});
