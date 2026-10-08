import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "next/navigation";
import { getVenueContainer } from "@modules/venue/di";
import { useOperationsCalendarViewModel } from "./useOperationsCalendarViewModel";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const facility = { id: "facility-1", name: "Downtown" };
const profile = {
  id: "profile-1",
  facilityId: "facility-1",
  name: "Indoor Court",
  resourceKindCode: "court",
  operatingPolicy: { timeZoneId: "Africa/Cairo" },
  usageTypes: [],
};
const resource = {
  id: "resource-1",
  name: "Court 1",
  facilityResourceProfileId: "profile-1",
  isPublished: true,
  isComposite: false,
};
const heldBlock = {
  reservationId: "reservation-1",
  reservationNumber: "RES-1",
  resourceId: "resource-1",
  status: "Held" as const,
  startUtc: "2026-09-09T07:00:00Z",
  endUtc: "2026-09-09T08:00:00Z",
  quantity: 1,
  customerPartyId: "party-1",
  holdExpiresAtUtc: "2026-09-09T08:30:00Z",
};
const day = {
  dateLocal: "2026-09-09",
  timeZoneId: "Africa/Cairo",
  fromUtc: "2026-09-08T21:00:00Z",
  toUtc: "2026-09-09T21:00:00Z",
  asOfUtc: "2026-09-09T06:00:00Z",
  isTruncated: false,
  blocks: [heldBlock],
};

function makeContainer() {
  return {
    facilityRepository: { getAll: vi.fn().mockResolvedValue({ items: [facility] }) },
    facilityResourceProfileRepository: { getAll: vi.fn().mockResolvedValue({ items: [profile] }) },
    schedulableResourceRepository: { getAll: vi.fn().mockResolvedValue({ items: [resource] }) },
    operationsCalendarRepository: { getDay: vi.fn().mockResolvedValue(day) },
    customerRepository: {
      getById: vi
        .fn()
        .mockResolvedValue({ id: "party-1", type: "Person", displayName: "Mona Hassan" }),
    },
    bookingRepository: { confirm: vi.fn().mockResolvedValue({ reservationId: "reservation-1" }) },
  };
}

describe("useOperationsCalendarViewModel", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-09-09T06:00:00Z"));
    vi.mocked(useRouter).mockReturnValue({ push } as never);
    push.mockReset();
  });

  afterEach(() => vi.useRealTimers());

  it("loads a bounded day for published leaf resources in the selected Facility timezone", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useOperationsCalendarViewModel());

    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    expect(container.operationsCalendarRepository.getDay).toHaveBeenCalledWith({
      dateLocal: "2026-09-09",
      timeZoneId: "Africa/Cairo",
      resourceIds: ["resource-1"],
    });
    expect(result.current.visibleResources[0].facilityName).toBe("Downtown");
  });

  it("invalidates stale day data when navigation or filters change", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useOperationsCalendarViewModel());
    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    act(() => result.current.nextDay());
    expect(result.current.state.day).toBeNull();
    await waitFor(() =>
      expect(container.operationsCalendarRepository.getDay).toHaveBeenLastCalledWith(
        expect.objectContaining({ dateLocal: "2026-09-10" })
      )
    );

    act(() => result.current.previousDay());
    await waitFor(() => expect(result.current.date).toBe("2026-09-09"));
    act(() => result.current.setResourceId("resource-1"));
    expect(result.current.state.day).toBeNull();

    act(() => result.current.goToday());
    await waitFor(() => expect(result.current.date).toBe("2026-09-09"));
  });

  it("preserves a setup network failure instead of replacing it with an empty calendar", async () => {
    const container = makeContainer();
    container.facilityRepository.getAll.mockRejectedValue(new Error("Facility API unavailable"));
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useOperationsCalendarViewModel());

    await waitFor(() => expect(result.current.state.stage).toBe("error"));
    expect(result.current.state.errorMessage).toBe("Facility API unavailable");
    expect(container.operationsCalendarRepository.getDay).not.toHaveBeenCalled();
  });

  it("opens the canonical Booking 360 route without duplicating detail composition", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useOperationsCalendarViewModel());
    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    act(() => result.current.openBlock(heldBlock));

    expect(push).toHaveBeenCalledWith("/venue/bookings/reservation-1");
    expect(container.customerRepository.getById).not.toHaveBeenCalled();
    expect(container.bookingRepository.confirm).not.toHaveBeenCalled();
  });

  it("navigates an empty slot to Booking Workspace prefill without creating a reservation", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useOperationsCalendarViewModel());
    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    act(() =>
      result.current.createFromSlot(result.current.visibleResources[0], "2026-09-09T07:30:00Z")
    );

    expect(push).toHaveBeenCalledWith(
      "/venue/bookings/new?facilityId=facility-1&resourceId=resource-1&date=2026-09-09&startTime=10%3A30&durationMinutes=60"
    );
    expect(container.bookingRepository).not.toHaveProperty("createDraft");
  });
});
