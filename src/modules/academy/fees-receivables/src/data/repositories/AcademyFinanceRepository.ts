import type { IAcademyFinanceRepository } from "../../domain/interfaces/IAcademyFinanceRepository";
import type { IAcademyFinanceService } from "../../domain/interfaces/IAcademyFinanceService";
import type {
  AcademyFeesReceivablesResponse,
  FeesReceivablesFilters
} from "../../domain/entities/AcademyReceivable";

export class AcademyFinanceRepository implements IAcademyFinanceRepository {
  constructor(private readonly service: IAcademyFinanceService) {}

  async getFeesReceivables(filters?: FeesReceivablesFilters): Promise<AcademyFeesReceivablesResponse> {
    return await this.service.getFeesReceivables(filters);
  }

  getExportUrl(filters?: FeesReceivablesFilters): string {
    return this.service.getExportUrl(filters);
  }
}
