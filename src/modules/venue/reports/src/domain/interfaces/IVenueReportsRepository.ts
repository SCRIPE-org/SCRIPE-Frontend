import type { BookingReportItem } from "../entities/VenueReports";

export interface IVenueReportsRepository {
  getBookings(params?: {
    page?: number;
    pageSize?: number;
    resourceId?: string;
  }): Promise<BookingReportItem[]>;
}
