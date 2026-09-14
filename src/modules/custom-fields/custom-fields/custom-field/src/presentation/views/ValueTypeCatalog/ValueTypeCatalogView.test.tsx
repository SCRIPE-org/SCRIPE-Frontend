// ValueTypeCatalogView -- Wave 5 row 5.4
//
// No I18nProvider is wrapped here on purpose -- useI18n()'s own SSR/no-
// provider fallback (i18n-provider.tsx) returns `t: (key) => key` and
// `direction: "rtl"`, which is exactly the "raw i18n key" testing
// convention this module's sibling files already use (see
// InlineAddCustomFieldDialog.nonModal.test.tsx's own comment on the same
// fallback). That fallback's `direction: "rtl"` default is also put to
// direct use below: it proves the table wrapper reads a REAL direction
// value from useI18n() rather than a hardcoded "ltr", without needing a
// mock for this file. ValueTypeCatalogView.ltrDirection.test.tsx is the
// explicit-mock counterpart proving the wrapper is not hardcoded "rtl"
// either.
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ValueTypeCatalogView } from "./ValueTypeCatalogView";
import { ALL_VALUE_TYPES, VALUE_TYPE_CATALOG } from "../../registries/valueTypeRegistry";

describe("ValueTypeCatalogView", () => {
  it("renders one row per known value type, plus the header row", () => {
    render(<ValueTypeCatalogView />);
    const table = screen.getByRole("table");
    const rows = screen.getAllByRole("row");
    // 1 header row + one row per ALL_VALUE_TYPES entry -- not hardcoded to
    // 17, so this test does not itself become a count to maintain if the
    // catalog ever grows (formatCustomFieldValue.test.tsx's
    // `toHaveLength(17)` is the dedicated pin for that).
    expect(rows).toHaveLength(ALL_VALUE_TYPES.length + 1);
    expect(table).toBeInTheDocument();
  });

  it("exposes all 5 column headers via getByRole, not getByLabelText", () => {
    render(<ValueTypeCatalogView />);
    expect(
      screen.getByRole("columnheader", { name: "customField.valueTypeCatalog.columns.valueType" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "customField.valueTypeCatalog.columns.description" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "customField.valueTypeCatalog.columns.placeholder" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "customField.valueTypeCatalog.columns.options" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "customField.valueTypeCatalog.columns.validator" })
    ).toBeInTheDocument();
  });

  it("renders every value type's own label as a row cell reachable via getByRole", () => {
    render(<ValueTypeCatalogView />);
    for (const type of ALL_VALUE_TYPES) {
      const entry = VALUE_TYPE_CATALOG[type];
      // Raw-key fallback: t(entry.labelKey) === entry.labelKey with no
      // provider, e.g. "customField.valueTypes.longText".
      expect(screen.getByRole("cell", { name: entry.labelKey })).toBeInTheDocument();
    }
  });

  it("marks Validator = Yes for Text only, No for every other of the 17 types", () => {
    render(<ValueTypeCatalogView />);
    const rows = screen.getAllByRole("row").slice(1); // drop header row
    expect(rows).toHaveLength(ALL_VALUE_TYPES.length);

    const textRowIndex = ALL_VALUE_TYPES.indexOf("Text");
    expect(textRowIndex).toBeGreaterThanOrEqual(0);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td");
      const validatorCell = cells[4];
      expect(validatorCell.textContent).toBe(index === textRowIndex ? "common.yes" : "common.no");
    });
  });

  it("marks Options List = Yes exactly for the types VALUE_TYPE_CATALOG itself flags hasOptions", () => {
    render(<ValueTypeCatalogView />);
    const rows = screen.getAllByRole("row").slice(1);

    rows.forEach((row, index) => {
      const type = ALL_VALUE_TYPES[index];
      const cells = row.querySelectorAll("td");
      const optionsCell = cells[3];
      expect(optionsCell.textContent).toBe(
        VALUE_TYPE_CATALOG[type].hasOptions ? "common.yes" : "common.no"
      );
    });
  });

  it("marks Placeholder = Yes exactly for the types VALUE_TYPE_CATALOG itself flags hasPlaceholder", () => {
    render(<ValueTypeCatalogView />);
    const rows = screen.getAllByRole("row").slice(1);

    rows.forEach((row, index) => {
      const type = ALL_VALUE_TYPES[index];
      const cells = row.querySelectorAll("td");
      const placeholderCell = cells[2];
      expect(placeholderCell.textContent).toBe(
        VALUE_TYPE_CATALOG[type].hasPlaceholder ? "common.yes" : "common.no"
      );
    });
  });

  it("never renders any entitlement/availability text -- the design spec's own column was deliberately omitted (ruling R5: no backing data on either side)", () => {
    const { container } = render(<ValueTypeCatalogView />);
    expect(container.textContent).not.toMatch(/entitlement/i);
    expect(container.textContent).not.toMatch(/RequiredFeature/i);
  });

  it("links back to the /custom-fields definitions screen", () => {
    render(<ValueTypeCatalogView />);
    const backLink = screen.getByRole("link", { name: "common.back" });
    expect(backLink).toHaveAttribute("href", "/custom-fields");
  });

  it("shows total/withOptions/withValidator counts derived from the real catalog, not hardcoded", () => {
    const { container } = render(<ValueTypeCatalogView />);
    const values = Array.from(container.querySelectorAll("dd")).map((el) => el.textContent);
    const expectedWithOptions = ALL_VALUE_TYPES.filter(
      (type) => VALUE_TYPE_CATALOG[type].hasOptions
    ).length;
    expect(values).toEqual([String(ALL_VALUE_TYPES.length), String(expectedWithOptions), "1"]);
  });

  it("wraps the table in the direction useI18n() actually reports -- 'rtl' here, since no I18nProvider is mounted and the fallback defaults to rtl", () => {
    const { container } = render(<ValueTypeCatalogView />);
    const table = screen.getByRole("table");
    expect(table.closest("div[dir]")).toHaveAttribute("dir", "rtl");
    // Sanity: the table itself, not some unrelated ancestor, carries the dir.
    expect(container.querySelector('div[dir="rtl"] table')).toBe(table);
  });
});
