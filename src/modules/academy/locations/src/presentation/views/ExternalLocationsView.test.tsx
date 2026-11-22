import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExternalLocationsView } from "./ExternalLocationsView";

const viewModel = vi.hoisted(() => ({
  state: {
    stage: "ready" as "ready" | "loading" | "error",
    locations: [] as Array<Record<string, unknown>>,
    isCreateOpen: false,
    submitting: false,
    errorMessage: null as string | null,
  },
  reload: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ language: "en", t: (key: string) => key }),
}));
vi.mock("@core/hooks/use-permission", () => ({ usePermission: () => true }));
vi.mock("@modules/academy/di", () => ({
  useAcademyServiceLocator: () => ({ locationsRepository: {} }),
}));
vi.mock("../viewmodels/useExternalLocationsViewModel", () => ({
  useExternalLocationsViewModel: () => ({
    state: viewModel.state,
    reload: viewModel.reload,
    openCreateDialog: vi.fn(),
    closeCreateDialog: vi.fn(),
    createLocation: vi.fn(),
  }),
}));

describe("ExternalLocationsView operational data", () => {
  beforeEach(() => {
    viewModel.state.stage = "ready";
    viewModel.state.locations = [];
    viewModel.state.errorMessage = null;
    viewModel.reload.mockReset();
  });
  afterEach(cleanup);

  it("shows only locations returned by the Academy API", () => {
    viewModel.state.locations = [{
      id: "loc-real-1", nameEn: "East Ground", nameAr: "الملعب الشرقي",
      address: "10 East Street", contactName: null, contactPhone: null,
      notes: null, branchId: null, availabilityDisclaimer: "Availability unverified", isActive: true,
    }];
    render(<ExternalLocationsView />);
    expect(screen.getAllByText("East Ground").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10 East Street").length).toBeGreaterThan(0);
    expect(screen.queryByText("QA Field Beta")).toBeNull();
    expect(screen.queryByText("Main Sports Hall")).toBeNull();
    expect(screen.queryByText("Cap. 44")).toBeNull();
  });

  it("shows an empty state without fabricated locations", () => {
    render(<ExternalLocationsView />);
    expect(screen.getByText("No external locations found.")).toBeTruthy();
    expect(screen.queryByText("QA Field Beta")).toBeNull();
  });

  it("shows a fetch error with a retry action", () => {
    viewModel.state.stage = "error";
    viewModel.state.errorMessage = "Request failed";
    render(<ExternalLocationsView />);
    expect(screen.getByText("Request failed")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
