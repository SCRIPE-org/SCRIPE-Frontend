import type { BookingReportItem } from "../../domain/entities/VenueReports";
import type { IVenueReportsRepository } from "../../domain/interfaces/IVenueReportsRepository";
import type { IVenueReportsService } from "../../domain/interfaces/IVenueReportsService";
import { VenueReportsMapper } from "../mappers/VenueReportsMapper";

export class VenueReportsRepository implements IVenueReportsRepository {
  constructor(private readonly service: IVenueReportsService) {}

  async getBookings(params?: {
    page?: number;
    pageSize?: number;
    resourceId?: string;
  }): Promise<BookingReportItem[]> {
    const res = await this.service.getBookings(params);
    return (res.items || []).map(VenueReportsMapper.toEntity);
  }
}
