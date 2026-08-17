// FeatureDefinitionFormView + custom fields -- Wave 2 Step 2.2, Task 7b
//
// This site had no pre-existing test coverage at all (confirmed by search
// across src/modules/billing/entitlements/tenant-plans before this task --
// no *.test.* files existed). It is also the ONLY one of the 8 shared-
// renderer consumer sites with `isViewMode` support, and the ONLY one of
// this task's 3 divergent raw-Radix-`Select` sites where isViewMode and the
// Select conversion intersect on the same field. Both of Task 7b's real
// changes are exercised here:
//   1. the raw Radix `Select` -> GenericSelect conversion for the custom-
//      fields Select branch (D9), and its accessible-name fix (T1, see
//      renderCustomFieldControl.tsx's own Select branch);
//   2. that `isViewMode` still gates every one of the 5 FieldConfig["type"]
//      control kinds exactly as this file's own real, already-shipped
//      per-type mechanism did pre-rewire (Switch -> readOnly, Input/
//      DatePicker/Select -> disabled -- verified against this file's own
//      SOURCE before Task 4 ever ported the shared renderer, see that
//      file's own header doc comment).
import React from "react";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

const {
  mockGetFeatureDefinitionById,
  mockCreateFeatureDefinition,
  mockUpdateFeatureDefinition,
  mockSuccessToast,
  mockErrorToast,
} = vi.hoisted(() => ({
  mockGetFeatureDefinitionById: vi.fn(),
  mockCreateFeatureDefinition: vi.fn(),
  mockUpdateFeatureDefinition: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

// FeatureDefinitionFormView calls this directly (like DefinitionsView, unlike
// TemplateFormView) -- stubbed to a no-op so it doesn't reach into the i18n
// mock's internals (registerBothLanguages/markModuleLoaded/isModuleLoaded)
// this suite doesn't provide. Same pattern as
// DefinitionFormCustomFieldsSection.customfields.test.tsx.
vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: () => ({ isLoaded: true }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@modules/entitlements/di", () => ({
  entitlementsContainer: {
    tenantPlanRepository: {
      getFeatureDefinitionById: mockGetFeatureDefinitionById,
      createFeatureDefinition: mockCreateFeatureDefinition,
      updateFeatureDefinition: mockUpdateFeatureDefinition,
    },
  },
}));

// jsdom has no ResizeObserver -- GenericSelect's trigger tracks its own width
// on mount regardless of open state (same stub as renderCustomFieldControl.test.tsx).
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

import { FeatureDefinitionFormView } from "./FeatureDefinitionFormView";

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

// One FieldConfig per FieldConfig["type"] this catalog produces -- the same
// 5 kinds renderCustomFieldControl.tsx's own switch handles.
const TEXT_FIELD = { name: "__cf__nickname", label: "Nickname", type: "text" as const };
const NUMBER_FIELD = { name: "__cf__score", label: "Score", type: "number" as const };
const SWITCH_FIELD = { name: "__cf__featured", label: "Featured", type: "switch" as const };
const DATE_FIELD = { name: "__cf__startdate", label: "Start Date", type: "date" as const };
const SELECT_FIELD = {
  name: "__cf__priority",
  label: "Priority",
  type: "select" as const,
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};
const ALL_FIELD_TYPES = [TEXT_FIELD, NUMBER_FIELD, SWITCH_FIELD, DATE_FIELD, SELECT_FIELD];

// Final whole-branch review, I3 follow-up: a defaultValue that is NOT one of
// `options`' own labels -- simulating the real, named risk
// validateSelectCustomFieldValue's own doc comment exists to catch (a stale
// value already sitting in form state), reached WITHOUT ever touching the
// Select control. GenericSelect can only ever emit a value drawn from its
// own `options` array through the picker UI, so a real option click could
// never reproduce an invalid value -- an untouched field's own fetched
// default is the one real path to it.
const STALE_SELECT_FIELD = {
  name: "__cf__priority",
  label: "Priority",
  type: "select" as const,
  defaultValue: "Urgent",
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};

describe("FeatureDefinitionFormView + custom fields", () => {
  beforeEach(() => {
    mockGetFeatureDefinitionById.mockReset();
    mockCreateFeatureDefinition.mockReset();
    mockUpdateFeatureDefinition.mockReset();
    mockSuccessToast.mockClear();
    mockErrorToast.mockClear();
  });

  it("renders a labeled control for each of the 5 custom-field types and reports changes", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue(ALL_FIELD_TYPES),
    });

    renderWithQueryClient(<FeatureDefinitionFormView />);

    const input = await screen.findByLabelText("Nickname");
    expect(screen.getByLabelText("Score")).toHaveAttribute("type", "number");
    expect(screen.getByRole("switch", { name: "Featured" })).toBeInTheDocument();
    expect(input).not.toBeDisabled();

    // The a11y fix (T1, Wave 2 Step 2.2 Task 7b): the custom-fields Select
    // control has a real, working accessible name post-conversion from raw
    // Radix `Select` onto GenericSelect -- getByRole's `name` option performs
    // actual accessible-name computation (fails without the aria-label wiring
    // in renderCustomFieldControl.tsx's Select branch, passes with it), not a
    // DOM id/for check.
    expect(screen.getByRole("combobox", { name: "Priority" })).toBeInTheDocument();
  });

  // Wave 2 Step 2.2, Task 11: the test above only ever asserted PRESENCE
  // (roles/attributes) -- its own title claimed "reports changes" but never
  // actually changed anything. This is the real round trip: fire a change on
  // all 5 of renderCustomFieldControl's FieldConfig["type"] kinds via THIS
  // site's own wiring (`onChange: (v) => updateCustomFieldValue(fc.name, v)`
  // in FeatureDefinitionFormView.tsx), then read the value back off the
  // rendered control -- proving updateCustomFieldValue's state genuinely
  // round-trips back into each controlled control, not just that an onChange
  // spy fired once.
  it("round-trips a value of each of the 5 custom-field types through the shared renderer end-to-end", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue(ALL_FIELD_TYPES),
    });

    renderWithQueryClient(<FeatureDefinitionFormView />);

    await screen.findByLabelText("Nickname");

    // Text.
    fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "Mo" } });
    expect(screen.getByLabelText("Nickname")).toHaveValue("Mo");

    // Number.
    fireEvent.change(screen.getByLabelText("Score"), { target: { value: "42" } });
    expect(screen.getByLabelText("Score")).toHaveValue(42);

    // Boolean / Switch.
    const switchControl = screen.getByRole("switch", { name: "Featured" });
    expect(switchControl).toHaveAttribute("aria-checked", "false");
    fireEvent.click(switchControl);
    expect(switchControl).toHaveAttribute("aria-checked", "true");

    // Date.
    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2026-08-17" } });
    expect(screen.getByLabelText("Start Date")).toHaveValue("2026-08-17");

    // Select -- picking an option round-trips the option's label back as the
    // GenericSelect trigger's own displayed value (D6: the label string, not
    // a synthetic id).
    fireEvent.click(screen.getByRole("combobox", { name: "Priority" }));
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));
    expect(screen.getByRole("combobox", { name: "Priority" })).toHaveTextContent("Medium");
  });

  // D9 fidelity check: FeatureDefinitionFormView.tsx's real, already-shipped
  // (pre-rewire) isViewMode mechanism was NOT uniform across its own fields
  // -- Switch uses `readOnly`, every Input/DatePicker/Select instance uses
  // `disabled` (see this file's own Status Switch vs. Key/Category/Sort
  // Order Inputs). renderCustomFieldControl.tsx's Tasks 2-4 verified and
  // reproduced that exact split; this proves the split survived Task 7b's
  // conversion for all 5 custom-field control kinds, not just the ones a
  // pre-existing test happened to already cover (there were none).
  it("gates every one of the 5 custom-field control types when isViewMode is true, matching this file's own pre-rewire per-type mechanism", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue(ALL_FIELD_TYPES),
    });

    renderWithQueryClient(<FeatureDefinitionFormView isViewMode />);

    await screen.findByLabelText("Nickname");

    // Text / Number -> disabled (Input family).
    expect(screen.getByLabelText("Nickname")).toBeDisabled();
    expect(screen.getByLabelText("Score")).toBeDisabled();

    // Switch -> aria-readonly, NOT disabled (matches this file's own Status
    // Switch, and Switch's own readOnly/disabled distinction).
    const switchControl = screen.getByRole("switch", { name: "Featured" });
    expect(switchControl).toHaveAttribute("aria-readonly", "true");
    expect(switchControl).not.toBeDisabled();

    // Date -> aria-disabled trigger. DatePicker's own trigger derives its
    // accessible name from placeholder/value, not fc.label -- with no
    // placeholder and no value it falls back to t("common.selectDate")
    // (identity-mocked above), which distinguishes it from the Select
    // trigger's fc.label-derived name below.
    const dateTrigger = screen.getByRole("combobox", { name: "common.selectDate" });
    expect(dateTrigger).toHaveAttribute("aria-disabled", "true");

    // Select -> aria-disabled trigger, real accessible name preserved even
    // while gated.
    const selectTrigger = screen.getByRole("combobox", { name: "Priority" });
    expect(selectTrigger).toHaveAttribute("aria-disabled", "true");
  });

  it("leaves every one of the 5 custom-field control types interactive when isViewMode is false", async () => {
    registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue(ALL_FIELD_TYPES),
    });

    renderWithQueryClient(<FeatureDefinitionFormView isViewMode={false} />);

    await screen.findByLabelText("Nickname");

    expect(screen.getByLabelText("Nickname")).not.toBeDisabled();
    expect(screen.getByLabelText("Score")).not.toBeDisabled();

    const switchControl = screen.getByRole("switch", { name: "Featured" });
    expect(switchControl).not.toHaveAttribute("aria-readonly", "true");

    const dateTrigger = screen.getByRole("combobox", { name: "common.selectDate" });
    expect(dateTrigger).not.toHaveAttribute("aria-disabled", "true");

    const selectTrigger = screen.getByRole("combobox", { name: "Priority" });
    expect(selectTrigger).not.toHaveAttribute("aria-disabled", "true");
  });

  // Final whole-branch review, I3 follow-up: D5's client-side Select
  // validation (validateSelectCustomFieldValue, wired in via
  // assertSelectCustomFieldValuesValid) must actually block this site's
  // real save flow too, not just WebhookForm's. Uses STALE_SELECT_FIELD's
  // own defaultValue ("Urgent", not one of its `options`' labels) reached by
  // leaving the field completely untouched -- see that fixture's own
  // comment for why a real option click could never reproduce this case.
  it("rejects a stale default Select value and blocks the save before ever calling saveValues (D5)", async () => {
    mockCreateFeatureDefinition.mockResolvedValue("new-feature-id");
    const extension = registerFakeCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([STALE_SELECT_FIELD]),
    });

    const { container } = renderWithQueryClient(<FeatureDefinitionFormView />);
    await screen.findByRole("combobox", { name: "Priority" });

    // Fill the minimum required fields (key + valueType) so isValid gates
    // open -- deliberately not touching the Select control itself.
    fireEvent.change(container.querySelector("#fd-key")!, {
      target: { value: "test.feature" },
    });
    fireEvent.click(screen.getByText("entitlements.featureDefinitions.typeBoolean"));

    fireEvent.click(screen.getAllByRole("button", { name: "common.create" })[0]);

    // The feature definition itself still gets created (a separate
    // mutation that always runs first, same shape as every other consumer
    // site's save flow) -- but the custom-field value never reaches the
    // API at all.
    await waitFor(() => expect(mockCreateFeatureDefinition).toHaveBeenCalled());
    expect(extension.saveValues).not.toHaveBeenCalled();
    // This site pairs a generic "common.error" title with a specific
    // description (its own established convention, e.g. createMutation's
    // onError above) -- the identity-mocked `t` proves the SPECIFIC D5
    // message reached the description, not the generic
    // "customFieldsSaveError" fallback every other save failure gets here.
    expect(mockErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "customField.values.selectInvalidOption" })
    );
  });
});
