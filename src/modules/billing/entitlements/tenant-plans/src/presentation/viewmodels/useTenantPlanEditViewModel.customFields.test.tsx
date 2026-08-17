// useTenantPlanEditViewModel + custom fields (TenantPlanStepCustomFields'
// real edit-flow save path) -- Final whole-branch review, I3 follow-up.
//
// This site had NO viewmodel-level test coverage before this task -- the
// edit wizard shares TenantPlanStepCustomFields.tsx with the create wizard,
// but useTenantPlanEditViewModel.ts is its own separate save flow (its own
// saveCustomFieldValues, its own submit) and needed the same D5 wiring
// verified independently -- see useTenantPlanCreateViewModel.customFields.test.tsx
// for the create-flow twin of this file.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockGetById, mockUpdate, mockRouterPush, mockSuccessToast, mockErrorToast } = vi.hoisted(
  () => ({
    mockGetById: vi.fn(),
    mockUpdate: vi.fn(),
    mockRouterPush: vi.fn(),
    mockSuccessToast: vi.fn(),
    mockErrorToast: vi.fn(),
  })
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@modules/entitlements/di", () => ({
  entitlementsContainer: {
    tenantPlanRepository: {
      getById: mockGetById,
      update: mockUpdate,
    },
  },
}));

import { useTenantPlanEditViewModel } from "./useTenantPlanEditViewModel";
import { TENANT_PLAN_ENTITY_TYPE_KEY } from "./useTenantPlanCreateViewModel";

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

const TIER_FIELD = {
  name: "__cf__tier",
  label: "Tier",
  type: "select" as const,
  section: "Custom Fields",
  options: [
    { value: "Low", label: "Low" },
    { value: "High", label: "High" },
  ],
};

const EXISTING_PLAN = { id: "existing-plan-id", name: "Gold" };

describe("useTenantPlanEditViewModel + custom fields", () => {
  beforeEach(() => {
    mockGetById.mockReset().mockResolvedValue(EXISTING_PLAN);
    mockUpdate.mockReset();
    mockRouterPush.mockClear();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("fetches custom field definitions keyed by the plan id (edit mode always has one)", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useTenantPlanEditViewModel("existing-plan-id"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(
      TENANT_PLAN_ENTITY_TYPE_KEY,
      "existing-plan-id"
    );
  });

  it("saves custom field values after a successful update, keyed by the plan id", async () => {
    mockUpdate.mockResolvedValue(undefined);
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useTenantPlanEditViewModel("existing-plan-id"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));
    await waitFor(() => expect(result.current.form.name).toBe("Gold"));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockUpdate).toHaveBeenCalledWith("existing-plan-id", expect.any(Object));
    expect(extension.saveValues).toHaveBeenCalledWith(
      TENANT_PLAN_ENTITY_TYPE_KEY,
      "existing-plan-id",
      { priority: "High" }
    );
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "entitlements.tenantPlans.updated" })
    );
  });

  // Final whole-branch review, I3 fix verification: D5's client-side Select
  // validation (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually block this site's
  // real save flow -- a differently-cased value against a real configured
  // option ("low" vs "Low") is the backend's own ordinal/case-sensitive
  // rejection case, reproduced client-side, before any round trip.
  it("rejects a differently-cased Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockUpdate.mockResolvedValue(undefined);
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([TIER_FIELD]),
    });

    const { result } = renderHook(() => useTenantPlanEditViewModel("existing-plan-id"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([TIER_FIELD]));
    await waitFor(() => expect(result.current.form.name).toBe("Gold"));

    act(() => {
      // Lower-cased against the real configured "Low" -- same
      // ordinal-mismatch case D5's own test file pins.
      result.current.updateCustomFieldValue("__cf__tier", "low");
    });

    await act(async () => {
      await result.current.submit();
    });

    // The plan itself still gets updated (a separate mutation, same shape
    // as any other custom-field save failure) -- but the custom-field
    // value never reaches the API at all.
    expect(mockUpdate).toHaveBeenCalled();
    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "customField.values.selectInvalidOption" })
    );
  });
});
