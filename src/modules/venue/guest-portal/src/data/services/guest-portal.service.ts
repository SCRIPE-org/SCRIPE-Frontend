import type {
  CancelGuestReservationResponse,
  ExchangeGuestSessionResponse,
  GuestBooking,
} from "../../domain/entities/GuestBooking";
import type { IGuestPortalService } from "../../domain/interfaces/IGuestPortalService";

export class GuestPortalService implements IGuestPortalService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    const defaultApi = process.env.NEXT_PUBLIC_API_URL || "/api";
    this.baseUrl = (baseUrl || defaultApi).replace(/\/$/, "");
  }

  private getGuestEndpoint(path: string): string {
    if (this.baseUrl.startsWith("http://") || this.baseUrl.startsWith("https://")) {
      return `${this.baseUrl}/v1/venue/guest${path}`;
    }
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:3000";
    return `${origin}${this.baseUrl}/v1/venue/guest${path}`;
  }

  private buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async exchangeSession(token: string): Promise<ExchangeGuestSessionResponse> {
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
