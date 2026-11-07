import type { CustomerSummary } from "../entities/Booking";

export interface CustomerCreateOptions {
  idempotencyKey?: string;
  email?: string;
  onContactPointFailure?: (error: unknown, partyId: string) => void;
}

export interface PagedCustomerResult {
  items: CustomerSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Documentation for module export
 */
export interface ICustomerPickerService {
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
