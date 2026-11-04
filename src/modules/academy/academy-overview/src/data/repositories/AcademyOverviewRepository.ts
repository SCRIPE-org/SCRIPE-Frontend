import type { IAcademyOverviewRepository } from "../../domain/interfaces/IAcademyOverviewRepository";
import type { IAcademyOverviewService } from "../../domain/interfaces/IAcademyOverviewService";
import type { AcademyOverviewState } from "../../domain/entities/AcademyOverview";

export class AcademyOverviewRepository implements IAcademyOverviewRepository {
  constructor(private readonly service: IAcademyOverviewService) {}

  async getOverview(): Promise<AcademyOverviewState> {
    return this.service.getOverview();
  }
}
