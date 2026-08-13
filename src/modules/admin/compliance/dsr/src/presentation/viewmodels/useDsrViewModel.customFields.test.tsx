import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockSubmit, mockSuccessToast, mockErrorToast, mockUseAppStore } = vi.hoisted(() => {
  const mockAppState = { tenantCode: "test-tenant" };
  const mockUseAppStore = Object.assign(
    (selector?: (state: typeof mockAppState) => unknown) =>
      typeof selector === "function" ? selector(mockAppState) : mockAppState,
    { getState: () => mockAppState }
  );
  return {
    mockSubmit: vi.fn(),
    mockSuccessToast: vi.fn(),
    mockErrorToast: vi.fn(),
    mockUseAppStore,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@core/hooks/use-permissions", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

vi.mock("@modules/compliance/di", () => ({
  complianceContainer: {
    dsrRepository: {
      submit: mockSubmit,
      getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      review: vi.fn(),
      cancel: vi.fn(),
    },
  },
}));

import { useDsrViewModel, DSR_ENTITY_TYPE_KEY } from "./useDsrViewModel";

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

const SUBMIT_DATA = {
  requestType: "Export",
  regulationCode: "GDPR",
  subjectEmail: "subject@example.com",
  requesterNotes: "",
};

describe("useDsrViewModel + custom fields", () => {
  beforeEach(() => {
    mockSubmit.mockReset();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("fetches custom field definitions with no ownerId (DSR has no edit form)", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useDsrViewModel(), { wrapper });

    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(DSR_ENTITY_TYPE_KEY, undefined);
  });

  it("saves custom field values after a successful submit, keyed by the new DSR id, and only then toasts success", async () => {
    mockSubmit.mockResolvedValue("new-dsr-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useDsrViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.handleSubmit(SUBMIT_DATA);
    });

    expect(mockSubmit).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalledWith(DSR_ENTITY_TYPE_KEY, "new-dsr-id", {
      priority: "High",
    });
    expect(mockSuccessToast).toHaveBeenCalledWith({ title: "compliance.dsrSubmitted" });
  });

  it("sends null instead of an empty string when a custom field is cleared", async () => {
    mockSubmit.mockResolvedValue("new-dsr-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useDsrViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
      result.current.updateCustomFieldValue("__cf__priority", "");
    });

    await act(async () => {
      await result.current.handleSubmit(SUBMIT_DATA);
    });

    expect(extension.saveValues).toHaveBeenCalledWith(DSR_ENTITY_TYPE_KEY, "new-dsr-id", {
      priority: null,
    });
  });

  it("does not call saveValues and still toasts success when there are no custom field definitions", async () => {
    mockSubmit.mockResolvedValue("new-dsr-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([]),
    });

    const { result } = renderHook(() => useDsrViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldsLoading).toBe(false));

    await act(async () => {
      await result.current.handleSubmit(SUBMIT_DATA);
    });

    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockSuccessToast).toHaveBeenCalledWith({ title: "compliance.dsrSubmitted" });
  });

  it("does not toast the submitted success message and rejects when saving custom field values fails after submit succeeds", async () => {
    mockSubmit.mockResolvedValue("new-dsr-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
      saveValues: vi.fn().mockRejectedValue(new Error("boom")),
    });

    const { result } = renderHook(() => useDsrViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await expect(
      act(async () => {
        await result.current.handleSubmit(SUBMIT_DATA);
      })
    ).rejects.toThrow("boom");

    expect(mockSubmit).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "compliance.customFieldsSaveError" })
    );
  });

  it("does not attempt a custom-field save when the DSR submit itself fails", async () => {
    mockSubmit.mockRejectedValue(new Error("network down"));
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useDsrViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    await expect(
      act(async () => {
        await result.current.handleSubmit(SUBMIT_DATA);
      })
    ).rejects.toThrow("network down");

    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
  });
});
