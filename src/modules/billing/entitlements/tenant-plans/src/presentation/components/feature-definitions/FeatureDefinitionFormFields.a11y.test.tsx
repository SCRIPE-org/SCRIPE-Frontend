/* eslint-disable @typescript-eslint/no-explicit-any */
// FeatureDefinitionFormFields -- accessible-name coverage for the Value Type
// GenericSelect (Wave 1 closure, Task 6).
//
// This was the worst of the four sites: `<Label htmlFor="fd-value-type">`
// named an id the GenericSelect never carried at all -- not even a matching-
// but-ineffective id like the other three sites, nothing. This test asserts
// the real accessible name via `getByRole`'s `name` option -- the
// discriminating check that fails without the fix (no accessible name is
// computed at all) and passes with it, same technique as
// generic-form.a11y.test.tsx and renderCustomFieldControl.test.tsx.
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { FeatureDefinitionFormFields } from "./FeatureDefinitionFormFields";

// jsdom has no ResizeObserver -- GenericSelect's trigger tracks its own width
// on mount regardless of open state (same stub as generic-form.a11y.test.tsx).
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

function makeForm(initial: Record<string, string | number | boolean> = {}) {
  const values: Record<string, string | number | boolean> = { ...initial };
  return {
    getValue: (field: string) => values[field],
    setValue: (field: string, value: string | number | boolean) => {
      values[field] = value;
    },
  };
}

describe("FeatureDefinitionFormFields GenericSelect accessible name", () => {
  it("labels the Value Type select via aria-label, reachable by its visible label text", () => {
    render(
      <FeatureDefinitionFormFields
        form={makeForm({ valueType: "Boolean" })}
        mode="create"
        t={(key: string) => key}
        language="en"
      />
    );

    expect(
      screen.getByRole("combobox", { name: "entitlements.featureDefinitions.valueType" })
    ).toBeInTheDocument();
  });

  it("gives the select the id its Label htmlFor names (no more dangling htmlFor)", () => {
    render(
      <FeatureDefinitionFormFields
        form={makeForm({ valueType: "Boolean" })}
        mode="create"
        t={(key: string) => key}
        language="en"
      />
    );

    expect(
      screen.getByRole("combobox", { name: "entitlements.featureDefinitions.valueType" })
    ).toHaveAttribute("id", "fd-value-type");
  });
});
