import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";

// GenericForm calls usePermissions(), which throws outside a PermissionProvider
// — same mock shape as generic-crud-view.customfields.test.tsx. Every other hook
// it uses (useSettings, useI18n) has a no-provider fallback.
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

// Radix primitives inside the form observe their trigger; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "isMarketingOnly", label: "Marketing only", type: "switch", defaultValue: false },
];

describe("GenericForm re-initialisation effect", () => {
  // The features catalog drawer renders <GenericForm fields onSubmit onCancel />
  // with no initialValues. The default parameter then produced a fresh {} on
  // every render, the re-init effect depended on it, and the effect always
  // returned a new formData object — a self-feeding loop that blew React's
  // nested-update limit ("Maximum update depth exceeded", React error #185).
  it("mounts without initialValues and does not loop", () => {
    expect(() =>
      render(<GenericForm fields={FIELDS} onSubmit={async () => {}} onCancel={() => {}} />)
    ).not.toThrow();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  // Same loop, reached from the other side: a caller that rebuilds its field
  // array on every render must not be able to drive the effect either.
  it("mounts with an unstable fields array and does not loop", () => {
    expect(() =>
      render(
        <GenericForm
          fields={[...FIELDS]}
          initialValues={{}}
          onSubmit={async () => {}}
          onCancel={() => {}}
        />
      )
    ).not.toThrow();
  });
});
