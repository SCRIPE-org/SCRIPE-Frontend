import type { BookingReportDto } from "../entities/VenueReports";

export interface IVenueReportsService {
  getBookings(params?: {
    page?: number;
    pageSize?: number;
    resourceId?: string;
  }): Promise<{ items: BookingReportDto[] }>;
}
