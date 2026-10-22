import type { GuestBooking } from "../../domain/entities/GuestBooking";

export interface GuestBookingJson extends GuestBooking {}

export interface GuestSessionResponseJson {
  guestSessionToken: string;
  expiresAtUtc: string;
  reservation: GuestBookingJson;
}

export interface GuestCancellationResponseJson {
  reservationNumber: string;
  status: string;
}
