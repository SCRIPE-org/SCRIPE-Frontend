import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IApiService } from "@/core/interfaces/api.interface";
import { TrainingGroupsService } from "./TrainingGroupsService";
import type {
  CreateTrainingGroupPayload,
  UpdateTrainingGroupPayload,
  AssignAthletePayload,
  TransferAthletePayload,
  AssignCoachPayload
} from "../../domain/entities/TrainingGroup";

describe("TrainingGroupsService", () => {
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let service: TrainingGroupsService;

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    };
    service = new TrainingGroupsService(mockApi as unknown as IApiService);
  });

  it("fetches training groups with query params", async () => {
    const mockGroups = [{ id: "grp-1", nameEn: "Lions Squad" }];
    vi.mocked(mockApi.get).mockResolvedValue(mockGroups);

    const result = await service.getGroups("offering-123", "branch-456", "Active");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/academy/groups?offeringId=offering-123&branchId=branch-456&status=Active"
    );
    expect(result).toEqual(mockGroups);
  });

  it("creates a training group via POST", async () => {
    const payload: CreateTrainingGroupPayload = {
      offeringId: "off-1",
      nameEn: "Lions A",
      nameAr: "فريق الأسود",
      code: "LION-A",
      maxCapacity: 12,
      minCapacity: 4
    };
    const mockCreated = { id: "grp-new", ...payload };
    vi.mocked(mockApi.post).mockResolvedValue(mockCreated);

    const result = await service.createGroup(payload);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/academy/groups", payload);
    expect(result).toEqual(mockCreated);
  });

  it("updates a training group via PUT", async () => {
    const payload: UpdateTrainingGroupPayload = {
      nameEn: "Lions A Revised",
      nameAr: "فريق الأسود المعدل",
      minCapacity: 4,
      maxCapacity: 15,
      status: "Active"
    };
    const mockUpdated = { id: "grp-1", ...payload };
    vi.mocked(mockApi.put).mockResolvedValue(mockUpdated);

    const result = await service.updateGroup("grp-1", payload);

    expect(mockApi.put).toHaveBeenCalledWith("/v1/academy/groups/grp-1", payload);
    expect(result).toEqual(mockUpdated);
  });

  it("archives a training group via DELETE", async () => {
    vi.mocked(mockApi.delete).mockResolvedValue(undefined);

    await service.archiveGroup("grp-1");

    expect(mockApi.delete).toHaveBeenCalledWith("/v1/academy/groups/grp-1");
  });

  it("fetches group roster via GET", async () => {
    const mockRoster = [{ membershipId: "mem-1", athleteNameEn: "Zaid" }];
    vi.mocked(mockApi.get).mockResolvedValue(mockRoster);

    const result = await service.getRoster("grp-1", true);

    expect(mockApi.get).toHaveBeenCalledWith("/v1/academy/groups/grp-1/roster?activeOnly=true");
    expect(result).toEqual(mockRoster);
  });

  it("assigns athlete to group via POST", async () => {
    const payload: AssignAthletePayload = {
      enrollmentId: "enr-1",
      startDate: "2026-11-15",
      ageOverrideJustification: "Exceptional technical proficiency approved by Technical Director"
    };
    const mockMembership = { id: "mem-1", groupId: "grp-1", enrollmentId: "enr-1" };
    vi.mocked(mockApi.post).mockResolvedValue(mockMembership);

    const result = await service.assignAthlete("grp-1", payload);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/academy/groups/grp-1/memberships", payload);
    expect(result).toEqual(mockMembership);
  });

  it("transfers athlete to another group via POST with override justification", async () => {
    const payload: TransferAthletePayload = {
      targetGroupId: "grp-2",
      reason: "Performance advancement",
      effectiveDate: "2026-11-15",
      ageOverrideJustification: "Playing up based on evaluation"
    };
    const mockNewMembership = { id: "mem-2", groupId: "grp-2" };
    vi.mocked(mockApi.post).mockResolvedValue(mockNewMembership);

    const result = await service.transferAthlete("grp-1", "mem-1", payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/academy/groups/grp-1/memberships/mem-1/transfer",
      payload
    );
    expect(result).toEqual(mockNewMembership);
  });

  it("assigns coach to group via POST", async () => {
    const payload: AssignCoachPayload = {
      staffMemberId: "staff-1",
      role: "HeadCoach"
    };
    const mockCoach = { id: "coach-1", groupId: "grp-1", ...payload };
    vi.mocked(mockApi.post).mockResolvedValue(mockCoach);

    const result = await service.assignCoach("grp-1", payload);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/academy/groups/grp-1/coaches", payload);
    expect(result).toEqual(mockCoach);
  });

  it("fetches available coaches via GET", async () => {
    const mockCoaches = [
      {
        staffMemberId: "staff-1",
        fullName: "Coach Tariq",
        email: "tariq@scripe.com",
        sportId: "sport-1",
        sportNameEn: "Football",
        qualificationLevel: "UEFA-A",
        licenseExpiryDate: "2027-12-31"
      }
    ];
    vi.mocked(mockApi.get).mockResolvedValue(mockCoaches);

    const result = await service.getAvailableCoaches("sport-1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/academy/groups/available-coaches?sportId=sport-1");
    expect(result).toEqual(mockCoaches);
  });
});
