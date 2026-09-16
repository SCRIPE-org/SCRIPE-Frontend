// AssignLeadDialog -- accessible-name coverage for the Assign to Admin
// GenericSelect (Wave 1 closure, Task 6).
//
// `<Label htmlFor="assign-admin-id">` names an id the GenericSelect DOES
// carry (`id="assign-admin-id"`), so this site looked correct in review --
// it still computed NO accessible name: the GenericSelect trigger is a
// role="combobox" `<div>`, not a labelable HTML element, so `for`/`htmlFor`
// association is a no-op for it regardless of whether the ids match (see
// generic-select.tsx's own `id` prop doc comment). This test asserts the
// real accessible name via `getByRole`'s `name` option -- the discriminating
// check that fails without `aria-label` and passes with it, same technique
// as generic-form.a11y.test.tsx and renderCustomFieldControl.test.tsx.
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

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

import { AssignLeadDialog } from "./AssignLeadDialog";

function baseProps(overrides: Partial<React.ComponentProps<typeof AssignLeadDialog>> = {}) {
  return {
    open: true,
    lead: null,
    isAssigning: false,
    onClose: vi.fn(),
    onAssign: vi.fn().mockResolvedValue(undefined),
    onSearchAdmins: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("AssignLeadDialog GenericSelect accessible name", () => {
  it("labels the admin select via aria-label, reachable by its visible label text", () => {
    render(<AssignLeadDialog {...baseProps()} />);

    expect(
      screen.getByRole("combobox", { name: "leads.assignDialog.adminId" })
    ).toBeInTheDocument();
  });
});
