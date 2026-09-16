// GenericForm's GenericSelect branches -- accessible-name coverage (Wave 2
// Step 2.2, Task 7b follow-up). Task 4's review (finding T1) and Task 7b's
// fix (see generic-select.tsx's `aria-label` prop doc comment and
// renderCustomFieldControl.tsx's Select branch) established that
// GenericSelect's trigger is a role="combobox" `<div>`, not a labelable HTML
// element -- a sibling `<Label htmlFor>` never computes an accessible name
// for it. That same root cause existed here too: none of this file's 4
// internal `select`/`searchable-select`/`server-select`/`multi-select`/`tree`
// GenericSelect usages passed `aria-label`, so every GenericForm-based form's
// select-family fields across the app were unlabeled for screen readers.
// These tests assert the real accessible name via `getByRole`'s `name`
// option -- the discriminating check that fails without the `aria-label`
// wiring and passes with it, same technique as
// renderCustomFieldControl.test.tsx.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

// Radix primitives inside GenericSelect observe their trigger; jsdom has no
// ResizeObserver. Needed even for tests that never open the panel (Wave 2
// Step 2.2's renderCustomFieldControl.test.tsx hit the same gap).
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// cmdk calls scrollIntoView on the highlighted row as soon as an opened
// panel's option list mounts; jsdom has no implementation.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const OPTIONS: FieldConfig["options"] = [
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
];

describe("GenericForm GenericSelect accessible names", () => {
  it("labels a type: 'select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "priority", label: "Priority", type: "select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    const trigger = screen.getByRole("combobox", { name: "Priority" });
    expect(trigger).toHaveAttribute("id", "priority");
  });

  it("labels a type: 'searchable-select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "owner", label: "Owner", type: "searchable-select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Owner" })).toBeInTheDocument();
  });

  it("labels a type: 'server-select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "assignee", label: "Assignee", type: "server-select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Assignee" })).toBeInTheDocument();
  });

  it("labels a type: 'multi-select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "tags", label: "Tags", type: "multi-select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Tags" })).toBeInTheDocument();
  });

  it("labels a type: 'tree' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "category", label: "Category", type: "tree", treeData: [{ value: "a", label: "A" }] },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument();
  });

  // Task 7b review, M2: FieldConfig["label"] is optional. Without the
  // `field.label ?? field.name` fallback, an undefined label silently drops
  // the accessible name entirely -- no error, no failing test unless one
  // specifically constructs a labelless field, as this one does.
  it("falls back the accessible name to field.name when label is undefined (M2)", () => {
    const fields: FieldConfig[] = [
      { name: "unlabeled_select", type: "select", options: OPTIONS } as FieldConfig,
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "unlabeled_select" })).toBeInTheDocument();
  });

  it("still opens the panel and reports a selection for a labeled select field (no regression)", () => {
    const onSubmit = vi.fn(async () => {});
    const fields: FieldConfig[] = [
      { name: "priority", label: "Priority", type: "select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Priority" }));
    fireEvent.click(screen.getByRole("option", { name: "High" }));

    expect(screen.getByRole("combobox", { name: "Priority" })).toHaveTextContent("High");
  });
});
