import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockCreate, mockUpdate, mockGetAvailableEvents } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGetAvailableEvents: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: vi.fn(), error: vi.fn() }),
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

// jsdom has no ResizeObserver -- the Endpoint section's scope RadioGroup,
// the Options accordion, and this form's own Custom Fields Select all use
// Radix primitives that call it on mount (see the same stub in
// TemplateFormView.customfields.test.tsx).
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { WebhookForm } from "./WebhookForm";

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
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

describe("WebhookForm + custom fields", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockGetAvailableEvents.mockReset().mockResolvedValue([]);
  });

  it("renders a labeled input for each custom field definition on the Custom Fields section and accepts typing", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    renderWithQueryClient(
      <WebhookForm mode="create" open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );

    const input = await screen.findByLabelText("Priority");
    fireEvent.change(input, { target: { value: "High" } });
    expect(input).toHaveValue("High");
  });

  it("shows the empty-state message when there are no custom field definitions", async () => {
    registerFakeCustomFieldsExtension({ getFormFields: vi.fn().mockResolvedValue([]) });

    renderWithQueryClient(
      <WebhookForm mode="create" open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => expect(screen.getByText("webhooks.noCustomFields")).toBeInTheDocument());
  });

  it("renders the inline add-custom-field trigger and refetches definitions when it reports a new field was created", async () => {
    const getFormFields = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([PRIORITY_FIELD]);
    registerFakeCustomFieldsExtension({
      getFormFields,
      InlineAddTrigger: ({ onCreated }) => (
        <button type="button" onClick={onCreated}>
          inline-add
        </button>
      ),
    });

    renderWithQueryClient(
      <WebhookForm mode="create" open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );

    await screen.findByText("inline-add");
    fireEvent.click(screen.getByText("inline-add"));

    await screen.findByLabelText("Priority");
    expect(getFormFields).toHaveBeenCalledTimes(2);
  });
});
