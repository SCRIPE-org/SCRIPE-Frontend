import type {
  CancelGuestReservationResponse,
  ExchangeGuestSessionResponse,
  GuestBooking,
} from "../entities/GuestBooking";

export interface IGuestPortalRepository {
  exchangeSession(token: string): Promise<ExchangeGuestSessionResponse>;
  getBooking(): Promise<GuestBooking>;
  cancelBooking(reason: string, idempotencyKey: string): Promise<CancelGuestReservationResponse>;
  logout(): Promise<void>;
}
