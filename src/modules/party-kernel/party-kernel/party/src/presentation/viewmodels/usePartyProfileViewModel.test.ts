import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePartyProfileViewModel } from "./usePartyProfileViewModel";
import { Party } from "../../domain/entities/Party";
import { PartyProfile } from "../../domain/entities/PartyProfile";

const { mockInvalidateQueries, mockShowError } = vi.hoisted(() => ({
  mockInvalidateQueries: vi.fn(),
  mockShowError: vi.fn(),
}));

const mockPartyRepo = {
  getProfile: vi.fn(),
  updatePartyName: vi.fn(),
  updatePerson: vi.fn(),
  addContactPoint: vi.fn(),
  updateContactPoint: vi.fn(),
  removeContactPoint: vi.fn(),
  addRole: vi.fn(),
  removeRole: vi.fn(),
  addRelationship: vi.fn(),
  removeRelationship: vi.fn(),
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
    error: mockShowError,
  }),
}));

const testParty = new Party({
  id: "test-p1",
  type: "Person",
  displayName: "Nasser Al-Dawsari",
  createdAt: "2026-02-01T00:00:00Z",
});

let activeTestProfile = new PartyProfile({
  party: testParty,
  person: null,
  organization: null,
  contactPoints: [],
  roles: [],
  relationships: [],
  mergeCandidates: [],
});

vi.mock("@tanstack/react-query", () => {
  return {
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
    useQuery: () => ({
      data: activeTestProfile,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }),
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
            config.onSuccess(result ?? "mock-res");
          }
          return result ?? "mock-res";
        } catch (err) {
          config?.onError?.(err as Error);
          throw err;
        }
      }),
      isPending: false,
    }),
  };
});

describe("usePartyProfileViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeTestProfile = new PartyProfile({
      party: testParty,
      person: null,
      organization: null,
      contactPoints: [],
      roles: [],
      relationships: [],
      mergeCandidates: [],
    });
  });

  it("loads profile and initializes with overview tab", () => {
    const { result } = renderHook(() => usePartyProfileViewModel("test-p1"));

    expect(result.current.profile).toBe(activeTestProfile);
    expect(result.current.activeTab).toBe("overview");
  });

  it("switches tabs across the 5 workspace tabs", () => {
    const { result } = renderHook(() => usePartyProfileViewModel("test-p1"));

    act(() => {
      result.current.setActiveTab("contacts");
    });
    expect(result.current.activeTab).toBe("contacts");

    act(() => {
      result.current.setActiveTab("relationships");
    });
    expect(result.current.activeTab).toBe("relationships");

    act(() => {
      result.current.setActiveTab("roles");
    });
    expect(result.current.activeTab).toBe("roles");

    act(() => {
      result.current.setActiveTab("history");
    });
    expect(result.current.activeTab).toBe("history");
  });

  it("dispatches child entity mutations", async () => {
    mockPartyRepo.updatePartyName.mockResolvedValue(undefined);
    mockPartyRepo.addContactPoint.mockResolvedValue("contact-id");
    mockPartyRepo.updateContactPoint.mockResolvedValue(undefined);
    mockPartyRepo.removeContactPoint.mockResolvedValue(undefined);
    mockPartyRepo.addRole.mockResolvedValue("role-id");
    mockPartyRepo.removeRole.mockResolvedValue(undefined);
    mockPartyRepo.addRelationship.mockResolvedValue("rel-id");
    mockPartyRepo.removeRelationship.mockResolvedValue(undefined);
    mockPartyRepo.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePartyProfileViewModel("test-p1"));

    await act(async () => {
      await result.current.handleUpdateName("Nasser Al-Dawsari Updated");
    });
    expect(mockPartyRepo.updatePartyName).toHaveBeenCalledWith(
      "test-p1",
      "Nasser Al-Dawsari Updated",
      { type: "Person", fullName: undefined }
    );

    await act(async () => {
      await result.current.handleAddContact({
        type: "phone",
        value: "+966500000000",
        isPrimary: true,
      });
    });
    expect(mockPartyRepo.addContactPoint).toHaveBeenCalledWith({
      partyId: "test-p1",
      type: "phone",
      value: "+966500000000",
      isPrimary: true,
    });

    await act(async () => {
      await result.current.handleUpdateContact({
        id: "contact-id",
        type: "phone",
        value: "+966500000001",
        isPrimary: false,
      });
    });
    expect(mockPartyRepo.updateContactPoint).toHaveBeenCalledWith("contact-id", {
      partyId: "test-p1",
      type: "phone",
      value: "+966500000001",
      isPrimary: false,
    });

    await act(async () => {
      await result.current.handleRemoveContact("contact-id");
    });
    expect(mockPartyRepo.removeContactPoint).toHaveBeenCalledWith("contact-id");

    await act(async () => {
      await result.current.handleAddRole({
        roleType: "Midfielder",
      });
    });
    expect(mockPartyRepo.addRole).toHaveBeenCalledWith({
      partyId: "test-p1",
      roleType: "Midfielder",
    });

    await act(async () => {
      await result.current.handleRemoveRole("role-id");
    });
    expect(mockPartyRepo.removeRole).toHaveBeenCalledWith("role-id");

    await act(async () => {
      await result.current.handleAddRelationship({
        targetPartyId: "target-org",
        relationshipType: "MemberOf",
      });
    });
    expect(mockPartyRepo.addRelationship).toHaveBeenCalledWith({
      sourcePartyId: "test-p1",
      targetPartyId: "target-org",
      relationshipType: "MemberOf",
      validFrom: undefined,
      validTo: undefined,
    });

    await act(async () => {
      await result.current.handleRemoveRelationship("rel-id");
    });
    expect(mockPartyRepo.removeRelationship).toHaveBeenCalledWith("rel-id");

    await act(async () => {
      await result.current.handleDeleteParty();
    });
    expect(mockPartyRepo.delete).toHaveBeenCalledWith("test-p1");
  });

  it("threads canonicalProfile.rowVersion on update and invalidates profile query on 409 conflict", async () => {
    activeTestProfile = new PartyProfile({
      party: testParty,
      person: null,
      organization: null,
      contactPoints: [],
      roles: [],
      relationships: [],
      mergeCandidates: [],
      canonicalProfile: {
        fullName: "Nasser Al-Dawsari",
        legalName: null,
        rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
      },
    });

    const conflictErr = new Error(
      "The person record has been modified by another user or process. Please refresh and try again."
    ) as Error & { status?: number; details?: { statusCode?: number; errorCode?: string } };
    conflictErr.status = 409;
    conflictErr.details = { statusCode: 409, errorCode: "ENTITY_CONCURRENCY_CONFLICT" };

    mockPartyRepo.updatePartyName.mockRejectedValueOnce(conflictErr);

    const { result } = renderHook(() => usePartyProfileViewModel("test-p1"));

    await expect(
      act(async () => {
        await result.current.handleUpdateName({
          displayName: "Nasser Conflict",
          fullName: "Nasser Conflict Full",
        });
      })
    ).rejects.toThrow("The person record has been modified by another user or process");

    expect(mockPartyRepo.updatePartyName).toHaveBeenCalledWith("test-p1", "Nasser Conflict", {
      type: "Person",
      fullName: "Nasser Conflict Full",
      rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["party-profile", "test-p1"] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["parties-directory"] });
    expect(mockShowError).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "party.toast.concurrencyConflict",
      })
    );
  });
});
