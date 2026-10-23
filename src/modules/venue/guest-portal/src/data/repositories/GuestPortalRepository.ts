import type {
  CancelGuestReservationResponse,
  ExchangeGuestSessionResponse,
  GuestBooking,
} from "../../domain/entities/GuestBooking";
import type { IGuestPortalRepository } from "../../domain/interfaces/IGuestPortalRepository";
import type { IGuestPortalService } from "../../domain/interfaces/IGuestPortalService";
import { GuestPortalMapper } from "../mappers/GuestPortalMapper";

export class GuestPortalRepository implements IGuestPortalRepository {
  constructor(private readonly service: IGuestPortalService) {}

  async exchangeSession(token: string): Promise<ExchangeGuestSessionResponse> {
    const res = await this.service.exchangeSession(token);
    return GuestPortalMapper.toSessionResponse(res as any);
  }

  async getBooking(): Promise<GuestBooking> {
    const res = await this.service.getBooking();
    return GuestPortalMapper.toBookingEntity(res as any);
  }

  async cancelBooking(
    reason: string,
    idempotencyKey: string
  ): Promise<CancelGuestReservationResponse> {
    const res = await this.service.cancelBooking(reason, idempotencyKey);
    return GuestPortalMapper.toCancellationResponse(res as any);
  }

  async logout(): Promise<void> {
    return this.service.logout();
  }
}
