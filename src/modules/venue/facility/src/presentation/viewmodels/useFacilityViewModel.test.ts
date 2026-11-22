import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VENUE_PERMISSIONS } from "../../../../permission-constants";

const { mockUsePermissionImpl, mockVenueProfileGetAll, mockFacilityGetAll } = vi.hoisted(() => ({
  mockUsePermissionImpl: vi.fn((_perm: string) => true),
  mockVenueProfileGetAll: vi.fn(),
  mockFacilityGetAll: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => mockUsePermissionImpl(perm),
}));

vi.mock("@core/crud/hooks/useCrudViewModel", () => ({
  useCrudViewModel: () => ({
    items: [],
    isLoading: false,
    setIsCreateModalOpen: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../../../../di", () => ({
  getVenueContainer: () => ({
    facilityRepository: {
      getAll: mockFacilityGetAll,
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    venueProfileRepository: {
      getAll: mockVenueProfileGetAll,
    },
  }),
}));

import { useFacilityViewModel } from "./useFacilityViewModel";

describe("useFacilityViewModel (BUG-02 venue-profiles.view gate)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVenueProfileGetAll.mockResolvedValue({
      items: [{ id: "vp-1", name: "Main Stadium" }],
      totalCount: 1,
    });
  });

  it("skips venueProfileRepository.getAll background lookup and search when user lacks venue-profiles.view", async () => {
    mockUsePermissionImpl.mockImplementation(
      (perm) => perm !== VENUE_PERMISSIONS.VENUE_PROFILE_VIEW
    );

    const { result } = renderHook(() => useFacilityViewModel());

    const searchResult = await result.current.searchVenueProfiles("Main");
    expect(searchResult).toEqual([]);
    expect(mockVenueProfileGetAll).not.toHaveBeenCalled();
    expect(result.current.venueProfileNameById).toEqual({});
  });

  it("loads venue profile lookup and search results when user holds venue-profiles.view", async () => {
    mockUsePermissionImpl.mockImplementation(
      (perm) => perm === VENUE_PERMISSIONS.VENUE_PROFILE_VIEW
    );

    const { result } = renderHook(() => useFacilityViewModel());

    await waitFor(() => {
      expect(mockVenueProfileGetAll).toHaveBeenCalledWith({
        page: 1,
        pageSize: 500,
      });
      expect(result.current.venueProfileNameById).toEqual({
        "vp-1": "Main Stadium",
      });
    });

    const searchResult = await result.current.searchVenueProfiles("Main");
    expect(searchResult).toEqual([{ value: "vp-1", label: "Main Stadium" }]);
  });
});
