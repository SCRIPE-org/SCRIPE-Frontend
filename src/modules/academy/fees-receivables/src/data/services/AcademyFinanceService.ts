import type { IApiService } from "@/core/interfaces/api.interface";
import type { IAcademyFinanceService } from "../../domain/interfaces/IAcademyFinanceService";
import type {
  AcademyFeesReceivablesResponse,
  FeesReceivablesFilters
} from "../../domain/entities/AcademyReceivable";
import type { AcademyFeesReceivablesResponseModel } from "../models/AcademyReceivableModel";
import { AcademyReceivableMapper } from "../mappers/AcademyReceivableMapper";
import { ACADEMY_FINANCE_ENDPOINTS } from "./academy-finance.endpoints";

export class AcademyFinanceService implements IAcademyFinanceService {
  constructor(private readonly api: IApiService) {}

  async getFeesReceivables(filters?: FeesReceivablesFilters): Promise<AcademyFeesReceivablesResponse> {
    const url = ACADEMY_FINANCE_ENDPOINTS.FEES_RECEIVABLES(filters);
    const response = await this.api.get<AcademyFeesReceivablesResponseModel>(url);
    return AcademyReceivableMapper.toResponseEntity(response);
  }

  getExportUrl(filters?: FeesReceivablesFilters): string {
    return ACADEMY_FINANCE_ENDPOINTS.EXPORT_CSV(filters);
  }
}
