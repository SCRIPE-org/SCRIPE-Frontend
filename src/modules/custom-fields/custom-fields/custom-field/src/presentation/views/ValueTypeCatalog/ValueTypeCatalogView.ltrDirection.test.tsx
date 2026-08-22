// ValueTypeCatalogView -- explicit LTR direction (Wave 5 row 5.4)
//
// ValueTypeCatalogView.test.tsx proves the table wrapper carries dir="rtl"
// under useI18n()'s own no-provider fallback. That alone would still pass
// if the wrapper's dir were hardcoded to "rtl" instead of genuinely reading
// useI18n().direction. This file mocks an explicit "ltr" direction (an
// inline object literal, so there is no vi.mock hoisting-order issue with
// an imported value) to prove the wrapper is reactive, not hardcoded either
// way.
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));

import { ValueTypeCatalogView } from "./ValueTypeCatalogView";

describe("ValueTypeCatalogView — explicit LTR direction", () => {
  it("wraps the table in dir='ltr' when useI18n() reports ltr", () => {
    render(<ValueTypeCatalogView />);
    const table = screen.getByRole("table");
    expect(table.closest("div[dir]")).toHaveAttribute("dir", "ltr");
  });
});
