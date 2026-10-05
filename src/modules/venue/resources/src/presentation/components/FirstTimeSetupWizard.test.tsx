import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FirstTimeSetupWizard } from "./FirstTimeSetupWizard";

// Mock i18n
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue || key,
    language: "en",
  }),
}));

describe("FirstTimeSetupWizard", () => {
  it("walks through the 5 steps and submits configuration", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onOpenChange = vi.fn();

    render(
      <FirstTimeSetupWizard
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        submitting={false}
      />
    );

    // Step 1: Branch
    expect(screen.getByText("1. Branch")).toBeInTheDocument();
    expect(screen.getByLabelText("Branch Name")).toBeInTheDocument();
    const branchInput = screen.getByDisplayValue("Nasr City");
    fireEvent.change(branchInput, { target: { value: "Sheikh Zayed" } });

    // Click Next
    fireEvent.click(screen.getByText("Next Step"));

    // Step 2: Courts
    expect(screen.getByText("2. Courts")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Padel Court 1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("+ Add Another Court"));
    expect(screen.getByDisplayValue("Padel Court 4")).toBeInTheDocument();

    // Click Next
    fireEvent.click(screen.getByText("Next Step"));

    // Step 3: Working Hours
    expect(screen.getByText("3. Hours")).toBeInTheDocument();
    expect(screen.getByText("Open 24 Hours (24/7)")).toBeInTheDocument();

    // Click Next
    fireEvent.click(screen.getByText("Next Step"));

    // Step 4: Booking Slot
    expect(screen.getByText("4. Slot")).toBeInTheDocument();
    // Select 90 minutes
    fireEvent.click(screen.getByText("90 min"));

    // Click Next
    fireEvent.click(screen.getByText("Next Step"));

    // Step 5: Pricing
    expect(screen.getByText("5. Price")).toBeInTheDocument();
    const priceInput = screen.getByDisplayValue("800");
    fireEvent.change(priceInput, { target: { value: "950" } });

    // Submit
    fireEvent.click(screen.getByText("Complete Setup & Publish"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          branchName: "Sheikh Zayed",
          isOpen247: true,
          slotDurationMinutes: 90,
          pricePerSlot: 950,
        })
      );
    });

    // Ready screen
    expect(await screen.findByText("Your Venue is Ready!")).toBeInTheDocument();
    expect(screen.getByText("Open Calendar")).toBeInTheDocument();
  });
});
