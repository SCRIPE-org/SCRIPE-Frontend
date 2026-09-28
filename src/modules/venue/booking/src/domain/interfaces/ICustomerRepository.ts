import type { CustomerSummary } from "../entities/Booking";

export interface ICustomerRepository {
  search(query: string): Promise<CustomerSummary[]>;
  getById(id: string): Promise<CustomerSummary>;
  create(displayName: string, type?: "Person" | "Organization"): Promise<CustomerSummary>;
}
