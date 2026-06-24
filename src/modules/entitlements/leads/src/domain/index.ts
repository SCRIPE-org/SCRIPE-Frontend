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
/**
 * Exported type in the entitlements/leads module.
 */
export type { ILeadsRepository } from "./interfaces/ILeadsRepository";
/**
 * Exported type in the entitlements/leads module.
 */
export type { ILeadsService } from "./interfaces/ILeadsService";
/**
 * Exported type in the entitlements/leads module.
 */
export type {
  LeadsListParams,
  UpdateLeadStatusParams,
  CreateLeadParams,
  ConvertLeadParams,
  ConvertLeadResult,
  AssignLeadParams,
  BulkLeadStatusResult,
} from "./interfaces/ILeadsRepository";
