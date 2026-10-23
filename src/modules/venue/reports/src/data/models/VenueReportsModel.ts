/**
 * Venue Reports Data Models (DTOs)
 */

export interface BookingReportItemJson {
  id: string;
  reservationNumber: string;
  status: string;
  resourceId: string;
  resourceName?: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
  createdAt: string;
}

export interface BookingReportListResponseJson {
  items: BookingReportItemJson[];
  totalCount?: number;
}
