// InlineAddCustomFieldDialog -- non-modal container (Wave 5 row 5.6)
//
// Design spec §5.4 / pre-plan analysis R2, R3: this dialog used to be a bare
// `<Dialog>` (Radix default `modal={true}`) that nested inside every host
// record form it mounts in -- ~30 GenericCrudView screens via
// CustomFieldsExtensionTrigger, plus the bespoke screens that consume
// InlineAddTrigger directly. A `modal={true}` dialog trapping focus inside
// itself, nested inside ANY other open dialog (modal or not), is the literal
// nested-modal defect: Radix's `hideOthers()` (aria-hidden package) marks
// everything outside the outer dialog's own subtree `aria-hidden="true"`,
// and a modal FocusScope with `loop:true`+`trapped:true` fights any focus
// that lands outside its own subtree -- see core/ui/__tests__/dialog.test.tsx's
// own comment ("Radix marks every sibling of the modal aria-hidden=\"true\"
// while open") for the same mechanism verified against this codebase's own
// Dialog wrapper.
//
// This file proves the fix at the unit level: the panel now renders through
// a `modal={false}` Sheet with a single hand-rolled scrim (NonModalScrim),
// not Radix's own overlay -- and proves it BEHAVIORALLY (DOM structure /
// reachability), not merely that the component mounts.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { InlineAddCustomFieldDialog } from "./InlineAddCustomFieldDialog";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: vi.fn(),
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

describe("InlineAddCustomFieldDialog — non-modal container", () => {
  beforeEach(() => {
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: { create: vi.fn().mockResolvedValue({ id: "x" }) },
    } as any);
  });

  it("exposes exactly one overlay/scrim when open — the hand-rolled NonModalScrim, not a second Radix-rendered one", () => {
    const { baseElement } = render(
      <InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />
    );

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    // overlayScrimClasses (core/ui/dialog.tsx) always includes "bg-scrim" —
    // shared verbatim by NonModalScrim and by Radix's own SheetOverlay, so
    // this selector catches BOTH: if `modal` had regressed back to `true`
    // (or been left unset, Radix's default), SheetOverlay would render a
    // real overlay of its own IN ADDITION to NonModalScrim (which always
    // renders unconditionally), and this count would be 2, not 1.
    const scrims = baseElement.querySelectorAll(".bg-scrim");
    expect(scrims).toHaveLength(1);
  });

  it("renders the panel with an accessible dialog role and name reachable via getByRole, not a raw getByLabelText probe", () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" entityDisplayName="Administrators" onCreated={vi.fn()} />);

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    // Falls back to the raw i18n key outside a real I18nProvider (see the
    // sibling test file's own note on this), but the important structural
    // fact this proves is that the accessible name resolves at all — Radix
    // wires SheetTitle to the panel via aria-labelledby regardless of the
    // fallback string's content.
    expect(
      screen.getByRole("dialog", { name: "customField.inlineAdd.dialogTitle" })
    ).toBeInTheDocument();
  });

  it("does not hide the rest of the document (no hideOthers side effect) — a sibling outside the panel stays reachable via getByRole while it is open", () => {
    render(
      <div>
        <button type="button">host-form-cancel</button>
        <InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />
      </div>
    );

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    // If this Sheet were still modal (Radix default / a regression back to
    // `<Dialog>`), DialogContentModal's `hideOthers(content)` would mark
    // every sibling outside the panel's own DOM subtree aria-hidden="true",
    // and getByRole (which respects the accessibility tree) would fail to
    // find this button even though it is still live DOM — exactly the
    // mechanism core/ui/__tests__/dialog.test.tsx's own comment documents.
    expect(screen.getByRole("button", { name: "host-form-cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "customField.inlineAdd.dialogTitle" })
    ).toBeInTheDocument();
  });

  it("lets focus reach a field inside the panel without being pulled back by a competing focus trap", () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    const keyInput = screen.getByLabelText("customField.fields.key");
    keyInput.focus();

    // A trapped FocusScope (Radix modal mode) intercepts focusin events that
    // land outside its own boundary and redirects them back inside itself.
    // Here there is no trap on this panel (modal={false} => trapFocus:
    // false), so a direct .focus() call sticks.
    expect(document.activeElement).toBe(keyInput);
  });
});
