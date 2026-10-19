export interface BookingReportItem {
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

export interface BookingReportDto {
  id: string;
  reservationNumber: string;
  status: string;
  resourceId: string;
  requestedStartUtc: string;
  requestedEndUtc: string;
  quantity: number;
  createdAt: string;
}
