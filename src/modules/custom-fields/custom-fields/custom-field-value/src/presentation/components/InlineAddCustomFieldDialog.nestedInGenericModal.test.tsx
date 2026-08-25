// InlineAddCustomFieldDialog nested inside GenericModal -- the real,
// production nesting shape (Wave 5 row 5.6, "systemic" defect, pre-plan
// analysis R2).
//
// generic-crud-view.tsx:1090-1168/1171-1229 mount exactly this pair for
// EVERY CrudConfig with an entityTypeKey (~30 screens across Identity, HRMS,
// PartyKernel, Entitlements, Communication, Compliance, Facility and
// WorkManagement): a GenericModal-hosted create/edit form with
// InlineAddCustomFieldDialog's trigger inside it. generic-crud-view.customfields.test.tsx
// covers that wiring but always fakes InlineAddTrigger away (`() => null` or
// a plain stand-in button) — this file is the one place both REAL
// components render together, nested, exactly as production does, so the
// fix is proven against the actual defect shape rather than against a stand-in.
//
// GenericModal's own modal={false} choice is untouched by this task (see
// generic-modal.tsx:148-156) and is not being re-tested here; what's under
// test is that InlineAddCustomFieldDialog's own panel — now also
// modal={false} — layers on top of it without a competing focus trap or a
// hideOthers conflict.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GenericModal } from "@core/crud/components/generic-modal";
import { InlineAddCustomFieldDialog } from "./InlineAddCustomFieldDialog";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: vi.fn(),
}));
vi.mock("../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions", () => ({
  useFieldGroupOptions: vi.fn(() => ({ options: [], isLoading: false, isError: false })),
}));
vi.mock("../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes", () => ({
  useEntityLookupAvailableTypes: vi.fn(() => ({ types: [], isLoading: false, isError: false, isEmpty: true })),
}));
// i18n-provider is deliberately NOT mocked here (matching
// InlineAddCustomFieldDialog.test.tsx's own convention) -- its real
// out-of-provider fallback both returns the raw translation key from t() and
// supplies safe no-op isModuleLoaded/markModuleLoaded/registerBothLanguages,
// which useModuleLocales (called internally by InlineAddCustomFieldDialog)
// needs and a hand-rolled partial mock would have to reconstruct anyway.
vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ modalStyle: "centered" }),
}));
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn().mockReturnValue(true),
}));
vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: vi.fn(() => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  })),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: vi.fn(() => ({
    currentTenant: null,
    isInTenantWorld: false,
    breadcrumbs: [],
    enterTenantWorld: vi.fn(),
    exitTenantWorld: vi.fn(),
    navigateToBreadcrumb: vi.fn(),
    canEnterTenantWorld: false,
  })),
}));

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

function renderNested() {
  return render(
    <GenericModal open title="crud.modal.createTitle" onOpenChange={vi.fn()}>
      <div>host-form-field</div>
      <InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />
    </GenericModal>
  );
}

describe("InlineAddCustomFieldDialog nested inside GenericModal (real production shape)", () => {
  beforeEach(() => {
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: { create: vi.fn().mockResolvedValue({ id: "x" }) },
    } as any);
  });

  it("keeps the outer GenericModal reachable via getByRole after opening the inline-add panel — no hideOthers conflict either direction", () => {
    renderNested();

    expect(screen.getByRole("dialog", { name: "crud.modal.createTitle" })).toBeInTheDocument();
    expect(screen.getByText("host-form-field")).toBeInTheDocument();

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    // Both dialogs simultaneously reachable via getByRole (which respects
    // aria-hidden) is the proof that neither's hideOthers()/FocusScope side
    // effect is fighting the other -- the exact shape the design spec's
    // screenshot named: "Add custom field — Administrators opened on top of
    // Add Administrators".
    expect(screen.getByRole("dialog", { name: "crud.modal.createTitle" })).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "customField.inlineAdd.dialogTitle" })
    ).toBeInTheDocument();
    expect(screen.getByText("host-form-field")).toBeInTheDocument();
  });

  it("lets focus move into the inline-add panel's first field without a competing trap pulling it back to the host form", () => {
    renderNested();

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    const keyInput = screen.getByLabelText("customField.fields.key");
    keyInput.focus();

    expect(document.activeElement).toBe(keyInput);
  });

  it("renders one scrim per open non-modal layer (GenericModal's own plus the inline-add panel's) — never a Radix-native second overlay layered on top", () => {
    const { baseElement } = renderNested();

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    // Both GenericModal (generic-modal.tsx) and InlineAddCustomFieldDialog's
    // Sheet share the exact same overlayScrimClasses recipe (core/ui/dialog.tsx),
    // which always includes "bg-scrim" -- two hand-rolled scrims (one per
    // open layer) is the correct, expected count. A regression that left
    // either dialog modal (Radix default `true`) would add a THIRD, Radix-
    // rendered overlay on top of these two.
    expect(baseElement.querySelectorAll(".bg-scrim")).toHaveLength(2);
  });
});
