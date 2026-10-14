import type { IApiService } from "@core/interfaces/api.interface";
import { GUEST_PORTAL_ENDPOINTS } from "./guest-portal.endpoints";
import type {
  CancelGuestReservationResponse,
  ExchangeGuestSessionResponse,
  GuestBooking,
} from "../../domain/entities/GuestBooking";
import type { IGuestPortalService } from "../../domain/interfaces/IGuestPortalService";

export class GuestPortalService implements IGuestPortalService {
  private readonly api?: IApiService;
  private readonly baseUrl?: string;

  constructor(apiOrBaseUrl?: IApiService | string) {
    if (apiOrBaseUrl && typeof apiOrBaseUrl !== "string" && "post" in apiOrBaseUrl) {
      this.api = apiOrBaseUrl;
    } else {
      const defaultApi = process.env.NEXT_PUBLIC_API_URL || "/api";
      this.baseUrl = ((typeof apiOrBaseUrl === "string" ? apiOrBaseUrl : defaultApi) || "/api").replace(/\/$/, "");
    }
  }

  private getGuestEndpoint(path: string): string {
    const base = this.baseUrl || "/api";
    if (base.startsWith("http://") || base.startsWith("https://")) {
      return `${base}/v1/venue/guest${path}`;
    }
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:3000";
    return `${origin}${base}/v1/venue/guest${path}`;
  }

  private buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async exchangeSession(token: string): Promise<ExchangeGuestSessionResponse> {
    if (this.api) {
      return this.api.post<ExchangeGuestSessionResponse>(GUEST_PORTAL_ENDPOINTS.SESSION, { token });
    }

    const response = await fetch(this.getGuestEndpoint("/session"), {
      method: "POST",
      headers: this.buildHeaders(),
      credentials: "include",
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.detail ||
        errorData?.title ||
        "The guest link is invalid, expired, or has been revoked.";
      throw new Error(message);
    }

    return response.json();
  }

  async getBooking(): Promise<GuestBooking> {
    if (this.api) {
      return this.api.get<GuestBooking>(GUEST_PORTAL_ENDPOINTS.BOOKING);
    }

    const response = await fetch(this.getGuestEndpoint("/booking"), {
      method: "GET",
      headers: this.buildHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.detail ||
        errorData?.title ||
        "Unable to retrieve booking details. Your guest session may have expired.";
      throw new Error(message);
    }

    return response.json();
  }

  async cancelBooking(
    reason?: string | null,
    idempotencyKey?: string | null
  ): Promise<CancelGuestReservationResponse> {
    if (this.api) {
      return this.api.post<CancelGuestReservationResponse>(
        GUEST_PORTAL_ENDPOINTS.CANCEL,
        {
          reason: reason || "Cancelled by guest via self-service portal",
          idempotencyKey: idempotencyKey || null,
        }
      );
    }

    const headers = this.buildHeaders() as Record<string, string>;
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    const response = await fetch(this.getGuestEndpoint("/booking/cancel"), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        reason: reason || "Cancelled by guest via self-service portal",
        idempotencyKey: idempotencyKey || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.detail ||
        errorData?.title ||
        "This booking cannot be cancelled at this time. Please contact the venue.";
      throw new Error(message);
    }

    return response.json();
  }

  async logout(): Promise<void> {
    if (this.api) {
      try {
        await this.api.post(GUEST_PORTAL_ENDPOINTS.LOGOUT, {});
      } catch {
        // Best-effort logout cleanup
      }
      return;
    }

    try {
      await fetch(this.getGuestEndpoint("/logout"), {
        method: "POST",
        headers: this.buildHeaders(),
        credentials: "include",
      });
    } catch {
      // Best-effort logout cleanup
    }
  }
}

export const guestPortalService = new GuestPortalService();
