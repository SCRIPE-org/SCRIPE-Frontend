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
