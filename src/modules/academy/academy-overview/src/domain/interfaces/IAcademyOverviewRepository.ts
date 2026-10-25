import type { AcademyOverviewState } from "../entities/AcademyOverview";

export interface IAcademyOverviewRepository {
  getOverview(): Promise<AcademyOverviewState>;
}
