import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// jsdom has no ResizeObserver -- SubmitDsrModal's own request-type/regulation
// fields already use Radix-backed GenericSelect, which calls it on mount.
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

import { SubmitDsrModal } from "./SubmitDsrModal";

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
  name: "__cf__priority2",
  label: "Priority Level",
  type: "select" as const,
  options: [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
  ],
};
const ALL_FIELD_TYPES = [TEXT_FIELD, NUMBER_FIELD, SWITCH_FIELD, DATE_FIELD, SELECT_FIELD];

function baseProps(overrides: Partial<React.ComponentProps<typeof SubmitDsrModal>> = {}) {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    isSubmitting: false,
    customFieldConfigs: [],
    customFieldsLoading: false,
    customFieldValues: {},
    onCustomFieldChange: vi.fn(),
    onCustomFieldsCreated: vi.fn(),
    ...overrides,
  };
}

describe("SubmitDsrModal + custom fields", () => {
  beforeEach(() => {
    registerFakeCustomFieldsExtension();
  });

  it("renders a labeled input for each custom field definition and reports typing via onCustomFieldChange", async () => {
    const onCustomFieldChange = vi.fn();
    render(
      <SubmitDsrModal
        {...baseProps({ customFieldConfigs: [PRIORITY_FIELD], onCustomFieldChange })}
      />
    );

    const input = await screen.findByLabelText("Priority");
    fireEvent.change(input, { target: { value: "High" } });

    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__priority", "High");
  });

  // Wave 2 Step 2.2, Task 11: the test above only ever exercised the Text
  // branch. This proves the other 4 FieldConfig["type"] kinds round-trip
  // through renderCustomFieldControl's shared branches end-to-end (render ->
  // change -> captured onCustomFieldChange value) through THIS site's own
  // wiring, not just the isolated unit-level renderer tests.
  it("round-trips a value of each of the 5 custom field types through the shared renderer end-to-end", async () => {
    const onCustomFieldChange = vi.fn();
    render(
      <SubmitDsrModal
        {...baseProps({ customFieldConfigs: ALL_FIELD_TYPES, onCustomFieldChange })}
      />
    );

    fireEvent.change(await screen.findByLabelText("Nickname"), { target: { value: "Mo" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__nickname", "Mo");

    fireEvent.change(screen.getByLabelText("Score"), { target: { value: "42" } });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__score", "42");

    fireEvent.click(screen.getByRole("switch", { name: "Featured" }));
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__featured", true);

    // Scoped to `input`: Wave 3.1 Task 12 gave the DatePicker trigger its own
    // real aria-label equal to the field's label (fixing a pre-existing
    // "generic selectDate" accessible-name defect), so a bare
    // `getByLabelText("Start Date")` is now ambiguous -- it also matches the
    // visible trigger, by design (see renderCustomFieldControl.tsx's Date
    // branch and its own test file for the fix this is a direct consequence
    // of).
    fireEvent.change(screen.getByLabelText("Start Date", { selector: "input" }), {
      target: { value: "2026-08-17" },
    });
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__startdate", "2026-08-17");

    const trigger = screen.getByRole("combobox", { name: "Priority Level" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));
    expect(onCustomFieldChange).toHaveBeenCalledWith("__cf__priority2", "Medium");
  });

  it("shows the empty-state message when there are no custom fields and loading has settled", () => {
    render(<SubmitDsrModal {...baseProps({ customFieldConfigs: [], customFieldsLoading: false })} />);

    expect(screen.getByText("compliance.noCustomFields")).toBeInTheDocument();
  });

  it("does not show the empty-state message while still loading", () => {
    render(<SubmitDsrModal {...baseProps({ customFieldConfigs: [], customFieldsLoading: true })} />);

    expect(screen.queryByText("compliance.noCustomFields")).not.toBeInTheDocument();
  });

  it("submits typed custom field values by forwarding form data to onSubmit and closes on success", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(
      <SubmitDsrModal
        {...baseProps({
          onSubmit,
          onOpenChange,
          customFieldConfigs: [PRIORITY_FIELD],
          customFieldValues: { __cf__priority: "High" },
        })}
      />
    );

    fireEvent.change(screen.getByLabelText("compliance.subjectEmail"), {
      target: { value: "subject@example.com" },
    });
    fireEvent.click(screen.getByText("compliance.submitDsr", { selector: "#dsr-submit-confirm" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ subjectEmail: "subject@example.com" });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("stays open and does not reset when onSubmit rejects (useDsrViewModel already toasted why)", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"));
    const onOpenChange = vi.fn();
    render(
      <SubmitDsrModal
        {...baseProps({
          onSubmit,
          onOpenChange,
          customFieldConfigs: [PRIORITY_FIELD],
        })}
      />
    );

    fireEvent.change(screen.getByLabelText("compliance.subjectEmail"), {
      target: { value: "subject@example.com" },
    });
    fireEvent.click(screen.getByText("compliance.submitDsr", { selector: "#dsr-submit-confirm" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    // The email the user typed is still there -- nothing was reset.
    expect(screen.getByLabelText("compliance.subjectEmail")).toHaveValue("subject@example.com");
  });

  it("renders the inline add-custom-field trigger and reports creation via onCustomFieldsCreated", async () => {
    const onCustomFieldsCreated = vi.fn();
    registerFakeCustomFieldsExtension({
      InlineAddTrigger: ({ onCreated }) => (
        <button type="button" onClick={onCreated}>
          inline-add
        </button>
      ),
    });

    render(<SubmitDsrModal {...baseProps({ onCustomFieldsCreated })} />);

    fireEvent.click(screen.getByText("inline-add"));
    expect(onCustomFieldsCreated).toHaveBeenCalled();
  });
});
