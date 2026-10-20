import type { IApiService } from "@core/interfaces/api.interface";
import { GUEST_PORTAL_ENDPOINTS } from "./guest-portal.endpoints";
import type {
  CancelGuestReservationResponse,
  ExchangeGuestSessionResponse,
  GuestBooking,
} from "../../domain/entities/GuestBooking";
import type { IGuestPortalService } from "../../domain/interfaces/IGuestPortalService";

const DEFAULT_CANCEL_REASON = "Cancelled by guest via self-service portal";

/** Guest-session API adapter; public transport still sends the HttpOnly session cookie. */
export class GuestPortalService implements IGuestPortalService {
  constructor(private readonly api: IApiService) {}

  exchangeSession(token: string): Promise<ExchangeGuestSessionResponse> {
    return this.api.postPublic<ExchangeGuestSessionResponse>(GUEST_PORTAL_ENDPOINTS.SESSION, {
      token,
    });
  }

  getBooking(): Promise<GuestBooking> {
    return this.api.getPublic<GuestBooking>(GUEST_PORTAL_ENDPOINTS.BOOKING);
  }

  cancelBooking(
    reason: string,
    idempotencyKey: string
  ): Promise<CancelGuestReservationResponse> {
    const key = idempotencyKey.trim();
    if (!key) {
      return Promise.reject(new Error("A stable idempotency key is required to cancel a booking."));
    }

    return this.api.postPublic<CancelGuestReservationResponse>(GUEST_PORTAL_ENDPOINTS.CANCEL, {
      reason: reason.trim() || DEFAULT_CANCEL_REASON,
      idempotencyKey: key,
    });
  }

  async logout(): Promise<void> {
    try {
      await this.api.postPublic(GUEST_PORTAL_ENDPOINTS.LOGOUT, {});
    } catch {
      // Logout is best-effort; the HttpOnly cookie is cleared by the server when reachable.
    }
  }
}
