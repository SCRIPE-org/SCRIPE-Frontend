import type { CustomerSummary } from "../../domain/entities/Booking";
import type { ICustomerPickerService } from "../../domain/interfaces/ICustomerPickerService";
import type { ICustomerRepository } from "../../domain/interfaces/ICustomerRepository";

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly service: ICustomerPickerService) {}
  search(query: string): Promise<CustomerSummary[]> {
    return this.service.search(query);
  }
  getById(id: string): Promise<CustomerSummary> {
    return this.service.getById(id);
  }
  create(displayName: string, type?: "Person" | "Organization"): Promise<CustomerSummary> {
    return this.service.create(displayName, type);
  }
}
