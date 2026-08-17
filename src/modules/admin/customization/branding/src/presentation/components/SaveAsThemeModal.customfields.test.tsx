// SaveAsThemeModal -- Wave 2 Step 2.2, Task 11
//
// This site had NO test coverage of any kind before this task -- confirmed by
// search across src/modules/admin/customization/branding (no *.test.* files
// existed anywhere in the module). It is a plain presentational component
// (all custom-fields state comes in via props, no internal viewmodel/hook),
// which makes it straightforward to exercise directly, the same way
// TenantPlanStepCustomFields.test.tsx and SubmitDsrModal.customfields.test.tsx
// already do for their own sites: a direct render with props, proving all 5
// FieldConfig["type"] kinds round-trip through the shared renderer end-to-end
// via this site's own real wiring
// (`onChange: (v) => onCustomFieldChange(fc.name, v)`).
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { SaveAsThemeModal } from "./SaveAsThemeModal";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
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

// jsdom also has no scrollIntoView -- cmdk calls it on the highlighted row's
// layout effect as soon as a GenericSelect panel's option list mounts.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
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

// One FieldConfig per FieldConfig["type"] this catalog produces -- same 5
// kinds renderCustomFieldControl.tsx's own switch handles.
const TEXT_FIELD = { name: "__cf__nickname", label: "Nickname", type: "text" as const };
const NUMBER_FIELD = { name: "__cf__score", label: "Score", type: "number" as const };
const SWITCH_FIELD = { name: "__cf__featured", label: "Featured", type: "switch" as const };
const DATE_FIELD = { name: "__cf__startdate", label: "Start Date", type: "date" as const };
const SELECT_FIELD = {
  name: "__cf__mood",
  label: "Mood",
  type: "select" as const,
  options: [
    { value: "Bold", label: "Bold" },
    { value: "Calm", label: "Calm" },
  ],
};
const ALL_FIELD_TYPES = [TEXT_FIELD, NUMBER_FIELD, SWITCH_FIELD, DATE_FIELD, SELECT_FIELD];

function renderModal(overrides: Partial<React.ComponentProps<typeof SaveAsThemeModal>> = {}) {
  return render(
    <SaveAsThemeModal
      isOpen
      onClose={vi.fn()}
      getDraftJson={() => JSON.stringify({ tokens: { "color.primary": "#123456" } })}
      onSaveTheme={vi.fn().mockResolvedValue(undefined)}
      customFieldConfigs={[]}
      customFieldsLoading={false}
      customFieldValues={{}}
      onCustomFieldChange={vi.fn()}
      onCustomFieldsCreated={vi.fn()}
      {...overrides}
    />
  );
}

describe("SaveAsThemeModal + custom fields", () => {
  it("renders a text input for a custom field and reports changes", () => {
    registerFakeCustomFieldsExtension();
    const onCustomFieldChange = vi.fn();
    renderModal({
      customFieldConfigs: [{ name: "cf_nickname", type: "text", label: "Nickname" }],
      onCustomFieldChange,
    });

    fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "a" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("cf_nickname", "a");
  });

  // The core proof this task requires: round-tripping a value of each of the
  // 5 custom field types through the shared renderer end-to-end (render ->
  // change -> captured onCustomFieldChange value), through this site's own
  // real wiring, not just the isolated unit-level renderer tests.
  it("round-trips a value of each of the 5 custom field types through the shared renderer end-to-end", () => {
    registerFakeCustomFieldsExtension();
    const onCustomFieldChange = vi.fn();
    renderModal({ customFieldConfigs: ALL_FIELD_TYPES, onCustomFieldChange });

    fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "Mo" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__nickname", "Mo");

    fireEvent.change(screen.getByLabelText("Score"), { target: { value: "42" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__score", "42");

    fireEvent.click(screen.getByRole("switch", { name: "Featured" }));
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__featured", true);

    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2026-08-17" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__startdate", "2026-08-17");

    const trigger = screen.getByRole("combobox", { name: "Mood" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Calm" }));
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__mood", "Calm");
  });

  it("shows the empty-state message when there are no custom fields and not loading", () => {
    registerFakeCustomFieldsExtension();
    renderModal({ customFieldConfigs: [], customFieldsLoading: false });
    expect(screen.getByText("studio.saveTheme.noCustomFields")).toBeInTheDocument();
  });

  it("does not show the empty-state message while loading", () => {
    registerFakeCustomFieldsExtension();
    renderModal({ customFieldConfigs: [], customFieldsLoading: true });
    expect(screen.queryByText("studio.saveTheme.noCustomFields")).not.toBeInTheDocument();
  });

  it("renders the inline add-custom-field trigger and reports creation via onCustomFieldsCreated", () => {
    const onCustomFieldsCreated = vi.fn();
    registerFakeCustomFieldsExtension({
      InlineAddTrigger: ({ onCreated }) => (
        <button type="button" onClick={onCreated}>
          inline-add
        </button>
      ),
    });

    renderModal({ onCustomFieldsCreated });

    fireEvent.click(screen.getByText("inline-add"));
    expect(onCustomFieldsCreated).toHaveBeenCalled();
  });
});
