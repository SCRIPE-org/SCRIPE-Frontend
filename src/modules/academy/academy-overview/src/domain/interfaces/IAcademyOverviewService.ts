import type { AcademyOverviewState } from "../entities/AcademyOverview";

export interface IAcademyOverviewService {
  getOverview(): Promise<AcademyOverviewState>;
}
