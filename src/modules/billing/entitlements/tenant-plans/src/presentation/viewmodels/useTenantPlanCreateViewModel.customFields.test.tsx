// useTenantPlanCreateViewModel + custom fields (TenantPlanStepCustomFields'
// real create-flow save path) -- Final whole-branch review, I3 follow-up.
//
// This site had NO viewmodel-level test coverage before this task --
// TenantPlanStepCustomFields.test.tsx (Wave 2 Step 2.2, Task 7b) only ever
// renders the presentational TenantPlanStepCustomFields component directly
// with a mocked `onChange` prop, so it never exercises
// useTenantPlanCreateViewModel's own real submit/saveCustomFieldValues save
// flow -- the actual place D5's client-side Select validation had to be
// wired in. Mirrors the renderHook pattern already established by
// useWebhookFormViewModel.customFields.test.tsx / useLeadsViewModel /
// useDsrViewModel / useTemplateFormViewModel.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockCreate, mockRouterPush, mockSuccessToast, mockErrorToast } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRouterPush: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
}));

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
      create: mockCreate,
    },
  },
}));

import { useTenantPlanCreateViewModel, TENANT_PLAN_ENTITY_TYPE_KEY } from "./useTenantPlanCreateViewModel";

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

describe("useTenantPlanCreateViewModel + custom fields", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockRouterPush.mockClear();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("fetches custom field definitions with no ownerId (a new plan has no id yet)", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useTenantPlanCreateViewModel(), { wrapper });

    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(TENANT_PLAN_ENTITY_TYPE_KEY, undefined);
  });

  it("saves custom field values after a successful create, keyed by the new plan id, and only then toasts success", async () => {
    mockCreate.mockResolvedValue("new-plan-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useTenantPlanCreateViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateForm({ name: "Gold" });
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalledWith(TENANT_PLAN_ENTITY_TYPE_KEY, "new-plan-id", {
      priority: "High",
    });
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "entitlements.tenantPlans.created" })
    );
  });

  // Final whole-branch review, I3 fix verification: D5's client-side Select
  // validation (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually block this site's
  // real save flow -- a differently-cased value against a real configured
  // option ("low" vs "Low") is the backend's own ordinal/case-sensitive
  // rejection case, reproduced client-side, before any round trip.
  it("rejects a differently-cased Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockCreate.mockResolvedValue("new-plan-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([TIER_FIELD]),
    });

    const { result } = renderHook(() => useTenantPlanCreateViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([TIER_FIELD]));

    act(() => {
      result.current.updateForm({ name: "Gold" });
      // Lower-cased against the real configured "Low" -- same
      // ordinal-mismatch case D5's own test file pins.
      result.current.updateCustomFieldValue("__cf__tier", "low");
    });

    await act(async () => {
      await result.current.submit();
    });

    // The plan itself still gets created (a separate mutation, same shape
    // as any other custom-field save failure) -- but the custom-field
    // value never reaches the API at all.
    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    // This site pairs a generic "common.error" title with a specific
    // description (its own established convention) -- the identity-mocked
    // `t` proves the SPECIFIC D5 message reached the description, not the
    // generic "customFieldsSaveError" fallback every other save failure
    // gets here.
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "customField.values.selectInvalidOption" })
    );
  });
});
