/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { WebhookSubscription } from "../../domain/entities/Webhook";

const { mockCreate, mockUpdate, mockGetAvailableEvents, mockSuccessToast, mockErrorToast } =
  vi.hoisted(() => ({
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockGetAvailableEvents: vi.fn(),
    mockSuccessToast: vi.fn(),
    mockErrorToast: vi.fn(),
  }));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: () => ({ user: { tenantId: "test-tenant" } }),
}));

vi.mock("@modules/integrations/di", () => ({
  integrationsContainer: {
    webhookRepository: {
      create: mockCreate,
      update: mockUpdate,
      getAvailableEvents: mockGetAvailableEvents,
    },
  },
}));

import {
  useWebhookFormViewModel,
  WEBHOOK_ENTITY_TYPE_KEY,
} from "./useWebhookFormViewModel";

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

const SEVERITY_FIELD = {
  name: "__cf__severity",
  label: "Severity",
  type: "select" as const,
  section: "Custom Fields",
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ],
};

function makeWebhook(overrides: Record<string, unknown> = {}) {
  return new WebhookSubscription({
    id: "existing-webhook-id",
    scope: "tenant_only",
    tenantId: "test-tenant",
    tenantName: "Test Tenant",
    url: "https://example.com/hook",
    description: null,
    events: ["user.created"],
    isActive: true,
    secret: "secret",
    hasPreviousSecret: false,
    previousSecretExpiresAt: null,
    maxRetries: 3,
    consecutiveFailures: 0,
    maxConsecutiveFailures: 10,
    lastDeliveryAt: null,
    lastDeliveryStatus: null,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    successRate: 0,
    createdAt: new Date().toISOString(),
    modifiedAt: null,
    ...overrides,
  } as any);
}

describe("useWebhookFormViewModel + custom fields", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockGetAvailableEvents.mockReset().mockResolvedValue([]);
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("fetches custom field definitions with no ownerId in create mode", async () => {
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useWebhookFormViewModel({ mode: "create" }), { wrapper });

    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));
    expect(extension.getFormFields).toHaveBeenCalledWith(WEBHOOK_ENTITY_TYPE_KEY, undefined);
  });

  it("fetches custom field definitions keyed by the webhook id in edit mode", async () => {
    const webhook = makeWebhook();
    const extension = registerFakeCustomFieldsExtension();

    renderHook(() => useWebhookFormViewModel({ mode: "edit", webhook }), { wrapper });

    await waitFor(() =>
      expect(extension.getFormFields).toHaveBeenCalledWith(
        WEBHOOK_ENTITY_TYPE_KEY,
        "existing-webhook-id"
      )
    );
  });

  it("saves custom field values after a successful create, keyed by the new webhook id, and only then toasts success", async () => {
    mockCreate.mockResolvedValue(makeWebhook({ id: "new-webhook-id" }));
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useWebhookFormViewModel({ mode: "create" }), { wrapper });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.setUrl("https://example.com/hook");
      result.current.setSelectedEvents(["user.created"]);
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalledWith(WEBHOOK_ENTITY_TYPE_KEY, "new-webhook-id", {
      priority: "High",
    });
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "webhooks.created" })
    );
  });

  it("saves custom field values after a successful update, keyed by the webhook id", async () => {
    const webhook = makeWebhook();
    mockUpdate.mockResolvedValue(undefined);
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    const { result } = renderHook(() => useWebhookFormViewModel({ mode: "edit", webhook }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockUpdate).toHaveBeenCalledWith("existing-webhook-id", expect.any(Object));
    expect(extension.saveValues).toHaveBeenCalledWith(
      WEBHOOK_ENTITY_TYPE_KEY,
      "existing-webhook-id",
      { priority: "High" }
    );
    expect(mockSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "webhooks.updated" })
    );
  });

  it("does not toast success and surfaces a distinct error when saving custom field values fails after create succeeds", async () => {
    mockCreate.mockResolvedValue(makeWebhook({ id: "new-webhook-id" }));
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
      saveValues: vi.fn().mockRejectedValue(new Error("boom")),
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useWebhookFormViewModel({ mode: "create", onSuccess }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([PRIORITY_FIELD]));

    act(() => {
      result.current.setUrl("https://example.com/hook");
      result.current.setSelectedEvents(["user.created"]);
      result.current.updateCustomFieldValue("__cf__priority", "High");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "webhooks.customFieldsSaveError" })
    );
  });

  // Final whole-branch review, I3 fix: D5's client-side Select validation
  // (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually run from a real save
  // flow and block the API call -- not just exist as an unwired, fully
  // tested pure function. A differently-cased value against a real
  // configured option ("medium" vs "Medium") is exactly the backend's own
  // ordinal/case-sensitive rejection case (SelectValueTypeHandler.Validate),
  // reproduced here client-side, before any round trip.
  it("rejects a differently-cased Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockCreate.mockResolvedValue(makeWebhook({ id: "new-webhook-id" }));
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([SEVERITY_FIELD]),
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useWebhookFormViewModel({ mode: "create", onSuccess }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.customFieldConfigs).toEqual([SEVERITY_FIELD]));

    act(() => {
      result.current.setUrl("https://example.com/hook");
      result.current.setSelectedEvents(["user.created"]);
      // Lower-cased against the real configured "Medium" -- same
      // ordinal-mismatch case D5's own test file pins
      // (renderCustomFieldControl.test.tsx's "rejects a differently-cased
      // value" case), reached here through a save flow instead of calling
      // the validator directly.
      result.current.updateCustomFieldValue("__cf__severity", "medium");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // The webhook entity itself still gets created (a separate mutation,
    // same shape as any other custom-field save failure) -- but the
    // custom-field value never reaches the API at all.
    expect(mockCreate).toHaveBeenCalled();
    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mockSuccessToast).not.toHaveBeenCalled();
    // The identity-mocked `t` above returns the raw key -- proves the
    // SPECIFIC D5 message reached the toast, not the generic
    // "customFieldsSaveError" fallback every other save failure gets.
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "customField.values.selectInvalidOption" })
    );
  });

  it("does not call saveValues and still succeeds when there are no custom field definitions", async () => {
    mockCreate.mockResolvedValue(makeWebhook({ id: "new-webhook-id" }));
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([]),
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useWebhookFormViewModel({ mode: "create", onSuccess }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.customFieldsLoading).toBe(false));

    act(() => {
      result.current.setUrl("https://example.com/hook");
      result.current.setSelectedEvents(["user.created"]);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(extension.saveValues).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });
});
