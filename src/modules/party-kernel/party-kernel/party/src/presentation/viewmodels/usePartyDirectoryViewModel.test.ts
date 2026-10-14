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

const { mockInvalidateQueries, mockShowError } = vi.hoisted(() => ({
  mockInvalidateQueries: vi.fn(),
  mockShowError: vi.fn(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: mockShowError,
    warning: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => {
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
      if (queryKey[0] === "party-profile") {
        return {
          data: queryKey[1]
            ? {
                fullName: "Dr. Fatima Zahra Legal",
                rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
              }
            : undefined,
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
      onError?: (err: Error) => void;
    }) => ({
      mutateAsync: vi.fn(async (args: unknown) => {
        try {
          let result: unknown;
          if (config?.mutationFn) {
            result = await config.mutationFn(args);
          }
          if (config?.onSuccess) {
            config.onSuccess(result ?? "mock-id");
          }
          return result ?? "mock-id";
        } catch (err) {
          config?.onError?.(err as Error);
          throw err;
        }
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
    expect(result.current.editingPartyFullName).toBe("Dr. Fatima Zahra Legal");

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
    expect(mockPartyRepo.createPerson).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "New Athlete",
      })
    );
    expect(personId).toBe("person-new-id");

    let orgId: string = "";
    await act(async () => {
      orgId = await result.current.handleCreateOrganization({
        legalName: "Falcon Academy LLC",
      });
    });
    expect(mockPartyRepo.createOrganization).toHaveBeenCalledWith(
      expect.objectContaining({
        legalName: "Falcon Academy LLC",
      })
    );
    expect(orgId).toBe("org-new-id");
  });

  it("threads profile rowVersion and fullName when editing a Person from the directory and invalidates queries on 409 conflict", async () => {
    const testParty = new Party({
      id: "p1",
      type: "Person",
      displayName: "Dr. Fatima Zahra",
      createdAt: "2026-01-01T00:00:00Z",
    });

    const conflictErr = new Error(
      "The person record has been modified by another user or process. Please refresh and try again."
    ) as Error & { status?: number; details?: { statusCode?: number; errorCode?: string } };
    conflictErr.status = 409;
    conflictErr.details = { statusCode: 409, errorCode: "ENTITY_CONCURRENCY_CONFLICT" };
    mockPartyRepo.updatePartyName.mockRejectedValueOnce(conflictErr);

    const { result } = renderHook(() => usePartyDirectoryViewModel());

    act(() => {
      result.current.setEditingParty(testParty);
    });

    await expect(
      act(async () => {
        await result.current.handleUpdateName("p1", "Dr. Fatima Updated", {
          type: "Person",
          fullName: "Dr. Fatima Zahra Updated",
        });
      })
    ).rejects.toThrow("The person record has been modified by another user or process");

    expect(mockPartyRepo.updatePartyName).toHaveBeenCalledWith("p1", "Dr. Fatima Updated", {
      type: "Person",
      fullName: "Dr. Fatima Zahra Updated",
      rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["parties-directory"] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["party-profile"] });
    expect(mockShowError).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "party.toast.concurrencyConflict",
      })
    );
  });
});
