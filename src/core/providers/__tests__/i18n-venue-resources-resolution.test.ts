import { describe, expect, it } from "vitest";
import { allModulesAr, allModulesEn } from "@core/locales/module-registry";

describe("i18n — Venue resources namespace resolution", () => {
  it("eagerly registers the English resources locale", () => {
    expect(allModulesEn).toHaveProperty("resources.title", "Courts & Spaces");
  });

  it("eagerly registers the Arabic resources locale", () => {
    expect(allModulesAr).toHaveProperty("resources.title", "الملاعب والمساحات");
  });
});
