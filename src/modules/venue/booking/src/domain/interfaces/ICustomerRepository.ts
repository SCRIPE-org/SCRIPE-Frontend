import type { CustomerSummary } from "../entities/Booking";
import type {
  CustomerCreateOptions,
  PagedCustomerResult,
} from "./ICustomerPickerService";

/**
 * Documentation for module export
 */
export interface ICustomerRepository {
  search(query: string): Promise<CustomerSummary[]>;
  searchPaged(query?: string, page?: number, pageSize?: number): Promise<PagedCustomerResult>;
  getById(id: string): Promise<CustomerSummary>;
  create(
    displayName: string,
    type?: "Person" | "Organization",
    phone?: string,
    options?: CustomerCreateOptions
  ): Promise<CustomerSummary>;
}
