import type {
  AcademyFeesReceivablesResponse,
  FeesReceivablesFilters
} from "../entities/AcademyReceivable";

export interface IAcademyFinanceService {
  getFeesReceivables(filters?: FeesReceivablesFilters): Promise<AcademyFeesReceivablesResponse>;
  getExportUrl(filters?: FeesReceivablesFilters): string;
}
