// useStudioViewModel + custom fields (SaveAsThemeModal's real save flow) --
// Final whole-branch review, I3 follow-up.
//
// This site had NO viewmodel-level test coverage before this task --
// SaveAsThemeModal.customfields.test.tsx (Wave 2 Step 2.2, Task 11) only
// ever renders the presentational SaveAsThemeModal component directly with
// a mocked `onSaveTheme` prop, so it never exercises useStudioViewModel's
// own real saveTheme/saveThemeCustomFieldValues save flow -- the actual
// place D5's client-side Select validation had to be wired in. This file
// mirrors the renderHook pattern already established by
// useWebhookFormViewModel.customFields.test.tsx / useLeadsViewModel /
// useDsrViewModel / useTemplateFormViewModel, scoped to just the
// saveTheme/custom-fields surface (useStudioViewModel itself is a large,
// multi-concern hook -- the branding query below is mocked to settle
// immediately via its own internal try/catch -> null fallback, exactly the
// same minimal-mock shape every other real caller of this hook already
// tolerates on a fresh/unbranded tenant).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockGetMyBranding, mockThemeCreate, mockSuccessToast, mockErrorToast } = vi.hoisted(() => ({
  mockGetMyBranding: vi.fn(),
  mockThemeCreate: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@modules/customization/di", () => ({
  customizationContainer: {
    // Rejected on purpose -- useStudioViewModel's own brandingQuery wraps
    // this in a try/catch that resolves to `null` on failure, the same
    // "no branding saved yet" state a fresh tenant would show. Nothing in
    // the saveTheme/custom-fields surface this file exercises depends on
    // real branding data.
    customizationRepository: {
      getMyBranding: mockGetMyBranding,
    },
    themeMarketplaceRepository: {
      create: mockThemeCreate,
    },
  },
}));

import { useStudioViewModel, THEME_ENTITY_TYPE_KEY } from "./useStudioViewModel";

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

const MOOD_FIELD = {
  name: "__cf__mood",
  label: "Mood",
  type: "select" as const,
  section: "Custom Fields",
  options: [
    { value: "Bold", label: "Bold" },
    { value: "Calm", label: "Calm" },
  ],
};

const THEME_INPUT = {
  name: "My Theme",
  slug: "my-theme",
  category: "corporate",
  accentColor: "#6366f1",
  themeDataJson: "{}",
};

describe("useStudioViewModel + custom fields (saveTheme)", () => {
  beforeEach(() => {
    mockGetMyBranding.mockReset().mockRejectedValue(new Error("no branding yet"));
    mockThemeCreate.mockReset();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("fetches theme custom field definitions with no ownerId (SaveAsThemeModal is create-only)", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useStudioViewModel(), { wrapper });

    await waitFor(() => expect(result.current.themeCustomFieldConfigs).toEqual([PRIORITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(THEME_ENTITY_TYPE_KEY, undefined);
  });

  it("saves custom field values after a successful theme create, keyed by the new theme id, and only then toasts success", async () => {
    mockThemeCreate.mockResolvedValue({ id: "new-theme-id" });
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useStudioViewModel(), { wrapper });
    await waitFor(() => expect(result.current.themeCustomFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateThemeCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.saveTheme(THEME_INPUT);
    });

    expect(mockThemeCreate).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalledWith(THEME_ENTITY_TYPE_KEY, "new-theme-id", {
      priority: "High",
    });
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "studio.saveTheme.success" })
    );
  });

  // Final whole-branch review, I3 fix verification: D5's client-side Select
  // validation (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually block this site's
  // real save flow -- a differently-cased value against a real configured
  // option ("bold" vs "Bold") is the backend's own ordinal/case-sensitive
  // rejection case, reproduced client-side, before any round trip.
  it("rejects a differently-cased Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockThemeCreate.mockResolvedValue({ id: "new-theme-id" });
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([MOOD_FIELD]),
    });

    const { result } = renderHook(() => useStudioViewModel(), { wrapper });
    await waitFor(() => expect(result.current.themeCustomFieldConfigs).toEqual([MOOD_FIELD]));

    act(() => {
      // Lower-cased against the real configured "Bold" -- same
      // ordinal-mismatch case D5's own test file pins.
      result.current.updateThemeCustomFieldValue("__cf__mood", "bold");
    });

    // saveTheme re-throws after toasting (same as useDsrViewModel's
    // handleSubmit) so SaveAsThemeModal knows to stay open with what the
    // user typed.
    await expect(
      act(async () => {
        await result.current.saveTheme(THEME_INPUT);
      })
    ).rejects.toThrow();

    // The theme entity itself still gets created (a separate mutation) --
    // but the custom-field value never reaches the API at all.
    expect(mockThemeCreate).toHaveBeenCalled();
    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
    // The identity-mocked `t` above returns the raw key -- proves the
    // SPECIFIC D5 message reached the toast, not the generic
    // "customFieldsSaveError" fallback every other save failure gets.
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "customField.values.selectInvalidOption" })
    );
  });
});
