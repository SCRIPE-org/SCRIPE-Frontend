import type { CustomerSummary } from "../entities/Booking";

/**
 * Documentation for module export
 */
export interface ICustomerPickerService {
  search(query: string): Promise<CustomerSummary[]>;
  getById(id: string): Promise<CustomerSummary>;
  create(displayName: string, type?: "Person" | "Organization"): Promise<CustomerSummary>;
}
