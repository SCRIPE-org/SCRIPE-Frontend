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
  it("walks through the 3 steps and submits configuration", async () => {
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

    // Step 1: WHERE (Facility & Location)
    expect(screen.getByText("1. WHERE")).toBeInTheDocument();
    expect(screen.getByLabelText("Facility / Location Name")).toBeInTheDocument();
    const branchInput = screen.getByDisplayValue("Nasr City");
    fireEvent.change(branchInput, { target: { value: "Sheikh Zayed" } });

    // Click Next Step
    fireEvent.click(screen.getByText("Next Step"));

    // Step 2: WHAT (Sport & Courts)
    expect(screen.getByText("2. WHAT")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Padel Court 1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("+ Add Another Court / Space"));
    expect(screen.getByDisplayValue("Padel Court 4")).toBeInTheDocument();

    // Click Next Step
    fireEvent.click(screen.getByText("Next Step"));

    // Step 3: WHEN & HOW MUCH (Schedule, Duration, Pricing, Review)
    expect(screen.getByText("3. WHEN & HOW MUCH")).toBeInTheDocument();
    expect(screen.getByText("Open 24 Hours (24/7)")).toBeInTheDocument();

    // Select 90 minutes
    fireEvent.click(screen.getByText("90 minutes"));

    // Change price
    const priceInput = screen.getByDisplayValue("800");
    fireEvent.change(priceInput, { target: { value: "950" } });

    // Both Save as Draft and Complete Setup & Publish are present
    expect(screen.getByText("Save as Draft")).toBeInTheDocument();
    expect(screen.getByText("Complete Setup & Publish")).toBeInTheDocument();

    // Submit via Complete Setup & Publish
    fireEvent.click(screen.getByText("Complete Setup & Publish"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          branchName: "Sheikh Zayed",
          isOpen247: true,
          slotDurationMinutes: 90,
          pricePerSlot: 950,
          publishImmediately: true,
        })
      );
    });

    // Step 4: Ready screen
    expect(await screen.findByText("Your Venue is Ready!")).toBeInTheDocument();
    expect(screen.getByText("Open Calendar")).toBeInTheDocument();
  });
});
