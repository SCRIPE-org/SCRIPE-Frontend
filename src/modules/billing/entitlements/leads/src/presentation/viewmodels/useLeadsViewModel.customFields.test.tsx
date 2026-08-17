import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockCreateLead, mockGetAll, mockGetEditionsForConversion, mockSuccessToast, mockErrorToast } =
  vi.hoisted(() => ({
    mockCreateLead: vi.fn(),
    mockGetAll: vi.fn(),
    mockGetEditionsForConversion: vi.fn(),
    mockSuccessToast: vi.fn(),
    mockErrorToast: vi.fn(),
  }));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: Object.assign(vi.fn(), { success: mockSuccessToast, error: mockErrorToast }),
    success: mockSuccessToast,
    error: mockErrorToast,
  }),
}));

vi.mock("@modules/entitlements/di", () => ({
  entitlementsContainer: {
    leadsRepository: {
      createLead: mockCreateLead,
      getAll: mockGetAll,
      getEditionsForConversion: mockGetEditionsForConversion,
    },
  },
}));

import { useLeadsViewModel, LEAD_ENTITY_TYPE_KEY } from "./useLeadsViewModel";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function registerFakeCustomFieldsExtension(
  overrides: Partial<CustomFieldsExtensionApi> = {}
): CustomFieldsExtensionApi {
  const fake: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    ...overrides,
  };
  registerCustomFieldsExtension(fake);
  return fake;
}

const PRIORITY_FIELD = {
  name: "__cf__priority",
  label: "Priority",
  type: "text" as const,
  section: "Custom Fields",
};

const SOURCE_FIELD = {
  name: "__cf__source",
  label: "Source",
  type: "select" as const,
  section: "Custom Fields",
  options: [
    { value: "Referral", label: "Referral" },
    { value: "Website", label: "Website" },
  ],
};

const CREATE_PARAMS = {
  companyName: "Acme Corp",
  contactName: "John Smith",
  email: "john@acme.com",
};

describe("useLeadsViewModel + custom fields", () => {
  beforeEach(() => {
    mockCreateLead.mockReset();
    mockGetAll.mockReset().mockResolvedValue({ items: [], totalCount: 0 });
    mockGetEditionsForConversion.mockReset().mockResolvedValue([]);
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("fetches custom field definitions with no ownerId (leads have no edit form)", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });

    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(LEAD_ENTITY_TYPE_KEY, undefined);
  });

  it("saves custom field values after a successful create, keyed by the new lead id, and only then toasts success", async () => {
    mockCreateLead.mockResolvedValue("new-lead-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.handleCreateLead(CREATE_PARAMS);
    });

    expect(mockCreateLead).toHaveBeenCalledWith(CREATE_PARAMS);
    expect(extension.saveValues).toHaveBeenCalledWith(LEAD_ENTITY_TYPE_KEY, "new-lead-id", {
      priority: "High",
    });
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "leads.createDialog.created" })
    );
    expect(result.current.isCreateDialogOpen).toBe(false);
  });

  it("sends null instead of an empty string when a custom field is cleared", async () => {
    mockCreateLead.mockResolvedValue("new-lead-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
      result.current.updateCustomFieldValue("__cf__priority", "");
    });

    await act(async () => {
      await result.current.handleCreateLead(CREATE_PARAMS);
    });

    expect(extension.saveValues).toHaveBeenCalledWith(LEAD_ENTITY_TYPE_KEY, "new-lead-id", {
      priority: null,
    });
  });

  it("does not call saveValues and still toasts success when there are no custom field definitions", async () => {
    mockCreateLead.mockResolvedValue("new-lead-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([]),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldsLoading).toBe(false));

    await act(async () => {
      await result.current.handleCreateLead(CREATE_PARAMS);
    });

    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "leads.createDialog.created" })
    );
  });

  it("does not toast success and stays open when saving custom field values fails after create succeeds", async () => {
    mockCreateLead.mockResolvedValue("new-lead-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
      saveValues: vi.fn().mockRejectedValue(new Error("boom")),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.handleOpenCreateDialog();
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.handleCreateLead(CREATE_PARAMS);
    });

    expect(mockCreateLead).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "leads.createDialog.customFieldsSaveError" })
    );
    // the lead WAS created, but the dialog stays open -- don't pretend the
    // whole save succeeded, same discipline as useWebhookFormViewModel /
    // useDsrViewModel.
    expect(result.current.isCreateDialogOpen).toBe(true);
  });

  // Final whole-branch review, I3 follow-up: D5's client-side Select
  // validation (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually block this site's
  // real save flow too, not just WebhookForm's -- a differently-cased value
  // against a real configured option ("website" vs "Website") is the
  // backend's own ordinal/case-sensitive rejection case, reproduced
  // client-side, before any round trip.
  it("rejects a differently-cased Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockCreateLead.mockResolvedValue("new-lead-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([SOURCE_FIELD]),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([SOURCE_FIELD]));

    act(() => {
      // Lower-cased against the real configured "Website" -- same
      // ordinal-mismatch case D5's own test file pins.
      result.current.updateCustomFieldValue("__cf__source", "website");
    });

    await act(async () => {
      await result.current.handleCreateLead(CREATE_PARAMS);
    });

    // The lead itself still gets created (a separate mutation, same shape
    // as any other custom-field save failure) -- but the custom-field value
    // never reaches the API at all.
    expect(mockCreateLead).toHaveBeenCalled();
    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
    // The identity-mocked `t` above returns the raw key -- proves the
    // SPECIFIC D5 message reached the toast, not the generic
    // "customFieldsSaveError" fallback every other save failure gets.
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "customField.values.selectInvalidOption" })
    );
  });

  it("does not attempt a custom-field save when the lead create itself fails", async () => {
    mockCreateLead.mockRejectedValue(new Error("network down"));
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useLeadsViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    await act(async () => {
      await result.current.handleCreateLead(CREATE_PARAMS);
    });

    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
  });
});
