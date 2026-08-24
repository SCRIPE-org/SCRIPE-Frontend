import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn().mockReturnValue(true),
}));
// GenericForm calls usePermissions() (the plural, RBAC-context hook) directly
// and unconditionally — it throws outside a PermissionProvider, same reason
// generic-crud-view.customfields.test.tsx mocks this module. Wrapped in
// vi.fn() (not a bare arrow) so isSuperAdmin can be overridden per-test via
// mockReturnValueOnce, same pattern as usePermission (singular) above.
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
// The component computes isPlatformContext from useTenantContext() too —
// same throws-outside-a-provider reason as usePermissions above. Default
// isInTenantWorld: false pairs with isSuperAdmin: true above to give every
// existing test below true platform context unless overridden.
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

// jsdom has no ResizeObserver — FIELDS includes a "select" field (Type), and
// Radix's Select primitive calls it (useSize) on mount. Without this stub the
// second test throws before the dialog ever renders.
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

describe("InlineAddCustomFieldDialog", () => {
  const createMock = vi.fn().mockResolvedValue({ id: "new-def-id" });

  beforeEach(() => {
    createMock.mockClear();
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: { create: createMock },
    } as any);
  });

  it("does not render the trigger when the user lacks custom-fields.create", async () => {
    const { usePermission } = await import("@core/hooks/use-permission");
    vi.mocked(usePermission).mockReturnValueOnce(false);

    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);

    // Outside a loaded I18nProvider, t() returns the raw key (same convention
    // used throughout this codebase's component tests, e.g. "common.save"
    // below) — this dialog's trigger renders "customField.inlineAdd.trigger"
    // verbatim, not real English text.
    expect(screen.queryByText("customField.inlineAdd.trigger")).not.toBeInTheDocument();
  });

  it("opens a dialog, submits with entityTypeKey pre-set, and calls onCreated on success", async () => {
    const onCreated = vi.fn();
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={onCreated} />);

    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    fireEvent.change(screen.getByLabelText("customField.fields.key"), {
      target: { value: "nationality" },
    });
    fireEvent.change(screen.getByLabelText("customField.fields.labelEn"), {
      target: { value: "Nationality" },
    });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ entityTypeKey: "party.person", key: "nationality", labelEn: "Nationality" })
      )
    );
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });

  it("submits placeholder text for a Text-type field", async () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    fireEvent.change(screen.getByLabelText("customField.fields.key"), { target: { value: "nickname" } });
    fireEvent.change(screen.getByLabelText("customField.fields.labelEn"), { target: { value: "Nickname" } });
    fireEvent.change(screen.getByLabelText("customField.fields.placeholderEn"), {
      target: { value: "e.g. Junior" },
    });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ placeholderEn: "e.g. Junior" }))
    );
  });

  describe("scope choices", () => {
    const defaultPermissions = {
      permissions: [],
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      canAccessPage: () => true,
      roleNames: [],
      isSuperAdmin: true,
    };
    const defaultTenantContext = {
      currentTenant: null,
      isInTenantWorld: false,
      breadcrumbs: [],
      enterTenantWorld: vi.fn(),
      exitTenantWorld: vi.fn(),
      navigateToBreadcrumb: vi.fn(),
      canEnterTenantWorld: false,
    };

    afterEach(async () => {
      const { usePermissions } = await import("@core/providers/permission-provider");
      const { useTenantContext } = await import("@core/providers/tenant-context-provider");
      vi.mocked(usePermissions).mockReturnValue(defaultPermissions as any);
      vi.mocked(useTenantContext).mockReturnValue(defaultTenantContext as any);
    });

    it("offers isGlobal switch in pure platform context, defaulting safely to false", () => {
      render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
      fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

      const isGlobalSwitch = screen.getByRole("switch", { name: "customField.fields.isGlobal" });
      expect(isGlobalSwitch).not.toBeChecked();
    });

    it("submits isGlobal:true when isGlobal switch is toggled", async () => {
      render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
      fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

      const isGlobalSwitch = screen.getByRole("switch", { name: "customField.fields.isGlobal" });
      fireEvent.click(isGlobalSwitch);
      expect(isGlobalSwitch).toBeChecked();

      fireEvent.change(screen.getByLabelText("customField.fields.key"), { target: { value: "vip" } });
      fireEvent.change(screen.getByLabelText("customField.fields.labelEn"), { target: { value: "VIP" } });
      fireEvent.click(screen.getByText("common.save"));

      await waitFor(() =>
        expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ isGlobal: true }))
      );
    });

    it("locks tenant-context authors to tenant scope and hides isGlobal switch submitting isGlobal:false", async () => {
      const { useTenantContext } = await import("@core/providers/tenant-context-provider");
      vi.mocked(useTenantContext).mockReturnValue({
        ...defaultTenantContext,
        currentTenant: { id: "tenant-1", name: "Acme" },
        isInTenantWorld: true,
      } as any);

      render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
      fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

      expect(screen.queryByRole("switch", { name: "customField.fields.isGlobal" })).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("customField.fields.key"), { target: { value: "vip" } });
      fireEvent.change(screen.getByLabelText("customField.fields.labelEn"), { target: { value: "VIP" } });
      fireEvent.click(screen.getByText("common.save"));

      await waitFor(() =>
        expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ isGlobal: false }))
      );
    });
  });

  describe("dialog title's {entity} interpolation source", () => {
    // The rest of this file's assertions rely on t() falling back to the
    // bare key outside a real I18nProvider — which proves the KEY is right,
    // but t() ignores its params object on that fallback path (see
    // i18n-provider.tsx's reportMissingKey), so it can't also prove
    // entityDisplayName is the value actually reaching the {entity}
    // interpolation slot. This block mocks useI18n directly and asserts on
    // t's call arguments instead, which is what a fallback-key assertion
    // structurally cannot show — needed because useModuleLocales (called
    // internally by the component) also calls useI18n(), so the mock must
    // supply its full shape, not just t.
    afterEach(() => {
      vi.doUnmock("@core/providers/i18n-provider");
    });

    it("passes entityDisplayName as {entity} when given, and the raw entityTypeKey as {entity} when not", async () => {
      const tSpy = vi.fn((key: string) => key);
      vi.doMock("@core/providers/i18n-provider", () => ({
        useI18n: () => ({
          t: tSpy,
          language: "en",
          direction: "ltr",
          setLanguage: vi.fn(),
          registerBothLanguages: vi.fn(),
          markModuleLoaded: vi.fn(),
          isModuleLoaded: () => true,
        }),
      }));
      vi.resetModules();
      const { InlineAddCustomFieldDialog: FreshDialog } = await import(
        "./InlineAddCustomFieldDialog"
      );

      const { unmount } = render(
        <FreshDialog
          entityTypeKey="party.person"
          entityDisplayName="Party People"
          onCreated={vi.fn()}
        />
      );
      fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));
      expect(tSpy).toHaveBeenCalledWith("customField.inlineAdd.dialogTitle", {
        entity: "Party People",
      });
      unmount();

      tSpy.mockClear();
      render(<FreshDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
      fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));
      expect(tSpy).toHaveBeenCalledWith("customField.inlineAdd.dialogTitle", {
        entity: "party.person",
      });
    });
  });
});
