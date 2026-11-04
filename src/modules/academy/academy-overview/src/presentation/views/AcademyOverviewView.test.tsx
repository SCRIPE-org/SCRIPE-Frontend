import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { en } from "../../../locales/academy-overview.en";
import { AcademyOverviewView } from "./AcademyOverviewView";

const mockUsePermission = vi.fn();
const mockHasPermission = vi.fn();
const mockUseAcademyOverviewViewModel = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const parts = key.split(".");
      let val: any = en;
      for (const p of parts) {
        val = val?.[p];
      }
      return typeof val === "string" ? val : key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => mockUsePermission(perm),
  usePermissions: () => ({
    has: (perm: string) => mockHasPermission(perm),
  }),
}));

vi.mock("@modules/academy/di", () => ({
  useAcademyServiceLocator: () => ({
    overviewRepository: {},
  }),
}));

vi.mock("../viewmodels/useAcademyOverviewViewModel", () => ({
  useAcademyOverviewViewModel: () => mockUseAcademyOverviewViewModel(),
}));

describe("AcademyOverviewView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
    mockUseAcademyOverviewViewModel.mockReturnValue({
      state: { stage: "loading" },
      refreshing: false,
      refresh: vi.fn(),
    });
  });

  it("renders unauthorized state when user lacks academy-overview.view permission", () => {
    mockUsePermission.mockReturnValue(false);

    render(<AcademyOverviewView />);

    expect(screen.getByText("Access Restricted")).toBeInTheDocument();
  });

  it("renders loading spinner while overview is loading", () => {
    mockUsePermission.mockReturnValue(true);
    mockUseAcademyOverviewViewModel.mockReturnValue({
      state: { stage: "loading" },
      refreshing: false,
      refresh: vi.fn(),
    });

    render(<AcademyOverviewView />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders ready state with KPI cards and clickable workflow links", () => {
    mockUsePermission.mockReturnValue(true);
    mockUseAcademyOverviewViewModel.mockReturnValue({
      state: {
        stage: "ready",
        isEnabled: true,
        tenantId: "tenant-123",
        maxAthletes: -1,
        maxPrograms: -1,
        maxTrainingGroups: -1,
        activeProgramsCount: 0,
        activeOfferingsCount: 0,
        activeEnrollmentsCount: 0,
        pendingTrialsCount: 0,
        configuredFeatures: ["Programs", "Attendance"],
        statusMessage: "Foundation active",
        error: null,
      },
      refreshing: false,
      refresh: vi.fn(),
    });

    render(<AcademyOverviewView />);

    expect(screen.getByText("Academy Operations Command Center")).toBeInTheDocument();
    expect(screen.getByText("Configure First Program")).toBeInTheDocument();
    expect(screen.getByText("Register / Match Athlete")).toBeInTheDocument();
    expect(screen.getByText("Schedule Evaluation Trial")).toBeInTheDocument();

    // Verify workflows are wrapped in clickable Next.js links with correct hrefs
    const programLink = screen.getByRole("link", { name: /Configure First Program/i });
    expect(programLink).toHaveAttribute("href", "/academy/programs");

    const athleteLink = screen.getByRole("link", { name: /Register \/ Match Athlete/i });
    expect(athleteLink).toHaveAttribute("href", "/academy/athletes");
  });

  it("filters workflows based on user PBAC permissions", () => {
    mockUsePermission.mockReturnValue(true);
    mockHasPermission.mockImplementation((perm: string) => {
      // Coach has sessions and attendance view, but denied programs and enrollments view
      return perm === ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_VIEW ||
             perm === ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW;
    });

    mockUseAcademyOverviewViewModel.mockReturnValue({
      state: {
        stage: "ready",
        isEnabled: true,
        tenantId: "tenant-123",
        maxAthletes: -1,
        maxPrograms: -1,
        maxTrainingGroups: -1,
        activeProgramsCount: 0,
        activeOfferingsCount: 0,
        activeEnrollmentsCount: 0,
        pendingTrialsCount: 0,
        configuredFeatures: [],
        statusMessage: "Active",
        error: null,
      },
      refreshing: false,
      refresh: vi.fn(),
    });

    render(<AcademyOverviewView />);

    // Sessions and Attendance should be visible
    expect(screen.getByText("Training Sessions & Schedule")).toBeInTheDocument();
    expect(screen.getByText("Attendance Register")).toBeInTheDocument();

    // Programs and Athletes should be hidden
    expect(screen.queryByText("Configure First Program")).not.toBeInTheDocument();
    expect(screen.queryByText("Register / Match Athlete")).not.toBeInTheDocument();
  });

  it("renders error state with retry button when error occurs", () => {
    mockUsePermission.mockReturnValue(true);
    mockUseAcademyOverviewViewModel.mockReturnValue({
      state: {
        stage: "failed",
        error: "Failed to connect to gateway",
      },
      refreshing: false,
      refresh: vi.fn(),
    });

    render(<AcademyOverviewView />);

    expect(screen.getByText("Failed to load Academy overview")).toBeInTheDocument();
    expect(screen.getByText("Retry Connection")).toBeInTheDocument();
  });
});
