import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SudoCancelledError, useSudoStore } from "@core/store/useSudoStore";
import { SetRestrictionsDialog } from "./SetRestrictionsDialog";
import {
  formatRestrictableResourceLabel,
  resolveRestrictableResource,
} from "./restriction-resource-label";

const mockVmState = vi.hoisted(() => ({
  availablePermissions: [] as Array<{
    code: string;
    resource: string;
    platformOnly?: boolean;
  }>,
  isLoadingPermissions: false,
  canReadCustomFields: true,
}));

const mockCustomFieldKeys = vi.hoisted(() => ({
  keys: [] as Array<{ key: string; labelEn: string; isRequired: boolean }>,
  isLoading: false,
  isError: false,
  isTruncated: false,
  isAvailable: true,
  lastRequestedResource: [] as Array<string | undefined>,
  lastEnabledFlag: [] as boolean[],
}));

const translations: Record<string, string> = {
  "common.cancel": "Cancel",
  "nav.admins": "Admins",
  "nav.routeSegments.opportunities": "Opportunities",
  "userGroups.noRestrictions": "No restrictions configured for this group.",
  "userGroups.restrictionsTab.manageRestrictions": "Manage Restrictions",
  "userGroups.restrictionsTab.manageRestrictionsDesc": "Configure field-level restrictions",
  "userGroups.restrictionsTab.additiveNotice": "Field restrictions apply additively.",
  "userGroups.restrictionsTab.addPermission": "Add Resource",
  "userGroups.restrictionsTab.permissionPlaceholder": "e.g. crm.opportunities",
  "userGroups.restrictionsTab.alreadyAdded": "This resource already has a restriction entry.",
  "userGroups.restrictionsTab.removeRestriction": "Remove Restriction",
  "userGroups.restrictionsTab.fieldPlaceholder": "Add field name...",
  "userGroups.restrictionsTab.addField": "Add Field",
  "userGroups.restrictionsTab.removeField": "Remove {{field}}",
  "userGroups.restrictionsTab.requiredBadge": "Required",
  "userGroups.restrictionsTab.requiredFieldAlert":
    "Field \"{{field}}\" is required, so restricting it will be rejected on save. Make it optional first or remove it here.",
  "userGroups.restrictionsTab.duplicateField":
    "Field \"{{field}}\" is already restricted for this resource.",
  "userGroups.restrictionsTab.suggestionsTruncated": "Showing first set of suggestions.",
  "userGroups.restrictionsTab.suggestionsUnavailable": "Suggestions unavailable.",
  "userGroups.restrictionsTab.suggestionsNotConfigured":
    "No custom-field schema is registered for this resource yet. Type any exact API field key directly.",
  "userGroups.restrictionsTab.loadingSuggestions": "Loading custom field keys...",
  "userGroups.restrictionsTab.noFieldsYet": "No restricted fields added yet.",
  "userGroups.restrictionsTab.customFieldHint": "Pick a custom field suggestion below.",
  "userGroups.restrictionsTab.saveRestrictions": "Save Restrictions",
};

function translate(key: string, params?: Record<string, string | number>): string {
  let out = translations[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      out = out.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return out;
}

vi.mock("../viewmodels/useSetRestrictionsViewModel", () => ({
  useSetRestrictionsViewModel: () => ({
    t: translate,
    availablePermissions: mockVmState.availablePermissions,
    isLoadingPermissions: mockVmState.isLoadingPermissions,
    canReadCustomFields: mockVmState.canReadCustomFields,
  }),
}));

vi.mock("@core/hooks/use-restrictable-custom-field-keys", () => ({
  useRestrictableCustomFieldKeys: (
    resource: string | undefined,
    args?: { enabled?: boolean }
  ) => {
    mockCustomFieldKeys.lastRequestedResource.push(resource);
    mockCustomFieldKeys.lastEnabledFlag.push(Boolean(args?.enabled));
    return {
      keys: mockCustomFieldKeys.keys,
      isLoading: mockCustomFieldKeys.isLoading,
      isError: mockCustomFieldKeys.isError,
      isTruncated: mockCustomFieldKeys.isTruncated,
      isAvailable: mockCustomFieldKeys.isAvailable,
    };
  },
}));

vi.mock("@core/crud/components/generic-modal", () => ({
  GenericModal: ({
    open,
    onOpenChange,
    title,
    children,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    children: ReactNode;
  }) =>
    open ? (
      <dialog open aria-label={title}>
        <h2>{title}</h2>
        <button type="button" data-testid="modal-dismiss-trigger" onClick={() => onOpenChange?.(false)}>
          Dismiss
        </button>
        {children}
      </dialog>
    ) : null,
}));

vi.mock("@core/crud/components/generic-select", () => ({
  GenericSelect: ({
    value,
    onValueChange,
    options,
    "aria-labelledby": ariaLabelledBy,
  }: {
    value?: string;
    onValueChange?: (val: string) => void;
    options: Array<{ value: string; label: string }>;
    "aria-labelledby"?: string;
  }) => (
    <select
      data-testid="resource-select"
      aria-labelledby={ariaLabelledBy}
      value={value ?? ""}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("restriction-resource-label & SetRestrictionsDialog", () => {
  beforeEach(() => {
    mockVmState.availablePermissions = [
      { code: "crm.opportunities.view", resource: "crm.opportunities" },
      { code: "crm.opportunities.update", resource: "crm.opportunities" },
      { code: "admins.view", resource: "admins" },
    ];
    mockVmState.canReadCustomFields = true;
    mockCustomFieldKeys.keys = [
      { key: "estimatedAmount", labelEn: "Estimated Amount", isRequired: true },
      { key: "internalNotes", labelEn: "Internal Notes", isRequired: false },
    ];
    mockCustomFieldKeys.isLoading = false;
    mockCustomFieldKeys.isTruncated = false;
    mockCustomFieldKeys.isAvailable = true;
    mockCustomFieldKeys.lastRequestedResource = [];
    mockCustomFieldKeys.lastEnabledFlag = [];
  });

  it("formats dotted resource labels cleanly via i18n or fallback without leaking raw nav.* keys", () => {
    expect(
      resolveRestrictableResource("crm.opportunities.view", mockVmState.availablePermissions)
    ).toBe("crm.opportunities");
    expect(
      resolveRestrictableResource("crm.opportunities", mockVmState.availablePermissions)
    ).toBe("crm.opportunities");
    expect(
      formatRestrictableResourceLabel("crm.opportunities", translate, mockVmState.availablePermissions)
    ).toBe("Opportunities");
    expect(
      formatRestrictableResourceLabel(
        "finance.payment_batches",
        translate,
        mockVmState.availablePermissions
      )
    ).toBe("Finance · Payment Batches");
    expect(
      formatRestrictableResourceLabel(
        "finance.payments",
        (k) => k,
        mockVmState.availablePermissions
      )
    ).toBe("Finance · Payments");
  });

  it("keeps currentRestrictions immutable, blocks case-insensitive duplicate fields, and preserves independent row state", () => {
    const initialRestrictions = [
      { permissionCode: "crm.opportunities", restrictedFields: ["internalNotes"] },
      { permissionCode: "admins", restrictedFields: [] },
    ];
    const onSubmit = vi.fn();

    renderWithQuery(
      <SetRestrictionsDialog
        open
        onOpenChange={vi.fn()}
        currentRestrictions={initialRestrictions}
        onSubmit={onSubmit}
      />
    );

    // Passes canonical dotted resource to custom-fields suggestion hook
    expect(mockCustomFieldKeys.lastRequestedResource).toContain("crm.opportunities");
    expect(mockCustomFieldKeys.lastRequestedResource).not.toContain("crm");

    // Duplicate field guard (case-insensitive)
    const oppInput = screen.getByTestId("restriction-field-input-crm.opportunities");
    fireEvent.change(oppInput, { target: { value: "INTERNALNOTES" } });
    fireEvent.click(screen.getByTestId("restriction-field-add-crm.opportunities"));
    expect(
      screen.getByText('Field "INTERNALNOTES" is already restricted for this resource.')
    ).toBeTruthy();

    // Add required field via suggestion button and verify warning alert
    fireEvent.click(screen.getByTestId("restriction-suggestion-crm.opportunities-estimatedAmount"));
    expect(
      screen.getByText(
        'Field "estimatedAmount" is required, so restricting it will be rejected on save. Make it optional first or remove it here.'
      )
    ).toBeTruthy();

    // Independent row draft input (admins row stays independent)
    const adminInput = screen.getByTestId("restriction-field-input-admins") as HTMLInputElement;
    fireEvent.change(adminInput, { target: { value: "salary" } });
    expect((screen.getByTestId("restriction-field-input-crm.opportunities") as HTMLInputElement).value).toBe(
      "INTERNALNOTES"
    );
    fireEvent.keyDown(adminInput, { key: "Enter" });

    // Submit updated array while keeping original caller prop intact
    fireEvent.click(screen.getByTestId("save-restrictions-button"));
    expect(onSubmit).toHaveBeenCalledWith([
      {
        permissionCode: "crm.opportunities",
        restrictedFields: ["internalNotes", "estimatedAmount"],
      },
      { permissionCode: "admins", restrictedFields: ["salary"] },
    ]);
    expect(initialRestrictions).toEqual([
      { permissionCode: "crm.opportunities", restrictedFields: ["internalNotes"] },
      { permissionCode: "admins", restrictedFields: [] },
    ]);
  });

  it("displays truncated custom-field suggestion notice and prevents duplicate resources case-insensitively", () => {
    mockCustomFieldKeys.isTruncated = true;

    renderWithQuery(
      <SetRestrictionsDialog
        open
        onOpenChange={vi.fn()}
        currentRestrictions={[
          { permissionCode: "crm.opportunities.view", restrictedFields: [] },
        ]}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("Showing first set of suggestions.")).toBeTruthy();

    const select = screen.getByTestId("resource-select");
    fireEvent.change(select, { target: { value: "crm.opportunities" } });
    fireEvent.click(screen.getByTestId("add-restriction-button"));

    expect(screen.getByText("This resource already has a restriction entry.")).toBeTruthy();
  });

  it("commits comma-separated field drafts on blur and synchronously before Save without losing chips on Sudo rejection", async () => {
    useSudoStore.setState({ modalOpen: false });
    const onSubmit = vi.fn().mockRejectedValueOnce(new SudoCancelledError());
    const onOpenChange = vi.fn();

    renderWithQuery(
      <SetRestrictionsDialog
        open
        onOpenChange={onOpenChange}
        currentRestrictions={[{ permissionCode: "crm.opportunities", restrictedFields: ["internalNotes"] }]}
        onSubmit={onSubmit}
      />
    );

    // Bounded scroll container + pinned footer exist for viewport overflow protection
    expect(screen.getByTestId("restrictions-list-scroll")).toBeTruthy();
    expect(screen.getByTestId("set-restrictions-footer")).toBeTruthy();

    const oppInput = screen.getByTestId("restriction-field-input-crm.opportunities") as HTMLInputElement;
    fireEvent.change(oppInput, { target: { value: "phone, email, INTERNALNOTES" } });
    fireEvent.blur(oppInput);
    expect(oppInput.value).toBe("");

    // Live role="alert" triggers for uncommitted required field in comma-separated draft
    fireEvent.change(oppInput, { target: { value: "estimatedAmount, ssn" } });
    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((el) => el.textContent?.includes('Field "estimatedAmount" is required'))).toBe(true);

    // Save flushes uncommitted draft before calling async onSubmit; Sudo rejection keeps dialog open
    fireEvent.click(screen.getByTestId("save-restrictions-button"));
    await Promise.resolve();

    expect(onSubmit).toHaveBeenCalledWith([
      {
        permissionCode: "crm.opportunities",
        restrictedFields: ["internalNotes", "phone", "email", "estimatedAmount", "ssn"],
      },
    ]);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByText("ssn")).toBeTruthy();

    // Backdrop/escape close is ignored while Sudo step-up modal is open
    useSudoStore.setState({ modalOpen: true });
    fireEvent.click(screen.getByTestId("modal-dismiss-trigger"));
    expect(onOpenChange).not.toHaveBeenCalled();
    useSudoStore.setState({ modalOpen: false });
  });

  it("distinguishes missing custom-field permissions from resources with no configured schema", () => {
    mockVmState.canReadCustomFields = true;
    mockCustomFieldKeys.isAvailable = false;
    mockCustomFieldKeys.keys = [];

    const { rerender } = renderWithQuery(
      <SetRestrictionsDialog
        open
        onOpenChange={vi.fn()}
        currentRestrictions={[{ permissionCode: "finance.payments", restrictedFields: [] }]}
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByText("No custom-field schema is registered for this resource yet. Type any exact API field key directly.")
    ).toBeTruthy();
    expect(screen.queryByText("Suggestions unavailable.")).toBeNull();

    mockVmState.canReadCustomFields = false;
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <SetRestrictionsDialog
          open
          onOpenChange={vi.fn()}
          currentRestrictions={[{ permissionCode: "finance.payments", restrictedFields: [] }]}
          onSubmit={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText("Suggestions unavailable.")).toBeTruthy();
  });
});
