import type {
  GuestBooking,
  ExchangeGuestSessionResponse,
  CancelGuestReservationResponse,
} from "../../domain/entities/GuestBooking";
import type {
  GuestBookingJson,
  GuestSessionResponseJson,
  GuestCancellationResponseJson,
} from "../models/GuestPortalModel";

export class GuestPortalMapper {
  static toBookingEntity(dto: GuestBookingJson): GuestBooking {
    return {
      reservationNumber: dto.reservationNumber,
      venueName: dto.venueName,
      facilityName: dto.facilityName,
      resourceName: dto.resourceName,
      startUtc: dto.startUtc,
      endUtc: dto.endUtc,
      timeZoneId: dto.timeZoneId,
      status: dto.status,
      quantity: dto.quantity,
      customerName: dto.customerName ?? null,
      financialSummary: dto.financialSummary ?? null,
      allowedActions: dto.allowedActions ?? [],
      canCancel: dto.canCancel ?? false,
      instructions: dto.instructions ?? null,
    };
  }

  static toSessionResponse(dto: GuestSessionResponseJson): ExchangeGuestSessionResponse {
    return {
      guestSessionToken: dto.guestSessionToken,
      expiresAtUtc: dto.expiresAtUtc,
      reservation: GuestPortalMapper.toBookingEntity(dto.reservation),
    };
  }

  static toCancellationResponse(dto: GuestCancellationResponseJson): CancelGuestReservationResponse {
    return {
      reservationNumber: dto.reservationNumber,
      status: dto.status,
    };
  }
}
