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

// jsdom also has no scrollIntoView -- cmdk calls it on the highlighted row's
// layout effect as soon as a GenericSelect panel's option list mounts (needed
// below for the Select-type custom field coverage; same stub as
// renderCustomFieldControl.test.tsx).
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
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

// One FieldConfig per FieldConfig["type"] this catalog produces -- same 5
// kinds renderCustomFieldControl.tsx's own switch handles (Wave 2 Step 2.2,
// Task 11 integration coverage).
const TEXT_FIELD = { name: "__cf__nickname", label: "Nickname", type: "text" as const };
const NUMBER_FIELD = { name: "__cf__score", label: "Score", type: "number" as const };
const SWITCH_FIELD = { name: "__cf__featured", label: "Featured", type: "switch" as const };
const DATE_FIELD = { name: "__cf__startdate", label: "Start Date", type: "date" as const };
// Final whole-branch review, I3 follow-up: a defaultValue that is NOT one of
// `options`' own labels -- simulating the real, named risk
// validateSelectCustomFieldValue's own doc comment exists to catch (a stale
// value already sitting in form state, e.g. this field's Options were
// edited server-side after the value was fetched/captured), reached here
// WITHOUT ever touching the Select control. GenericSelect itself can only
// ever emit a value drawn from its own `options` array through the picker
// UI (D5's own doc comment), so a UI-driven `fireEvent.click` on a real
// option could never reproduce an invalid value -- an untouched field's own
// fetched default is the one real path to it.
const STALE_SELECT_FIELD = {
  name: "__cf__tier",
  label: "Support Tier",
  type: "select" as const,
  defaultValue: "Urgent",
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};
const SELECT_FIELD = {
  name: "__cf__tier",
  label: "Support Tier",
  type: "select" as const,
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};
const ALL_FIELD_TYPES = [TEXT_FIELD, NUMBER_FIELD, SWITCH_FIELD, DATE_FIELD, SELECT_FIELD];

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

  // Wave 2 Step 2.2, Task 11: the test above only ever exercised the Text
  // branch. This proves the other 4 FieldConfig["type"] kinds round-trip
  // through renderCustomFieldControl's shared branches end-to-end (render ->
  // change -> captured onChange value, verified via the create submission's
  // saveValues call, THIS site's own real update mechanism), not just the
  // isolated unit-level renderer tests.
  it("round-trips a value of each of the 5 custom field types through the shared renderer end-to-end", async () => {
    mockCreate.mockResolvedValue("new-definition-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue(ALL_FIELD_TYPES),
    });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();
    fillRequiredFields();

    fireEvent.change(await screen.findByLabelText("Nickname"), { target: { value: "Mo" } });
    fireEvent.change(screen.getByLabelText("Score"), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("switch", { name: "Featured" }));
    // Scoped to `input`: Wave 3.1 Task 12 gave the DatePicker trigger its own
    // real aria-label equal to the field's label, so a bare
    // `getByLabelText("Start Date")` is now ambiguous by design -- see
    // renderCustomFieldControl.tsx's Date branch.
    fireEvent.change(screen.getByLabelText("Start Date", { selector: "input" }), {
      target: { value: "2026-08-17" },
    });

    const trigger = screen.getByRole("combobox", { name: "Support Tier" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));

    fireEvent.click(screen.getByRole("button", { name: "common.create" }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    await waitFor(() =>
      expect(extension.saveValues).toHaveBeenCalledWith(DEFINITION_ENTITY_TYPE_KEY, "new-definition-id", {
        nickname: "Mo",
        score: "42",
        featured: true,
        startdate: "2026-08-17",
        tier: "Medium",
      })
    );
  });

  // Final whole-branch review, I3 follow-up: D5's client-side Select
  // validation (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually block this site's
  // real save flow too, not just WebhookForm's. Uses STALE_SELECT_FIELD's
  // own defaultValue ("Urgent", not one of its `options`' labels) reached by
  // leaving the field completely untouched -- see that fixture's own
  // comment for why a real option click could never reproduce this case.
  it("rejects a stale default Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockCreate.mockResolvedValue("new-definition-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([STALE_SELECT_FIELD]),
    });

    renderWithQueryClient(<DefinitionsView />);
    await openCreateForm();
    fillRequiredFields();
    await screen.findByRole("combobox", { name: "Support Tier" });

    // Deliberately not touching the Select control -- the untouched field's
    // own stale fetched defaultValue is what must be rejected.
    fireEvent.click(screen.getByRole("button", { name: "common.create" }));

    // The definition entity itself still gets created (a separate mutation
    // that always runs first, same shape as every other consumer site's
    // save flow -- see webhooks/leads/dsr/templates) -- but the
    // custom-field value never reaches the API at all.
    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(extension.saveValues).not.toHaveBeenCalled();
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
