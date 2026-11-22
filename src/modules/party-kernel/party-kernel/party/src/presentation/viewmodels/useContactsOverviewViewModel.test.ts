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

const { mockUsePermissionImpl, capturedQueryFnRef, mockInvalidateQueries } = vi.hoisted(() => ({
  mockUsePermissionImpl: vi.fn((_perm: string) => true),
  capturedQueryFnRef: { current: null as null | (() => Promise<unknown>) },
  mockInvalidateQueries: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => mockUsePermissionImpl(perm),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
  useQuery: (opts: { queryFn?: () => Promise<unknown> }) => {
    capturedQueryFnRef.current = opts.queryFn ?? null;
    return {
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
    };
  },
}));

describe("useContactsOverviewViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermissionImpl.mockImplementation(() => true);
    capturedQueryFnRef.current = null;
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

  it("gates mergeCandidateRepository.getAll behind merge-candidates.view permission (BUG-02)", async () => {
    mockPartyRepo.getAll.mockResolvedValue({ items: [], totalCount: 0 });
    mockMergeCandidateRepo.getAll.mockResolvedValue({ items: [], totalCount: 3 });

    mockUsePermissionImpl.mockImplementation((perm) => perm !== "merge-candidates.view");
    renderHook(() => useContactsOverviewViewModel());
    const unpermittedStats = (await capturedQueryFnRef.current?.()) as {
      duplicateAlertsCount: number;
      mergeCandidates: unknown[];
    };

    expect(mockMergeCandidateRepo.getAll).not.toHaveBeenCalled();
    expect(unpermittedStats.duplicateAlertsCount).toBe(0);
    expect(unpermittedStats.mergeCandidates).toEqual([]);

    mockUsePermissionImpl.mockImplementation(() => true);
    renderHook(() => useContactsOverviewViewModel());
    const permittedStats = (await capturedQueryFnRef.current?.()) as {
      duplicateAlertsCount: number;
    };

    expect(mockMergeCandidateRepo.getAll).toHaveBeenCalledWith({ page: 1, pageSize: 5 });
    expect(permittedStats.duplicateAlertsCount).toBe(3);
  });
});
