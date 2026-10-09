import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CustomerSummary } from "../../domain/entities/Booking";
import type { ICustomerPickerService } from "../../domain/interfaces/ICustomerPickerService";
import { BOOKING_ENDPOINTS } from "./booking.endpoints";

interface PartyPage {
  items: CustomerSummary[];
}

/**
 * Documentation for module export
 */
export class CustomerPickerService implements ICustomerPickerService {
  constructor(private readonly api: IApiService) {}

  async search(query: string): Promise<CustomerSummary[]> {
    const result = await this.api.get<PartyPage>(
      buildUrl(BOOKING_ENDPOINTS.PARTIES, {
        page: 1,
        pageSize: 20,
        search: query.trim() || undefined,
      })
    );
    return result.items;
  }

  getById(id: string): Promise<CustomerSummary> {
    return this.api.get(BOOKING_ENDPOINTS.PARTY_BY_ID(id));
  }

  async create(
    displayName: string,
    type: "Person" | "Organization" = "Person",
    phone?: string
  ): Promise<CustomerSummary> {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      throw new Error("Customer name is required.");
    }

    let partyId: string;

    if (type === "Person") {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : undefined;
      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }

      const res = await this.api.post<{ id: string }>(
        BOOKING_ENDPOINTS.PEOPLE,
        {
          fullName: trimmedName,
          displayName: trimmedName,
          givenName: null,
          middleNames: null,
          familyName: null,
        },
        undefined,
        Object.keys(headers).length > 0 ? { headers } : undefined
      );
      partyId = res.id;
    } else {
      const res = await this.api.post<{ id: string }>(BOOKING_ENDPOINTS.ORGANIZATIONS, {
        legalName: trimmedName,
        displayName: trimmedName,
      });
      partyId = res.id;
    }

    if (phone && phone.trim()) {
      try {
        await this.api.post(BOOKING_ENDPOINTS.CONTACT_POINTS, {
          partyId,
          type: "phone",
          value: phone.trim(),
          isPrimary: true,
        });
      } catch {
        // Non-blocking contact point bridge per ADR-002
      }
    }

    return this.getById(partyId);
  }
}
