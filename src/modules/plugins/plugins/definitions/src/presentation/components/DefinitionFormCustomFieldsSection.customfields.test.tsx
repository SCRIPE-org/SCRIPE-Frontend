import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockGetAll, mockCreate, mockUpdate, mockSuccessToast, mockErrorToast } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

// DefinitionsView calls this directly (unlike TemplateFormView) -- stubbed to
// a no-op so it doesn't reach into useI18n internals this suite doesn't mock.
vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: () => ({ isLoaded: true }),
}));

vi.mock("@modules/plugins/di", () => ({
  pluginsContainer: {
    definitionsRepository: {
      getAll: mockGetAll,
      create: mockCreate,
      update: mockUpdate,
      publish: vi.fn(),
      deprecate: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// jsdom has no ResizeObserver -- the Tier/Scope Selects and this form's own
// Custom Fields Select all use Radix primitives that call it on mount (see
// the same stub in WebhookForm.customfields.test.tsx).
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { DefinitionsView } from "../views/DefinitionsView";
import { DEFINITION_ENTITY_TYPE_KEY } from "../viewmodels/useDefinitionsViewModel";

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

async function openCreateForm() {
  // Both the page header and the empty-state render a "New Definition"
  // button when the list is empty -- the header's is first in the DOM.
  const buttons = await screen.findAllByRole("button", { name: "plugins.defNew" });
  fireEvent.click(buttons[0]);
}

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText("plugins.defPlaceholderKey"), {
    target: { value: "com.acme.test-plugin" },
  });
  fireEvent.change(screen.getByPlaceholderText("plugins.defPlaceholderName"), {
    target: { value: "Test Plugin" },
  });
}

describe("DefinitionFormDialog + custom fields", () => {
  beforeEach(() => {
    mockGetAll.mockReset().mockResolvedValue([]);
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("renders a labeled input for each custom field definition on the Custom Fields section and accepts typing", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();

    const input = await screen.findByLabelText("Priority");
    fireEvent.change(input, { target: { value: "High" } });
    expect(input).toHaveValue("High");
  });

  it("shows the empty-state message when there are no custom field definitions", async () => {
    registerFakeCustomFieldsExtension({ getFormFields: vi.fn().mockResolvedValue([]) });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();

    await waitFor(() =>
      expect(screen.getByText("plugins.defNoCustomFields")).toBeInTheDocument()
    );
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

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();

    await screen.findByText("inline-add");
    fireEvent.click(screen.getByText("inline-add"));

    await screen.findByLabelText("Priority");
    expect(getFormFields).toHaveBeenCalledTimes(2);
  });

  it("saves custom field values after a successful create, keyed by the new definition id, and only then toasts success", async () => {
    mockCreate.mockResolvedValue("new-definition-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();
    fillRequiredFields();

    fireEvent.change(await screen.findByLabelText("Priority"), {
      target: { value: "High" },
    });

    fireEvent.click(screen.getByRole("button", { name: "common.create" }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    await waitFor(() =>
      expect(extension.saveValues).toHaveBeenCalledWith(
        DEFINITION_ENTITY_TYPE_KEY,
        "new-definition-id",
        { priority: "High" }
      )
    );
    await waitFor(() =>
      expect(mockSuccessToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "plugins.defCreate" })
      )
    );
  });

  it("does not toast success and surfaces a distinct error when saving custom field values fails after create succeeds", async () => {
    mockCreate.mockResolvedValue("new-definition-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
      saveValues: vi.fn().mockRejectedValue(new Error("boom")),
    });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();
    fillRequiredFields();

    fireEvent.change(await screen.findByLabelText("Priority"), {
      target: { value: "High" },
    });

    fireEvent.click(screen.getByRole("button", { name: "common.create" }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    await waitFor(() => expect(extension.saveValues).toHaveBeenCalled());
    expect(mockSuccessToast).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "plugins.defCustomFieldsSaveError" })
      )
    );
  });

  it("does not call saveValues and still succeeds when there are no custom field definitions", async () => {
    mockCreate.mockResolvedValue("new-definition-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([]),
    });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();
    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "common.create" }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(extension.saveValues).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mockSuccessToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "plugins.defCreate" })
      )
    );
  });
});
