import type { IApiService } from "@core/interfaces/api.interface";
import { ACADEMY_OVERVIEW_ENDPOINTS } from "./academy-overview.endpoints";
import type { IAcademyOverviewService } from "../../domain/interfaces/IAcademyOverviewService";
import type { AcademyOverviewState } from "../../domain/entities/AcademyOverview";

export class AcademyOverviewService implements IAcademyOverviewService {
  constructor(private readonly api: IApiService) {}

  async getOverview(): Promise<AcademyOverviewState> {
    try {
      const url = ACADEMY_OVERVIEW_ENDPOINTS.GET();
      const res = await this.api.get<{
        isEnabled: boolean;
        tenantId: string | null;
        maxAthletes: number;
        maxPrograms: number;
        maxTrainingGroups: number;
        activeProgramsCount: number;
        activeOfferingsCount: number;
        activeEnrollmentsCount: number;
        pendingTrialsCount: number;
        configuredFeatures: string[];
        statusMessage: string;
      }>(url);

      const isEmpty = (res.activeProgramsCount ?? 0) === 0 && (res.activeOfferingsCount ?? 0) === 0;

      return {
        stage: isEmpty ? "empty" : "ready",
        isEnabled: res.isEnabled,
        tenantId: res.tenantId,
        maxAthletes: res.maxAthletes,
        maxPrograms: res.maxPrograms,
        maxTrainingGroups: res.maxTrainingGroups,
        activeProgramsCount: res.activeProgramsCount ?? 0,
        activeOfferingsCount: res.activeOfferingsCount ?? 0,
        activeEnrollmentsCount: res.activeEnrollmentsCount ?? 0,
        pendingTrialsCount: res.pendingTrialsCount ?? 0,
        configuredFeatures: res.configuredFeatures ?? [],
        statusMessage: res.statusMessage ?? "",
        error: null,
      };
    } catch (err: unknown) {
      const status =
        err && typeof err === "object"
          ? "status" in err && typeof (err as { status: unknown }).status === "number"
            ? (err as { status: number }).status
            : "response" in err &&
              typeof (err as { response?: { status?: unknown } }).response?.status === "number"
            ? (err as { response: { status: number } }).response.status
            : null
          : null;
      const isUnauthorized = status === 401 || status === 403;

      return {
        stage: isUnauthorized ? "unauthorized" : "failed",
        isEnabled: false,
        tenantId: null,
        maxAthletes: 0,
        maxPrograms: 0,
        maxTrainingGroups: 0,
        activeProgramsCount: 0,
        activeOfferingsCount: 0,
        activeEnrollmentsCount: 0,
        pendingTrialsCount: 0,
        configuredFeatures: [],
        statusMessage: "",
        error: err instanceof Error ? err.message : "Failed to load Academy overview",
      };
    }
  }
}
