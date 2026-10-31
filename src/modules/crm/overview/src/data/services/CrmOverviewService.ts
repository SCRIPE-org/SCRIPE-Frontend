import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type { CrmOverviewData } from "../../domain/models/crm-overview.types";
import { CRM_ENDPOINTS } from "./crm-overview.endpoints";

export class CrmOverviewService implements ICrmOverviewService {
  constructor(private readonly api: IApiService) {}

  async getOverviewData(_searchQuery?: string): Promise<CrmOverviewData> {
    const response = await this.api.get<{
      success?: boolean;
      data?: CrmOverviewData;
    } | CrmOverviewData>(CRM_ENDPOINTS.PIPELINE_DEFAULT);

    if (response && "data" in response && response.data) {
      return response.data;
    }
    return response as CrmOverviewData;
  }
}
