import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { REPORTS_ENDPOINTS } from "./reports.endpoints";
import type { BookingReportDto } from "../../domain/entities/VenueReports";
import type { IVenueReportsService } from "../../domain/interfaces/IVenueReportsService";

export class VenueReportsService implements IVenueReportsService {
  constructor(private readonly api: IApiService) {}

  async getBookings(params?: {
    page?: number;
    pageSize?: number;
    resourceId?: string;
  }): Promise<{ items: BookingReportDto[] }> {
    const url = buildUrl(REPORTS_ENDPOINTS.RESERVATIONS, {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 100,
      resourceId: params?.resourceId || undefined,
    });
    return this.api.get<{ items: BookingReportDto[] }>(url);
  }
}
