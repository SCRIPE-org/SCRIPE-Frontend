/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const { mockUseParams, mockRouterPush, mockCreate, mockUpdate, mockGetById } = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockRouterPush: vi.fn(),
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
  useEnhancedToast: () => ({ success: vi.fn(), error: vi.fn() }),
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

// TipTap is real DOM-editing machinery this suite doesn't need to exercise --
// stub it down to a plain textarea so mounting TemplateFormView doesn't pull
// the whole rich-text stack into jsdom.
vi.mock("@core/ui/rich-text-editor/RichTextEditor", () => ({
  RichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (html: string) => void;
  }) => (
    <textarea
      aria-label="messaging.templates.body"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// jsdom has no ResizeObserver -- TemplateFormView's own Channel/Language/Category
// fields already use Radix Select, which calls it on mount (see the same stub
// in InlineAddCustomFieldDialog.test.tsx).
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
// renderCustomFieldControl.test.tsx / SubmitDsrModal.customfields.test.tsx).
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

import { TemplateFormView } from "./TemplateFormView";

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

const NATIONALITY_FIELD = {
  name: "__cf__nationality",
  label: "Nationality",
  type: "text" as const,
  section: "Custom Fields",
};

// Wave 2 Step 2.2, Task 7b review finding M4: TemplateFormView.tsx's own
// Select-branch conversion (raw Radix `Select` -> renderCustomFieldControl's
// GenericSelect-based branch, D9) had ZERO test coverage here -- both of this
// file's pre-existing tests only ever exercised `type: "text"`. This fixture
// and the test below close that gap.
const PRIORITY_FIELD = {
  name: "__cf__priority",
  label: "Priority",
  type: "select" as const,
  section: "Custom Fields",
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};

describe("TemplateFormView + custom fields", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({});
    mockRouterPush.mockClear();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockGetById.mockReset();
  });

  it("renders a labeled input for each custom field definition on the Custom Fields tab and accepts typing", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
    });

    renderWithQueryClient(<TemplateFormView />);

    // Radix's TabsTrigger activates on mousedown (or focus/keydown), not
    // click -- see @radix-ui/react-tabs' TabsTrigger, which wires
    // onValueChange from onMouseDown/onKeyDown/onFocus and has no onClick
    // handler at all. fireEvent.click alone never synthesizes a mousedown.
    fireEvent.mouseDown(
      await screen.findByRole("tab", { name: "messaging.templates.customFieldsTitle" })
    );

    const input = await screen.findByLabelText("Nationality");
    fireEvent.change(input, { target: { value: "Egyptian" } });
    expect(input).toHaveValue("Egyptian");
  });

  it("renders the inline add-custom-field trigger and refetches definitions when it reports a new field was created", async () => {
    const getFormFields = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([NATIONALITY_FIELD]);
    registerFakeCustomFieldsExtension({
      getFormFields,
      InlineAddTrigger: ({ onCreated }) => (
        <button type="button" onClick={onCreated}>
          inline-add
        </button>
      ),
    });

    renderWithQueryClient(<TemplateFormView />);

    fireEvent.mouseDown(
      await screen.findByRole("tab", { name: "messaging.templates.customFieldsTitle" })
    );
    await screen.findByText("inline-add");

    fireEvent.click(screen.getByText("inline-add"));

    await screen.findByLabelText("Nationality");
    expect(getFormFields).toHaveBeenCalledTimes(2);
  });

  it("saves typed custom field values when the template is submitted", async () => {
    mockCreate.mockResolvedValue("new-template-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([NATIONALITY_FIELD]),
    });

    renderWithQueryClient(<TemplateFormView />);

    fireEvent.change(await screen.findByLabelText("messaging.templates.body"), {
      target: { value: "Hello" },
    });

    fireEvent.mouseDown(screen.getByRole("tab", { name: "messaging.templates.customFieldsTitle" }));
    fireEvent.change(await screen.findByLabelText("Nationality"), {
      target: { value: "Egyptian" },
    });

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(extension.saveValues).toHaveBeenCalledWith(
        "communication.message-template",
        "new-template-id",
        { nationality: "Egyptian" }
      )
    );
  });

  // Task 7b review finding M4 (see PRIORITY_FIELD's own comment above): this
  // site's Select branch was rewired onto renderCustomFieldControl's shared
  // GenericSelect-based control in Task 7b but never actually exercised by a
  // test. Confirms both halves of that fix: (1) the control renders with a
  // real, working accessible name (T1's aria-label fix -- getByRole's `name`
  // option performs actual accessible-name computation, matching the pattern
  // already established in TenantPlanStepCustomFields.test.tsx /
  // FeatureDefinitionFormView.customfields.test.tsx), and (2) picking an
  // option is captured correctly end-to-end through this site's own
  // `vm.updateCustomFieldValue` -> `saveValues` plumbing, not just an
  // isolated onChange spy.
  it("renders a Select custom field with a working accessible name and round-trips the picked value on save", async () => {
    mockCreate.mockResolvedValue("new-template-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([PRIORITY_FIELD]),
    });

    renderWithQueryClient(<TemplateFormView />);

    fireEvent.change(await screen.findByLabelText("messaging.templates.body"), {
      target: { value: "Hello" },
    });

    fireEvent.mouseDown(screen.getByRole("tab", { name: "messaging.templates.customFieldsTitle" }));

    const trigger = await screen.findByRole("combobox", { name: "Priority" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));

    // The picked option's label is echoed straight back as the trigger's own
    // displayed value -- proof the change round-tripped through
    // vm.updateCustomFieldValue and back into this controlled control.
    expect(screen.getByRole("combobox", { name: "Priority" })).toHaveTextContent("Medium");

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(extension.saveValues).toHaveBeenCalledWith(
        "communication.message-template",
        "new-template-id",
        { priority: "Medium" }
      )
    );
  });
});
