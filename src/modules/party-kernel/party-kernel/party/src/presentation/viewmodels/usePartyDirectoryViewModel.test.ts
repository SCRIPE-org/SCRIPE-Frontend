import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePartyDirectoryViewModel } from "./usePartyDirectoryViewModel";
import { Party } from "../../domain/entities/Party";

const mockPartyRepo = {
  getAll: vi.fn(),
  createPerson: vi.fn(),
  createOrganization: vi.fn(),
  updatePartyName: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../../../di", () => ({
  getPartyKernelContainer: () => ({
    partyRepository: mockPartyRepo,
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => {
  const mockInvalidateQueries = vi.fn();
  return {
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
    useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => {
      if (queryKey[0] === "parties-stats-summary") {
        return {
          data: { total: 2, people: 1, organizations: 1 },
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        };
      }
      return {
        data: {
          items: [
            new Party({
              id: "p1",
              type: "Person",
              displayName: "Dr. Fatima Zahra",
              createdAt: "2026-01-01T00:00:00Z",
            }),
            new Party({
              id: "p2",
              type: "Organization",
              displayName: "Riyadh Sports Hub",
              createdAt: "2026-01-02T00:00:00Z",
            }),
          ],
          totalCount: 2,
          totalPages: 1,
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    },
    useMutation: (config?: {
      mutationFn?: (args: unknown) => Promise<unknown>;
      onSuccess?: (res: unknown) => void;
    }) => ({
      mutateAsync: vi.fn(async (args: unknown) => {
        let result: unknown;
        if (config?.mutationFn) {
          result = await config.mutationFn(args);
        }
        if (config?.onSuccess) {
          config.onSuccess(result ?? "mock-id");
        }
        return result ?? "mock-id";
      }),
      isPending: false,
    }),
  };
});

describe("usePartyDirectoryViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default filters and items", () => {
    const { result } = renderHook(() => usePartyDirectoryViewModel());

    expect(result.current.selectedType).toBe("all");
    expect(result.current.viewMode).toBe("table");
    expect(result.current.page).toBe(1);
    expect(result.current.parties).toHaveLength(2);
    expect(result.current.stats.total).toBe(2);
  });

  it("updates filter chips and view modes", () => {
    const { result } = renderHook(() => usePartyDirectoryViewModel());

    act(() => {
      result.current.setSelectedType("Person");
    });
    expect(result.current.selectedType).toBe("Person");

    act(() => {
      result.current.setViewMode("grid");
    });
    expect(result.current.viewMode).toBe("grid");
  });

  it("controls create, edit, and delete dialog visibility", () => {
    const { result } = renderHook(() => usePartyDirectoryViewModel());

    act(() => {
      result.current.setIsCreatePersonOpen(true);
    });
    expect(result.current.isCreatePersonOpen).toBe(true);

    act(() => {
      result.current.setIsCreateOrgOpen(true);
    });
    expect(result.current.isCreateOrgOpen).toBe(true);

    const testParty = new Party({
      id: "p1",
      type: "Person",
      displayName: "Dr. Fatima Zahra",
      createdAt: "2026-01-01T00:00:00Z",
    });

    act(() => {
      result.current.setEditingParty(testParty);
    });
    expect(result.current.editingParty).toBe(testParty);

    act(() => {
      result.current.setDeletingParty(testParty);
    });
    expect(result.current.deletingParty).toBe(testParty);
  });

  it("dispatches person and organization creation mutations", async () => {
    mockPartyRepo.createPerson.mockResolvedValue("person-new-id");
    mockPartyRepo.createOrganization.mockResolvedValue("org-new-id");

    const { result } = renderHook(() => usePartyDirectoryViewModel());

    let personId: string = "";
    await act(async () => {
      personId = await result.current.handleCreatePerson({
        fullName: "New Athlete",
      });
    });
    expect(mockPartyRepo.createPerson).toHaveBeenCalledWith({
      fullName: "New Athlete",
    });
    expect(personId).toBe("person-new-id");

    let orgId: string = "";
    await act(async () => {
      orgId = await result.current.handleCreateOrganization({
        legalName: "Falcon Academy LLC",
      });
    });
    expect(mockPartyRepo.createOrganization).toHaveBeenCalledWith({
      legalName: "Falcon Academy LLC",
    });
    expect(orgId).toBe("org-new-id");
  });
});
