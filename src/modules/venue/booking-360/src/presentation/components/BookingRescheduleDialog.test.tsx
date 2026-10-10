import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { BookingRescheduleDialog } from "./BookingRescheduleDialog";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const t = (key: string, values?: Record<string, string | number>) =>
  Object.entries(values ?? {}).reduce(
    (message, [name, value]) => message.replace(`{{${name}}}`, String(value)),
    key
  );

describe("BookingRescheduleDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("searches availability and renders candidates and review step with price delta", async () => {
    const mockAvailabilityRepository = {
      search: vi.fn().mockResolvedValue({
        resourceId: "court-1",
        resourceName: "Court 1",
        timeZoneId: "UTC",
        startUtc: "2026-09-11T14:00:00Z",
        endUtc: "2026-09-11T15:00:00Z",
        requestedQuantity: 1,
        isAvailable: true,
        decidingLayer: "BaseCalendar",
        reasonCode: "AVAILABLE",
        maximumCapacity: 1,
        consumedCapacity: 0,
        remainingCapacity: 1,
        asOfUtc: "2026-09-10T09:00:00Z",
      }),
    };
    vi.mocked(getVenueContainer).mockReturnValue({
      availabilityRepository: mockAvailabilityRepository,
    } as never);

    const onConfirm = vi.fn();
    render(
      <BookingRescheduleDialog
        open={true}
        onOpenChange={vi.fn()}
        resourceId="court-1"
        resourceName="Court 1"
        facilityName="Main Branch"
        currentStartUtc="2026-09-10T10:00:00Z"
        currentEndUtc="2026-09-10T11:00:00Z"
        timeZoneId="UTC"
        quantity={1}
        direction="ltr"
        disabled={false}
        currentTotal={500}
        currencyCode="EGP"
        t={t}
        onConfirmReschedule={onConfirm}
      />
    );

    expect(screen.getByTestId("reschedule-current-context")).toBeInTheDocument();

    const searchBtn = screen.getByRole("button", { name: "booking360.reschedule.search" });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByTestId("reschedule-candidates")).toBeInTheDocument();
    });

    const candidateBtn = screen.getByText("Court 1").closest("button");
    fireEvent.click(candidateBtn!);

    expect(screen.getByTestId("reschedule-review-step")).toBeInTheDocument();
    expect(screen.getByTestId("reschedule-price-delta")).toBeInTheDocument();
    expect(screen.getByText("booking360.reschedule.priceOld:")).toBeInTheDocument();
    expect(screen.getByText("booking360.reschedule.priceNew:")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "booking360.reschedule.confirm" });
    fireEvent.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      resourceId: "court-1",
      requestedStartUtc: "2026-09-11T14:00:00Z",
      requestedEndUtc: "2026-09-11T15:00:00Z",
    });
  });
});
