import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const {
  mockUseParams,
  mockRouterPush,
  mockSuccessToast,
  mockErrorToast,
  mockCreate,
  mockUpdate,
  mockGetById,
} = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockRouterPush: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGetById: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mockUseParams,
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@modules/communication/di", () => ({
  communicationContainer: {
    messageTemplateRepository: {
      create: mockCreate,
      update: mockUpdate,
      getById: mockGetById,
    },
  },
}));

import {
  useTemplateFormViewModel,
  MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
} from "./useTemplateFormViewModel";

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

const NATIONALITY_FIELD = {
  name: "__cf__nationality",
  label: "Nationality",
  type: "text" as const,
  section: "Custom Fields",
};

const EXISTING_TEMPLATE = {
  id: "existing-template-id",
  key: "welcome",
  channel: "Email" as const,
  language: "en",
  subject: "Hi",
  body: "Hello",
  isActive: true,
};

describe("useTemplateFormViewModel + custom fields", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({});
    mockRouterPush.mockClear();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockGetById.mockReset();
  });

  it("fetches custom field definitions with no ownerId in create mode", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });

    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([NATIONALITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(
      MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
      undefined
    );
  });

  it("fetches custom field definitions keyed by the template id in edit mode", async () => {
    mockUseParams.mockReturnValue({ id: "existing-template-id" });
    mockGetById.mockResolvedValue(EXISTING_TEMPLATE);
    const extension = registerFakeCustomFieldsExtension();

    renderHook(() => useTemplateFormViewModel(), { wrapper });

    await waitFor(() =>
      expect(extension.getFormFields).toHaveBeenCalledWith(
        MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
        "existing-template-id"
      )
    );
  });

  it("saves custom field values after a successful create, keyed by the new template id, and navigates only after that", async () => {
    mockCreate.mockResolvedValue("new-template-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([NATIONALITY_FIELD]));

    act(() => {
      result.current.updateField("body", "Hello");
      result.current.updateCustomFieldValue("__cf__nationality", "Egyptian");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalledWith(
      MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
      "new-template-id",
      { nationality: "Egyptian" }
    );
    expect(mockRouterPush).toHaveBeenCalledWith("/communication/templates");
  });

  it("saves custom field values after a successful update, keyed by the template id", async () => {
    mockUseParams.mockReturnValue({ id: "existing-template-id" });
    mockGetById.mockResolvedValue(EXISTING_TEMPLATE);
    mockUpdate.mockResolvedValue(undefined);
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([NATIONALITY_FIELD]));
    await waitFor(() => expect(result.current.form.key).toBe("welcome"));

    act(() => {
      result.current.updateCustomFieldValue("__cf__nationality", "Egyptian");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockUpdate).toHaveBeenCalledWith("existing-template-id", expect.any(Object));
    expect(extension.saveValues).toHaveBeenCalledWith(
      MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
      "existing-template-id",
      { nationality: "Egyptian" }
    );
    expect(mockRouterPush).toHaveBeenCalledWith("/communication/templates");
  });

  it("sends null instead of an empty string when a custom field is cleared", async () => {
    mockCreate.mockResolvedValue("new-template-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([NATIONALITY_FIELD]));

    act(() => {
      result.current.updateField("body", "Hello");
      result.current.updateCustomFieldValue("__cf__nationality", "Egyptian");
      result.current.updateCustomFieldValue("__cf__nationality", "");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(extension.saveValues).toHaveBeenCalledWith(
      MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
      "new-template-id",
      { nationality: null }
    );
  });

  it("does not navigate away and surfaces an error toast when saving custom field values fails after create succeeds", async () => {
    mockCreate.mockResolvedValue("new-template-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
      saveValues: vi.fn().mockRejectedValue(new Error("boom")),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([NATIONALITY_FIELD]));

    act(() => {
      result.current.updateField("body", "Hello");
      result.current.updateCustomFieldValue("__cf__nationality", "Egyptian");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "messaging.templates.customFieldsSaveError" })
    );
  });

  it("does not call saveValues and still navigates when there are no custom field definitions", async () => {
    mockCreate.mockResolvedValue("new-template-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([]),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldsLoading).toBe(false));

    act(() => {
      result.current.updateField("body", "Hello");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/communication/templates");
  });

  it("resubmits an untouched custom field's existing default value on update, not just fields the user edited", async () => {
    mockUseParams.mockReturnValue({ id: "existing-template-id" });
    mockGetById.mockResolvedValue(EXISTING_TEMPLATE);
    mockUpdate.mockResolvedValue(undefined);
    const fieldWithDefault = { ...NATIONALITY_FIELD, defaultValue: "Egyptian" };
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([fieldWithDefault]),
    });

    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([fieldWithDefault]));

    // Deliberately not calling updateCustomFieldValue -- the field is left untouched.
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(extension.saveValues).toHaveBeenCalledWith(
      MESSAGE_TEMPLATE_ENTITY_TYPE_KEY,
      "existing-template-id",
      { nationality: "Egyptian" }
    );
  });
});
