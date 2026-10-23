import type { BookingReportItem } from "../../domain/entities/VenueReports";
import type { BookingReportItemJson } from "../models/VenueReportsModel";

export class VenueReportsMapper {
  static toEntity(dto: BookingReportItemJson): BookingReportItem {
    return {
      id: dto.id,
      reservationNumber: dto.reservationNumber,
      status: dto.status,
      resourceId: dto.resourceId,
      resourceName: dto.resourceName ?? dto.resourceId,
      requestedStartUtc: dto.requestedStartUtc,
      requestedEndUtc: dto.requestedEndUtc,
      quantity: dto.quantity,
      createdAt: dto.createdAt,
    };
  }
}
