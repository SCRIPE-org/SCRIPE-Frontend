import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CustomerSummary } from "../../domain/entities/Booking";
import type { ICustomerPickerService } from "../../domain/interfaces/ICustomerPickerService";
import { BOOKING_ENDPOINTS } from "./booking.endpoints";

interface PartyPage {
  items: CustomerSummary[];
}

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
}
