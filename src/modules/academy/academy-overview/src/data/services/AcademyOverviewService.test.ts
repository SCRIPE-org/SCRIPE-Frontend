import { describe, it, expect, vi } from "vitest";
import { AcademyOverviewService } from "./AcademyOverviewService";
import type { IApiService } from "@core/interfaces/api.interface";

describe("AcademyOverviewService", () => {
  it("fetches overview from correct endpoint and returns empty stage when counts are zero", async () => {
    const mockApi = {
      get: vi.fn().mockResolvedValue({
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
        statusMessage: "Active",
      }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new AcademyOverviewService(mockApi);
    const result = await service.getOverview();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/academy/overview");
    expect(result.stage).toBe("empty");
    expect(result.isEnabled).toBe(true);
    expect(result.tenantId).toBe("tenant-123");
    expect(result.configuredFeatures).toContain("Programs");
  });

  it("handles 403 forbidden error by returning unauthorized stage", async () => {
    const forbiddenError = Object.assign(new Error("Forbidden"), { status: 403 });
    const mockApi = {
      get: vi.fn().mockRejectedValue(forbiddenError),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new AcademyOverviewService(mockApi);
    const result = await service.getOverview();

    expect(result.stage).toBe("unauthorized");
    expect(result.isEnabled).toBe(false);
  });

  it("handles 401 unauthorized error by returning unauthorized stage", async () => {
    const unauthorizedError = Object.assign(new Error("Unauthorized"), { status: 401 });
    const mockApi = {
      get: vi.fn().mockRejectedValue(unauthorizedError),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new AcademyOverviewService(mockApi);
    const result = await service.getOverview();

    expect(result.stage).toBe("unauthorized");
    expect(result.isEnabled).toBe(false);
  });
});
