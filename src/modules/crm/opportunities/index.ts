/**
 * CRM Opportunities Sub-Module Public Exports
 */

export * from "./src/domain/entities/OpportunityEntity";
export * from "./src/domain/models/crm-opportunity.types";
export * from "./src/domain/interfaces/ICrmOpportunityService";
export * from "./src/domain/interfaces/ICrmOpportunityRepository";
export * from "./src/data/models/OpportunityModel";
export * from "./src/data/mappers/CrmOpportunityMapper";
export * from "./src/data/services/CrmOpportunityService";
export * from "./src/data/repositories/CrmOpportunityRepository";
export * from "./src/presentation/views/OpportunitiesView";
export * from "./src/presentation/views/OpportunityDetailView";
export * from "./src/presentation/views/PipelineManagementView";
export * from "./src/presentation/components/OpportunitiesTable";
export * from "./src/presentation/components/OpportunityStatusBadge";
export * from "./src/presentation/components/OpportunityStageBadge";
export * from "./src/presentation/components/OpportunityOverviewCard";
export * from "./src/presentation/components/OpportunityAuditTimeline";
export * from "./src/presentation/components/CreateOpportunityDialog";
export * from "./src/presentation/components/MoveStageDialog";
export * from "./src/presentation/components/CloseOpportunityDialog";
export * from "./src/presentation/components/ReopenOpportunityDialog";
export * from "./src/presentation/components/AssignOwnerDialog";
export * from "./src/presentation/viewmodels/useOpportunitiesViewModel";
export * from "./src/presentation/viewmodels/useOpportunityDetailViewModel";
