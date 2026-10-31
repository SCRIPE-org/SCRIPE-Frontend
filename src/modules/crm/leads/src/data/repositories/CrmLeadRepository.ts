import type { ICrmLeadRepository } from "../../domain/interfaces/ICrmLeadRepository";
import type { ICrmLeadService } from "../../domain/interfaces/ICrmLeadService";
import type {
  CrmLead,
  CreateLeadInput,
  LeadsFilterParams,
  PagedLeadsResult,
} from "../../domain/models/crm-lead.types";

export class CrmLeadRepository implements ICrmLeadRepository {
  constructor(private readonly service: ICrmLeadService) {}

  getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult> {
    return this.service.getLeads(params);
  }

  getLeadById(id: string): Promise<CrmLead> {
    return this.service.getLeadById(id);
  }

  createLead(input: CreateLeadInput): Promise<CrmLead> {
    return this.service.createLead(input);
  }
}
