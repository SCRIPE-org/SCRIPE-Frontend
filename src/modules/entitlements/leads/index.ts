/**
 * Leads sub-module barrel exports.
 */
export { LeadsView } from "./src/presentation/views/LeadsView";
export { useLeadsViewModel } from "./src/presentation/viewmodels/useLeadsViewModel";
export type { PlatformLead, PlatformLeadListItem, LeadStatus } from "./src/domain/entities/PlatformLead";
export type { ILeadsRepository } from "./src/domain/interfaces/ILeadsRepository";
