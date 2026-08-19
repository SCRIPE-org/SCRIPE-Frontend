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

// jsdom also has no scrollIntoView -- cmdk calls it on the highlighted row's
// layout effect as soon as a GenericSelect panel's option list mounts (needed
// below for the Select-type custom field coverage; same stub as
// renderCustomFieldControl.test.tsx).
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
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

// One FieldConfig per FieldConfig["type"] this catalog produces -- same 5
// kinds renderCustomFieldControl.tsx's own switch handles (Wave 2 Step 2.2,
// Task 11 integration coverage).
const TEXT_FIELD = { name: "__cf__nickname", label: "Nickname", type: "text" as const };
const NUMBER_FIELD = { name: "__cf__score", label: "Score", type: "number" as const };
const SWITCH_FIELD = { name: "__cf__featured", label: "Featured", type: "switch" as const };
const DATE_FIELD = { name: "__cf__startdate", label: "Start Date", type: "date" as const };
const SELECT_FIELD = {
  name: "__cf__severity",
  label: "Severity",
  type: "select" as const,
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};
const ALL_FIELD_TYPES = [TEXT_FIELD, NUMBER_FIELD, SWITCH_FIELD, DATE_FIELD, SELECT_FIELD];

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

  // Wave 2 Step 2.2, Task 11: the test above only ever exercised the Text
  // branch. This proves the other 4 FieldConfig["type"] kinds round-trip
  // through renderCustomFieldControl's shared branches end-to-end (render ->
  // change -> reflected back through vm.updateCustomFieldValue's own state),
  // through THIS site's real `vm`-based wiring, not just the isolated
  // unit-level renderer tests.
  it("round-trips a value of each of the 5 custom field types through the shared renderer end-to-end", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue(ALL_FIELD_TYPES),
    });

    renderWithQueryClient(
      <WebhookForm mode="create" open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );

    fireEvent.change(await screen.findByLabelText("Nickname"), { target: { value: "Mo" } });
    expect(screen.getByLabelText("Nickname")).toHaveValue("Mo");

    fireEvent.change(screen.getByLabelText("Score"), { target: { value: "42" } });
    expect(screen.getByLabelText("Score")).toHaveValue(42);

    const switchControl = screen.getByRole("switch", { name: "Featured" });
    expect(switchControl).toHaveAttribute("aria-checked", "false");
    fireEvent.click(switchControl);
    expect(switchControl).toHaveAttribute("aria-checked", "true");

    // Scoped to `input`: Wave 3.1 Task 12 gave the DatePicker trigger its own
    // real aria-label equal to the field's label, so a bare
    // `getByLabelText("Start Date")` is now ambiguous by design -- see
    // renderCustomFieldControl.tsx's Date branch.
    fireEvent.change(screen.getByLabelText("Start Date", { selector: "input" }), {
      target: { value: "2026-08-17" },
    });
    expect(screen.getByLabelText("Start Date", { selector: "input" })).toHaveValue("2026-08-17");

    const trigger = screen.getByRole("combobox", { name: "Severity" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));
    expect(screen.getByRole("combobox", { name: "Severity" })).toHaveTextContent("Medium");
  });

  it("shows the empty-state message when there are no custom field definitions", async () => {
    registerFakeCustomFieldsExtension({ getFormFields: vi.fn().mockResolvedValue([]) });

    renderWithQueryClient(
      <WebhookForm mode="create" open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => expect(screen.getByText("webhooks.noCustomFields")).toBeInTheDocument());
  });

  // Wave 5 row 5.6 (design spec §5.4; pre-plan R2's "hand-rolled" shape):
  // this dialog hosts InlineAddCustomFieldDialog (now a modal={false} Sheet)
  // via WebhookFormCustomFieldsSection, so its own outer Dialog must also be
  // modal={false} — a modal={true} outer would `hideOthers()` the whole
  // rest of the document, including anything the inline-add trigger opens.
  // This proves the fix behaviorally (structure/reachability), not merely
  // that the form mounts — see core/ui/__tests__/dialog.test.tsx's own
  // comment for the exact aria-hidden mechanism being asserted against here.
  it("renders as a non-modal dialog: a sentinel outside it stays reachable via getByRole while it is open", async () => {
    registerFakeCustomFieldsExtension();

    renderWithQueryClient(
      <div>
        <button type="button">host-page-sentinel</button>
        <WebhookForm mode="create" open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
      </div>
    );

    expect(await screen.findByRole("dialog", { name: "webhooks.create" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "host-page-sentinel" })).toBeInTheDocument();
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
