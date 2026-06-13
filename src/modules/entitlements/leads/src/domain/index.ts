/**
 * Leads domain layer barrel exports.
 * Entities, interfaces, and shared param/result types.
 */
export type {
  PlatformLead,
  PlatformLeadListItem,
  LeadStatus,
  LeadActivity,
} from "./entities/PlatformLead";
export type { ILeadsRepository } from "./interfaces/ILeadsRepository";
export type { ILeadsService } from "./interfaces/ILeadsService";
export type {
  LeadsListParams,
  UpdateLeadStatusParams,
  CreateLeadParams,
  ConvertLeadParams,
  ConvertLeadResult,
  AssignLeadParams,
  BulkLeadStatusResult,
} from "./interfaces/ILeadsRepository";
