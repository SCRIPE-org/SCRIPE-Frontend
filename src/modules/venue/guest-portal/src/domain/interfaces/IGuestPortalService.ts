import type {
  ExchangeGuestSessionResponse,
  GuestBooking,
  CancelGuestReservationResponse,
} from "../entities/GuestBooking";

export interface IGuestPortalService {
  /**
   * Exchanges an opaque fragment token for a scoped, short-lived session.
   * Server issues an HttpOnly SameSite cookie and returns the session payload.
   */
  exchangeSession(token: string): Promise<ExchangeGuestSessionResponse>;

  /**
   * Retrieves the authoritative booking view for the current active guest session.
   */
  getBooking(): Promise<GuestBooking>;

  /**
   * Authoritative guest self-service cancellation.
   */
  cancelBooking(
    reason?: string | null,
    idempotencyKey?: string | null
  ): Promise<CancelGuestReservationResponse>;

  /**
   * Terminates guest session and clears session cookies.
   */
  logout(): Promise<void>;
}
