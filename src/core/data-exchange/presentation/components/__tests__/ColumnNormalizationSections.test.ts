import { describe, expect, it } from "vitest";
import { detectSmartPreset } from "../ColumnNormalizationSections";

describe("detectSmartPreset", () => {
  it("detects Arabic text regardless of data type", () => {
    const res = detectSmartPreset("String", "name", "شركة الأمل للتجارة");
    expect(res).not.toBeNull();
    expect(res?.type).toBe("arabic");
  });

  it("detects date schema types and field keys", () => {
    expect(detectSmartPreset("DateTime", "createdAtUtc", "2026-11-14")?.type).toBe("date");
    expect(detectSmartPreset("Date", "birthDate", "1990-05-20")?.type).toBe("date");
    expect(detectSmartPreset("String", "registrationDate", "2026-01-01")?.type).toBe("date");
  });

  it("detects numeric and financial types", () => {
    expect(detectSmartPreset("Decimal", "amount", "$1,500.00")?.type).toBe("numeric");
    expect(detectSmartPreset("Money", "totalPrice", "500")?.type).toBe("numeric");
    expect(detectSmartPreset("Double", "budget", "1000")?.type).toBe("numeric");
  });

  it("detects phone numbers", () => {
    expect(detectSmartPreset("PhoneNumber", "phone", "01011223344")?.type).toBe("phone");
    expect(detectSmartPreset("String", "mobileNumber", "0501234567")?.type).toBe("phone");
  });

  it("detects email addresses", () => {
    expect(detectSmartPreset("EmailAddress", "email", "john.doe@example.com")?.type).toBe("email");
    expect(detectSmartPreset("String", "contactEmail", "info@scripe.org")?.type).toBe("email");
  });

  it("returns null for generic strings with non-matching keys", () => {
    expect(detectSmartPreset("String", "notes", "Some generic notes")).toBeNull();
  });
});
