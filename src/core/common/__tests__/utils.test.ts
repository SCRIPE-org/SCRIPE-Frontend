import { describe, it, expect } from "vitest";

/**
 * Utility function tests
 * Demonstrates testing pure functions
 */

// Example utility functions to test
const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("should format USD correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("should handle negative numbers", () => {
      expect(formatCurrency(-100)).toBe("-$100.00");
    });
  });

  describe("truncateText", () => {
    it("should not truncate short text", () => {
      expect(truncateText("Hello", 10)).toBe("Hello");
    });

    it("should truncate long text with ellipsis", () => {
      expect(truncateText("Hello World", 8)).toBe("Hello...");
    });

    it("should handle exact length", () => {
      expect(truncateText("Hello", 5)).toBe("Hello");
    });
  });

  describe("slugify", () => {
    it("should convert to lowercase", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello! World?")).toBe("hello-world");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("Hello   World")).toBe("hello-world");
    });

    it("should trim leading/trailing hyphens", () => {
      expect(slugify(" Hello World ")).toBe("hello-world");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("should reject email without @", () => {
      expect(isValidEmail("testexample.com")).toBe(false);
    });

    it("should reject email without domain", () => {
      expect(isValidEmail("test@")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidEmail("")).toBe(false);
    });
  });
});
