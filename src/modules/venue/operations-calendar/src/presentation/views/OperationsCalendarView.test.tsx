import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "@core/hooks/use-permission";
import { useOperationsCalendarViewModel } from "../viewmodels/useOperationsCalendarViewModel";
import { OperationsCalendarView } from "./OperationsCalendarView";

vi.mock("@core/hooks/use-module-locales", () => ({ useModuleLocales: vi.fn() }));
vi.mock("@core/hooks/use-permission", () => ({ usePermission: vi.fn() }));
vi.mock("@core/providers/i18n-provider", () => ({ useI18n: () => ({ t: (key: string) => key, language: "ar", direction: "rtl" }) }));
vi.mock("../viewmodels/useOperationsCalendarViewModel", () => ({ useOperationsCalendarViewModel: vi.fn() }));
vi.mock("../components/CalendarToolbar", () => ({ CalendarToolbar: () => <div data-testid="toolbar" /> }));
vi.mock("../components/ResourceTimeline", () => ({ ResourceTimeline: () => <div data-testid="timeline" /> }));

function vm(stage: "ready" | "featureUnavailable" | "error" = "ready") {
  return {
    state: { stage, day: stage === "ready" ? { blocks: [], isTruncated: false } : null, errorMessage: stage === "error" ? "offline" : null },
    setupLoading: false, facilities: [], allResources: [], visibleResources: [], resourcesTruncated: false, timeZoneOptions: [],
    facilityId: "", timeZoneId: "UTC", resourceId: "", date: "2026-09-09",
    setDate: vi.fn(), previousDay: vi.fn(), nextDay: vi.fn(), goToday: vi.fn(), setFacilityId: vi.fn(), setTimeZoneId: vi.fn(), setResourceId: vi.fn(), refresh: vi.fn(), openBlock: vi.fn(), createFromSlot: vi.fn(),
  };
}

describe("OperationsCalendarView", () => {
  beforeEach(() => {
    vi.mocked(usePermission).mockReturnValue(true);
    vi.mocked(useOperationsCalendarViewModel).mockReturnValue(vm() as never);
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
    expect(screen.getByRole("button", { name: "operationsCalendar.error.retry" })).toBeInTheDocument();
  });
});
