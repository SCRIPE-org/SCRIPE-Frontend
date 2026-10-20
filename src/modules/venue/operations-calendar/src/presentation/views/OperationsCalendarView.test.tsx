import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "@core/hooks/use-permission";
import { useOperationsCalendarViewModel } from "../viewmodels/useOperationsCalendarViewModel";
import { OperationsCalendarView } from "./OperationsCalendarView";

vi.mock("@core/hooks/use-module-locales", () => ({ useModuleLocales: vi.fn() }));
vi.mock("@core/hooks/use-permission", () => ({ usePermission: vi.fn() }));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "ar", direction: "rtl" }),
}));
vi.mock("../viewmodels/useOperationsCalendarViewModel", () => ({
  useOperationsCalendarViewModel: vi.fn(),
}));
vi.mock("../components/CalendarToolbar", () => ({
  CalendarToolbar: () => <div data-testid="toolbar" />,
}));
vi.mock("../components/ResourceTimeline", () => ({
  ResourceTimeline: () => <div data-testid="timeline" />,
}));

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));
vi.mock("../components/ClickToBookModal", () => ({
  ClickToBookModal: (props: any) =>
    props.open ? (
      <div
        data-testid="click-to-book-modal"
        data-resource-id={props.resource?.id}
        data-duration={props.durationMinutes}
        data-instant={props.instantUtc}
      />
    ) : null,
}));
vi.mock("../components/FindAvailableSlotsModal", () => ({
  FindAvailableSlotsModal: (props: any) =>
    props.open ? (
      <button
        data-testid="find-slots-select"
        onClick={() => props.onSelectSlot({ id: "res-padel-2", name: "Court 2", facilityId: "fac-1" }, "2026-10-15T10:00:00.000Z", 90)}
      >
        Select Slot
      </button>
    ) : null,
}));
vi.mock("../components/BlockTimeModal", () => ({
  BlockTimeModal: () => null,
}));

function vm(stage: "ready" | "featureUnavailable" | "error" = "ready") {
  const readyResource = {
    id: "res-padel-1",
    name: "Padel Court 1",
    facilityId: "fac-1",
    facilityName: "Main Branch",
    profileId: "prof-1",
    profileName: "Standard",
    resourceKindCode: "Padel",
    timeZoneId: "UTC",
    slotPolicy: { slotDurationMinutes: 60, allowMultiSlot: true },
  };
  return {
    state: {
      stage,
      day: stage === "ready" ? { blocks: [], isTruncated: false } : null,
      errorMessage: stage === "error" ? "offline" : null,
    },
    setupLoading: false,
    facilities: [{ id: "fac-1", name: "Main Branch" }],
    allResources: [readyResource],
    visibleResources: [readyResource],
    resourcesTruncated: false,
    timeZoneOptions: [],
    facilityId: "fac-1",
    timeZoneId: "UTC",
    resourceId: "",
    date: "2026-09-09",
    setDate: vi.fn(),
    previousDay: vi.fn(),
    nextDay: vi.fn(),
    goToday: vi.fn(),
    setFacilityId: vi.fn(),
    setTimeZoneId: vi.fn(),
    setResourceId: vi.fn(),
    refresh: vi.fn(),
    openBlock: vi.fn(),
    createFromSlot: vi.fn(),
  };
}

describe("OperationsCalendarView — Phase 3 Entry Points & Court Readiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.mocked(usePermission).mockReturnValue(true);
    vi.mocked(useOperationsCalendarViewModel).mockReturnValue(vm() as never);
    // Mock window.history.replaceState
    if (typeof window !== "undefined") {
      vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    }
  });

  it("keeps Arabic shell RTL while rendering the chronological timeline", () => {
    render(<OperationsCalendarView />);
    expect(screen.getByTestId("operations-calendar-view")).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("timeline")).toBeInTheDocument();
  });

  it("fails closed without a required read permission", () => {
    vi.mocked(usePermission).mockImplementation((permission) => permission !== "reservations.view");
    render(<OperationsCalendarView />);
    expect(screen.getByText("operationsCalendar.permission.title")).toBeInTheDocument();
    expect(screen.queryByTestId("operations-calendar-view")).not.toBeInTheDocument();
  });

  it("renders distinct feature-disabled and retryable network states", () => {
    vi.mocked(useOperationsCalendarViewModel).mockReturnValue(vm("featureUnavailable") as never);
    const { unmount } = render(<OperationsCalendarView />);
    expect(screen.getByText("operationsCalendar.feature.title")).toBeInTheDocument();
    unmount();
    vi.mocked(useOperationsCalendarViewModel).mockReturnValue(vm("error") as never);
    render(<OperationsCalendarView />);
    expect(screen.getByText("offline")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "operationsCalendar.error.retry" })
    ).toBeInTheDocument();
  });

  it("Entry Mode B/C/E: deep link with newBooking=true and valid resourceId opens ClickToBookModal and cleans URL", () => {
    mockSearchParams = new URLSearchParams({
      newBooking: "true",
      resourceId: "res-padel-1",
      date: "2026-10-15",
      startTime: "14:00",
      durationMinutes: "90",
    });

    render(<OperationsCalendarView />);
    expect(screen.getByTestId("click-to-book-modal")).toBeInTheDocument();
    expect(screen.getByTestId("click-to-book-modal")).toHaveAttribute("data-resource-id", "res-padel-1");
    expect(screen.getByTestId("click-to-book-modal")).toHaveAttribute("data-duration", "90");
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it("Court Readiness Protection: unready/invalid resourceId fails closed with warning alert and does NOT open booking modal", () => {
    mockSearchParams = new URLSearchParams({
      newBooking: "true",
      resourceId: "unready-or-draft-court",
    });

    render(<OperationsCalendarView />);
    expect(screen.queryByTestId("click-to-book-modal")).not.toBeInTheDocument();
    expect(screen.getByText("operationsCalendar.readiness.courtNotReady")).toBeInTheDocument();
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it("Branch Reconciliation: court belonging to another branch updates facility context deliberately", () => {
    const customVm = vm();
    const courtInBranch2 = {
      id: "res-branch-2",
      name: "Branch 2 Court",
      facilityId: "fac-2",
      facilityName: "Second Branch",
      profileId: "prof-2",
      profileName: "Standard",
      resourceKindCode: "Padel",
      timeZoneId: "UTC",
      slotPolicy: {
        slotDurationMinutes: 60,
        allowMultiSlot: true,
      },
    };
    customVm.allResources = [customVm.allResources[0], courtInBranch2];
    vi.mocked(useOperationsCalendarViewModel).mockReturnValue(customVm as never);

    mockSearchParams = new URLSearchParams({
      newBooking: "true",
      resourceId: "res-branch-2",
    });

    render(<OperationsCalendarView />);
    expect(customVm.setFacilityId).toHaveBeenCalledWith("fac-2");
    expect(screen.getByTestId("click-to-book-modal")).toBeInTheDocument();
    expect(screen.getByTestId("click-to-book-modal")).toHaveAttribute("data-resource-id", "res-branch-2");
  });
});
