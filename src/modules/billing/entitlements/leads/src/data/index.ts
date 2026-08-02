/**
 * Leads data layer barrel exports.
 * Only the repository class is exported — services are internal to the data layer
 * and must not be consumed directly by the presentation layer.
 */
export { LeadsRepository } from "./repositories/LeadsRepository";
export { LeadsMapper } from "./mappers/LeadsMapper";
export type {
  PagedLeadsModel,
  PlatformLeadListResponseModel,
  PlatformLeadResponseModel,
  LeadActivityResponseModel,
} from "./models/leads.models";
