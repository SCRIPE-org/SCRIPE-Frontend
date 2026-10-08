import { render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { BookingChangeResourceDialog } from "./BookingChangeResourceDialog";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const t = (key: string, values?: Record<string, string | number>) =>
  Object.entries(values ?? {}).reduce(
    (message, [name, value]) => message.replace(`{{${name}}}`, String(value)),
    key
  );

describe("BookingChangeResourceDialog candidate authority", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filters out unavailable or undiscovered resources and only presents authoritatively available candidates", async () => {
    const mockSchedulableResourceRepository = {
      getAll: vi.fn().mockResolvedValue({
        items: [
          { id: "court-1", isPublished: true, isComposite: false, facilityResourceProfileId: "profile-1" },
          { id: "court-2", isPublished: true, isComposite: false, facilityResourceProfileId: "profile-1" },
          { id: "court-3", isPublished: true, isComposite: false, facilityResourceProfileId: "profile-2" }, // Different facility
        ],
        totalCount: 3,
      }),
    };

    const mockFacilityResourceProfileRepository = {
      getAll: vi.fn().mockResolvedValue({
        items: [
          { id: "profile-1", facilityId: "facility-1" },
          { id: "profile-2", facilityId: "facility-2" },
        ],
        totalCount: 2,
      }),
    };

    const mockAvailabilityRepository = {
      search: vi.fn().mockImplementation(async (input: { resourceId: string }) => {
        if (input.resourceId === "court-1") {
          return {
            resourceId: "court-1",
            resourceName: "Court 1 (Available)",
            timeZoneId: "UTC",
            startUtc: "2026-09-10T10:00:00Z",
            endUtc: "2026-09-10T11:00:00Z",
            requestedQuantity: 1,
            isAvailable: true,
            decidingLayer: "BaseCalendar",
            reasonCode: "AVAILABLE",
            maximumCapacity: 1,
            consumedCapacity: 0,
            remainingCapacity: 1,
            asOfUtc: "2026-09-10T09:00:00Z",
          };
        }
        // court-2 returns isAvailable: false
        return {
          resourceId: "court-2",
          resourceName: "Court 2 (Occupied)",
          timeZoneId: "UTC",
          startUtc: "2026-09-10T10:00:00Z",
          endUtc: "2026-09-10T11:00:00Z",
          requestedQuantity: 1,
          isAvailable: false,
          decidingLayer: "BaseCalendar",
          reasonCode: "FULLY_BOOKED",
          maximumCapacity: 1,
          consumedCapacity: 1,
          remainingCapacity: 0,
          asOfUtc: "2026-09-10T09:00:00Z",
        };
      }),
    };

    vi.mocked(getVenueContainer).mockReturnValue({
      schedulableResourceRepository: mockSchedulableResourceRepository,
      facilityResourceProfileRepository: mockFacilityResourceProfileRepository,
      availabilityRepository: mockAvailabilityRepository,
    } as never);

    const props: ComponentProps<typeof BookingChangeResourceDialog> = {
      open: true,
      onOpenChange: vi.fn(),
      facilityId: "facility-1",
      currentResourceId: "court-0",
      currentResourceName: "Court 0 (Original)",
      currentFacilityName: "Main Arena",
      currentStartUtc: "2026-09-10T10:00:00Z",
      currentEndUtc: "2026-09-10T11:00:00Z",
      timeZoneId: "UTC",
      quantity: 1,
      direction: "ltr",
      disabled: false,
      t,
      onConfirmChangeResource: vi.fn(),
    };

    render(<BookingChangeResourceDialog {...props} />);

    // Wait for candidate discovery and availability search to complete
    await waitFor(() => {
      expect(screen.getByTestId("change-resource-candidates")).toBeInTheDocument();
    });

    // Authoritatively available court-1 must be presented
    expect(screen.getByText("Court 1 (Available)")).toBeInTheDocument();

    // Occupied court-2 must NOT be presented despite being in the facility
    expect(screen.queryByText("Court 2 (Occupied)")).not.toBeInTheDocument();

    // court-3 in different facility must NOT be queried or presented
    expect(screen.queryByText("court-3")).not.toBeInTheDocument();
  });
});
