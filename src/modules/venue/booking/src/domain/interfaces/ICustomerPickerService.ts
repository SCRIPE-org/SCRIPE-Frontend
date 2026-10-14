import type { CustomerSummary } from "../entities/Booking";

export interface CustomerCreateOptions {
  idempotencyKey?: string;
  onContactPointFailure?: (error: unknown, partyId: string) => void;
}

/**
 * Documentation for module export
 */
export interface ICustomerPickerService {
  search(query: string): Promise<CustomerSummary[]>;
  getById(id: string): Promise<CustomerSummary>;
  create(
    displayName: string,
    type?: "Person" | "Organization",
    phone?: string,
    options?: CustomerCreateOptions
  ): Promise<CustomerSummary>;
}
