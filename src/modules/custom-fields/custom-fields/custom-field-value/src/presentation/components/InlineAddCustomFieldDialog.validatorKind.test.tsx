// InlineAddCustomFieldDialog — validator picker + TRAP 1 write-seam
// normalization (Wave 2 Step 2.5 Task 10)
//
// Mirrors InlineAddCustomFieldDialog.test.tsx's provider-mocking scaffolding
// (this dialog calls usePermissions()/useTenantContext() directly and both
// throw outside their real providers).
//
// TRAP 1 is the load-bearing case here: the validator picker's "None"
// (customField.validatorKindNone) option submits "" when chosen, and
// generic-form.tsx's submitData is a raw spread of formData with no
// per-field coercion beyond dates/numbers, so an unnormalized "" would reach
// customFieldRepository.create verbatim -- which fails the backend's
// nullable ValidatorKind enum's model binding outright, not merely a soft
// validation error. This file proves the dialog's own onSubmit normalizes
// it away.
import { describe, it, expect, vi, beforeEach } from "vitest";
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
// Real useOptionSetViewModel calls useQueryClient() unconditionally, which throws outside a
// QueryClientProvider -- mocked like its two sibling read hooks above rather than wrapping every
// test in this file with a provider it otherwise has no use for.
vi.mock("../../../../option-set/src/presentation/viewmodels/useOptionSetViewModel", () => ({
  useOptionSetViewModel: vi.fn(() => ({ sets: [], isSetsLoading: false, isSetsError: false })),
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

// jsdom has no ResizeObserver -- the validator picker (and Value Type) are
// "select" fields backed by Radix's Select primitive, which calls it on mount.
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom also has no scrollIntoView -- cmdk calls it on the highlighted row's
// layout effect as soon as a panel's option list mounts. Same polyfill
// renderCustomFieldControl.test.tsx already added for its own GenericSelect
// interactions.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

function openDialogWithRequiredFields(key: string, labelEn: string) {
  fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));
  fireEvent.change(screen.getByLabelText("customField.fields.key"), { target: { value: key } });
  fireEvent.change(screen.getByLabelText("customField.fields.labelEn"), { target: { value: labelEn } });
}

describe("InlineAddCustomFieldDialog — validator picker", () => {
  const createMock = vi.fn().mockResolvedValue({ id: "new-def-id" });

  beforeEach(() => {
    createMock.mockClear();
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: { create: createMock },
    } as any);
  });

  it("shows the validator picker by default (valueType defaults to Text) and hides it once a non-Text type is chosen", async () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
    fireEvent.click(screen.getByText("customField.inlineAdd.trigger"));

    expect(screen.getByRole("combobox", { name: "customField.fields.validatorKind" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: "customField.fields.valueType" }));
    fireEvent.click(screen.getByRole("option", { name: "customField.valueTypes.number" }));

    expect(
      screen.queryByRole("combobox", { name: "customField.fields.validatorKind" })
    ).not.toBeInTheDocument();
  });

  it("TRAP 1: explicitly selecting 'No validator' normalizes to null, never submitting an empty string", async () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
    openDialogWithRequiredFields("iban", "IBAN");

    fireEvent.click(screen.getByRole("combobox", { name: "customField.fields.validatorKind" }));
    fireEvent.click(screen.getByRole("option", { name: "customField.validatorKindNone" }));

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    const payload = createMock.mock.calls[0][0];
    expect(payload.validatorKind).not.toBe("");
    expect(payload.validatorKind).toBeNull();
  });

  it("submits a real validatorKind selection untouched, with no validatorParam field for a non-parameterized kind", async () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
    openDialogWithRequiredFields("swift", "SWIFT Code");

    fireEvent.click(screen.getByRole("combobox", { name: "customField.fields.validatorKind" }));
    fireEvent.click(screen.getByRole("option", { name: "customField.validatorKinds.swiftBic" }));

    expect(
      screen.queryByLabelText("customField.fields.validatorParam")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ validatorKind: "SwiftBic" }))
    );
  });

  it("reveals a text validatorParam input with the per-kind hint for a parameterized kind, and submits it", async () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
    openDialogWithRequiredFields("age", "Age Range");

    fireEvent.click(screen.getByRole("combobox", { name: "customField.fields.validatorKind" }));
    fireEvent.click(screen.getByRole("option", { name: "customField.validatorKinds.numericRange" }));

    expect(screen.getByText("customField.validatorKindParamHints.numericRange")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("customField.fields.validatorParam"), {
      target: { value: "1,100" },
    });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ validatorKind: "NumericRange", validatorParam: "1,100" })
      )
    );
  });

  it("renders PostalCode's validatorParam as a closed-set country picker sourced from the catalog (not free text)", async () => {
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);
    openDialogWithRequiredFields("zip", "ZIP");

    fireEvent.click(screen.getByRole("combobox", { name: "customField.fields.validatorKind" }));
    fireEvent.click(screen.getByRole("option", { name: "customField.validatorKinds.postalCode" }));

    fireEvent.click(screen.getByRole("combobox", { name: "customField.fields.validatorParam" }));
    // The 7-country set (R9): AE is deliberately not offered.
    expect(screen.getByRole("option", { name: "EG" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "US" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "AE" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "EG" }));
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ validatorKind: "PostalCode", validatorParam: "EG" })
      )
    );
  });
});
