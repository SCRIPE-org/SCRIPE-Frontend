import type {
  AcademyFeesReceivablesResponse,
  FeesReceivablesFilters
} from "../entities/AcademyReceivable";

export interface IAcademyFinanceRepository {
  getFeesReceivables(filters?: FeesReceivablesFilters): Promise<AcademyFeesReceivablesResponse>;
  getExportUrl(filters?: FeesReceivablesFilters): string;
}
