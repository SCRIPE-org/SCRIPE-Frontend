import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContactsOverviewViewModel } from "./useContactsOverviewViewModel";
import { Party } from "../../domain/entities/Party";
import { MergeCandidate } from "../../../../merge-candidate/src/domain/entities/MergeCandidate";

const mockPartyRepo = {
  getAll: vi.fn(),
  createPerson: vi.fn(),
  createOrganization: vi.fn(),
};

const mockMergeCandidateRepo = {
  getAll: vi.fn(),
};

vi.mock("../../../../di", () => ({
  getPartyKernelContainer: () => ({
    partyRepository: mockPartyRepo,
    mergeCandidateRepository: mockMergeCandidateRepo,
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

const { mockInvalidateQueries } = vi.hoisted(() => ({
  mockInvalidateQueries: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
  useQuery: () => ({
    data: {
      totalContacts: 42,
      peopleCount: 30,
      organizationsCount: 12,
      duplicateAlertsCount: 1,
      recentContacts: [
        new Party({
          id: "p-recent-1",
          type: "Person",
          displayName: "Dr. Fatima Zahra",
          createdAt: "2026-03-01T00:00:00Z",
        }),
      ],
      mergeCandidates: [
        new MergeCandidate({
          id: "mc-1",
          primaryPartyId: "p-recent-1",
          duplicatePartyId: "p-dup-2",
          status: "Pending",
          reason: "Phone match",
          matchScore: 0.92,
          createdAt: "2026-03-01T00:00:00Z",
        }),
      ],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe("useContactsOverviewViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes live KPI counts, recent contacts, and merge candidates", () => {
    const { result } = renderHook(() => useContactsOverviewViewModel());

    expect(result.current.totalContacts).toBe(42);
    expect(result.current.peopleCount).toBe(30);
    expect(result.current.organizationsCount).toBe(12);
    expect(result.current.duplicateAlertsCount).toBe(1);
    expect(result.current.recentContacts).toHaveLength(1);
    expect(result.current.recentContacts[0].displayName).toBe("Dr. Fatima Zahra");
    expect(result.current.mergeCandidates).toHaveLength(1);
  });

  it("creates person and organization from overview quick actions and invalidates queries", async () => {
    mockPartyRepo.createPerson.mockResolvedValue("new-person-id");
    mockPartyRepo.createOrganization.mockResolvedValue("new-org-id");

    const { result } = renderHook(() => useContactsOverviewViewModel());

    act(() => {
      result.current.setIsCreatePersonOpen(true);
    });
    expect(result.current.isCreatePersonOpen).toBe(true);

    let createdPersonId = "";
    await act(async () => {
      createdPersonId = await result.current.handleCreatePerson({
        fullName: "Tariq Al-Mansoor",
      });
    });

    expect(createdPersonId).toBe("new-person-id");
    expect(result.current.isCreatePersonOpen).toBe(false);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["party-overview-stats"],
    });

    act(() => {
      result.current.setIsCreateOrgOpen(true);
    });
    expect(result.current.isCreateOrgOpen).toBe(true);

    let createdOrgId = "";
    await act(async () => {
      createdOrgId = await result.current.handleCreateOrganization({
        legalName: "Riyadh Falcons LLC",
        displayName: "Riyadh Falcons",
      });
    });

    expect(createdOrgId).toBe("new-org-id");
    expect(result.current.isCreateOrgOpen).toBe(false);
  });
});
