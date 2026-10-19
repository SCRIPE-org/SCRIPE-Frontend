import type { BookingReportItem } from "../../domain/entities/VenueReports";
import type { IVenueReportsRepository } from "../../domain/interfaces/IVenueReportsRepository";
import type { IVenueReportsService } from "../../domain/interfaces/IVenueReportsService";

export class VenueReportsRepository implements IVenueReportsRepository {
  constructor(private readonly service: IVenueReportsService) {}

  async getBookings(params?: {
    page?: number;
    pageSize?: number;
    resourceId?: string;
  }): Promise<BookingReportItem[]> {
    const res = await this.service.getBookings(params);
    return (res.items || []).map((b) => ({
      id: b.id,
      reservationNumber: b.reservationNumber,
      status: b.status,
      resourceId: b.resourceId,
      resourceName: b.resourceId,
      requestedStartUtc: b.requestedStartUtc,
      requestedEndUtc: b.requestedEndUtc,
      quantity: b.quantity,
      createdAt: b.createdAt,
    }));
  }
}
