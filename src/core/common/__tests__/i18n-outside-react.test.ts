import { describe, it, expect, beforeEach, vi } from "vitest";
import { translateCore } from "@core/common/i18n-outside-react";
import { STORAGE_KEYS } from "@core/config/storage-keys";

/**
 * translateCore is the non-hook translation lookup used by code that cannot call
 * useI18n() (api.service.ts, use-enhanced-toast.ts's module-level `toast` singleton)
 * because it isn't a React component. These tests pin down its language-switching,
 * interpolation, and missing-key behavior against the REAL core locale dictionaries
 * (not mocks) so a future edit to en.ts/ar.ts that removes a key these call sites
 * depend on fails loudly here instead of silently degrading to English/the bare key
 * in production.
 *
 * NOTE: vitest.setup.ts replaces window.localStorage with a vi.fn()-based mock that
 * has no real backing store, so getItem must be driven via mockReturnValue rather
 * than a real setItem/getItem round-trip.
 */
function setStoredLanguage(value: string | null) {
  vi.mocked(localStorage.getItem).mockImplementation((key: string) =>
    key === STORAGE_KEYS.LANGUAGE ? value : null
  );
}

describe("translateCore", () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReset();
  });

  it("defaults to English when no language preference is stored", () => {
    setStoredLanguage(null);
    expect(translateCore("errors.network.timeout")).toBe("Request timed out. Please try again.");
  });

  it("reads Arabic once STORAGE_KEYS.LANGUAGE is set to ar", () => {
    setStoredLanguage("ar");
    expect(translateCore("errors.network.timeout")).toBe(
      "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى."
    );
  });

  it("falls back to English for any value other than ar", () => {
    setStoredLanguage("fr");
    expect(translateCore("errors.auth.forbidden")).toBe(
      "You do not have permission to perform this action."
    );
  });

  it("resolves the new item-3/item-4 keys added for api.service.ts", () => {
    setStoredLanguage("en");
    expect(translateCore("errors.auth.forbidden")).toBe(
      "You do not have permission to perform this action."
    );
    expect(translateCore("errors.auth.tenantContextForbidden")).toBe(
      "You do not have permission to switch tenant context."
    );
    expect(translateCore("errors.network.unknown")).toBe("An unknown error occurred.");
  });

  it("interpolates {param} placeholders", () => {
    setStoredLanguage("en");
    expect(translateCore("common.operationToast.successTitle", { operation: "Delete" })).toBe(
      "Delete Successful"
    );
  });

  it("interpolates {{param}} placeholders", () => {
    setStoredLanguage("en");
    expect(translateCore("common.welcomeBack", { name: "Sam" })).toBe("Welcome back, Sam");
  });

  it("returns the bare key on a miss instead of throwing", () => {
    setStoredLanguage("en");
    expect(translateCore("errors.thisKeyDoesNotExist")).toBe("errors.thisKeyDoesNotExist");
  });

  it("returns the bare key when the path resolves to a non-string (object) node", () => {
    setStoredLanguage("en");
    expect(translateCore("errors.network")).toBe("errors.network");
  });
});
