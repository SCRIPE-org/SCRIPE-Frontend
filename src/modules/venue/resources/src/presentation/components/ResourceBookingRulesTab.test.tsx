import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceBookingRulesTab } from "./ResourceBookingRulesTab";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
  }),
}));

describe("ResourceBookingRulesTab", () => {
  let mockVm: any;

  beforeEach(() => {
    mockVm = {
      saving: false,
      resource: {
        id: "res-1",
        slotPolicy: {
          slotDurationMinutes: 60,
          startIncrementMinutes: 60,
          allowMultiSlot: false,
        },
      },
      updateBookingRules: vi.fn().mockResolvedValue(true),
    };
  });

  it("renders slot duration buttons and highlights the current duration", () => {
    render(<ResourceBookingRulesTab vm={mockVm} />);

    expect(screen.getByText("60 minutes (Standard)")).toBeInTheDocument();
    expect(screen.getByText("90 minutes")).toBeInTheDocument();
  });

  it("changes duration when another option is selected", () => {
    render(<ResourceBookingRulesTab vm={mockVm} />);

    fireEvent.click(screen.getByText("90 minutes"));
    fireEvent.click(screen.getByRole("button", { name: "Save Booking Rules" }));

    expect(mockVm.updateBookingRules).toHaveBeenCalledWith(
      expect.objectContaining({
        slotDurationMinutes: 90,
        startIncrementMinutes: 90,
      })
    );
  });

  it("renders multiple consecutive slots checkbox and toggles it", () => {
    render(<ResourceBookingRulesTab vm={mockVm} />);

    const checkbox = screen.getByLabelText(/Allow Multiple Consecutive Slots/i);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Save Booking Rules" }));

    expect(mockVm.updateBookingRules).toHaveBeenCalledWith(
      expect.objectContaining({
        allowMultiSlot: true,
      })
    );
  });

  it("disables save button when vm is saving", () => {
    mockVm.saving = true;
    render(<ResourceBookingRulesTab vm={mockVm} />);

    expect(screen.getByRole("button", { name: "Save Booking Rules" })).toBeDisabled();
  });
});
