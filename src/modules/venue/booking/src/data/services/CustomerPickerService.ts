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

  async create(displayName: string, type: "Person" | "Organization" = "Person"): Promise<CustomerSummary> {
    const typeEnum = type === "Organization" ? 1 : 0;
    const res = await this.api.post<{ id: string }>(BOOKING_ENDPOINTS.PARTIES, {
      displayName: displayName.trim(),
      type: typeEnum,
    });
    return this.getById(res.id);
  }
}
