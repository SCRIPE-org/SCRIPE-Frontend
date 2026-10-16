/* eslint-disable @typescript-eslint/no-explicit-any */
// CreateLeadCustomFieldsSection -- Wave 2 Step 2.2, Task 11
//
// This site had NO component-level test coverage at all before this task --
// only useLeadsViewModel.customFields.test.tsx exists, and that exercises the
// viewmodel's own save/error-handling logic via renderHook, never mounting
// CreateLeadCustomFieldsSection itself or exercising renderCustomFieldControl
// through this site's real onChange wiring
// (`onChange: (v) => onCustomFieldChange(fc.name, v)`). This file closes that
// gap the same way TenantPlanStepCustomFields.test.tsx and
// SubmitDsrModal.customfields.test.tsx already do for their own sites: a
// direct render with props (this is a plain presentational component -- all
// state comes in via props, no internal viewmodel), proving all 5
// FieldConfig["type"] kinds round-trip through the shared renderer end-to-end.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { CreateLeadCustomFieldsSection } from "./CreateLeadCustomFieldsSection";

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
  name: "__cf__source",
  label: "Source",
  type: "select" as const,
  options: [
    { value: "Referral", label: "Referral" },
    { value: "Website", label: "Website" },
  ],
};
const ALL_FIELD_TYPES = [TEXT_FIELD, NUMBER_FIELD, SWITCH_FIELD, DATE_FIELD, SELECT_FIELD];

function renderSection(
  overrides: Partial<React.ComponentProps<typeof CreateLeadCustomFieldsSection>> = {}
) {
  return render(
    <CreateLeadCustomFieldsSection
      customFieldConfigs={[]}
      customFieldsLoading={false}
      customFieldValues={{}}
      onCustomFieldChange={vi.fn()}
      onCustomFieldsCreated={vi.fn()}
      {...overrides}
    />
  );
}

describe("CreateLeadCustomFieldsSection", () => {
  it("renders a text input for a custom field and reports changes", () => {
    registerFakeCustomFieldsExtension();
    const onCustomFieldChange = vi.fn();
    renderSection({
      customFieldConfigs: [{ name: "cf_nickname", type: "text", label: "Nickname" }],
      onCustomFieldChange,
    });

    fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "a" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("cf_nickname", "a");
  });

  // The core proof this task requires: round-tripping a value of each of the
  // 5 custom field types through the shared renderer end-to-end (render ->
  // change -> captured onCustomFieldChange value), through this site's own
  // real wiring (`onChange: (v) => onCustomFieldChange(fc.name, v)` in
  // CreateLeadCustomFieldsSection.tsx), not just the isolated unit-level
  // renderer tests.
  it("round-trips a value of each of the 5 custom field types through the shared renderer end-to-end", () => {
    registerFakeCustomFieldsExtension();
    const onCustomFieldChange = vi.fn();
    renderSection({ customFieldConfigs: ALL_FIELD_TYPES, onCustomFieldChange });

    fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "Mo" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__nickname", "Mo");

    fireEvent.change(screen.getByLabelText("Score"), { target: { value: "42" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__score", "42");

    fireEvent.click(screen.getByRole("switch", { name: "Featured" }));
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__featured", true);

    // Scoped to `input`: Wave 3.1 Task 12 gave the DatePicker trigger its own
    // real aria-label equal to the field's label, so a bare
    // `getByLabelText("Start Date")` is now ambiguous by design -- see
    // renderCustomFieldControl.tsx's Date branch.
    fireEvent.change(screen.getByLabelText("Start Date", { selector: "input" }), {
      target: { value: "2026-08-17" },
    });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__startdate", "2026-08-17");

    const trigger = screen.getByRole("combobox", { name: "Source" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Website" }));
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__source", "Website");
  });

  it("shows the empty-state message when there are no custom fields and not loading", () => {
    registerFakeCustomFieldsExtension();
    renderSection({ customFieldConfigs: [], customFieldsLoading: false });
    expect(screen.getByText("leads.createDialog.noCustomFields")).toBeInTheDocument();
  });

  it("does not show the empty-state message while loading", () => {
    registerFakeCustomFieldsExtension();
    renderSection({ customFieldConfigs: [], customFieldsLoading: true });
    expect(screen.queryByText("leads.createDialog.noCustomFields")).not.toBeInTheDocument();
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

    renderSection({ onCustomFieldsCreated });

    fireEvent.click(screen.getByText("inline-add"));
    expect(onCustomFieldsCreated).toHaveBeenCalled();
  });
});
