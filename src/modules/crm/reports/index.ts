export { CrmReportEntity } from "./src/domain/entities/CrmReportEntity";
export type {
  CrmStageReportItem,
  CrmStageReportBucket,
  CrmCurrencyPipelineBreakdown,
  CrmLeadFunnelReport,
  CrmWinLossSummary,
  CrmActivitySummary,
  CrmPipelineReport,
  CrmCommercialReport,
} from "./src/domain/entities/CrmReportEntity";
export type { ICrmReportsService } from "./src/domain/interfaces/ICrmReportsService";
export type { ICrmReportsRepository } from "./src/domain/interfaces/ICrmReportsRepository";
export { CrmReportsService } from "./src/data/services/CrmReportsService";
export { CrmReportsRepository } from "./src/data/repositories/CrmReportsRepository";
export { CrmReportsMapper } from "./src/data/mappers/CrmReportsMapper";
export { CRM_REPORTS_ENDPOINTS } from "./src/data/services/crm-reports.endpoints";
export {
  useCrmReportsViewModel,
  formatSafeCsvCell,
  type CrmReportsState,
} from "./src/presentation/viewmodels/useCrmReportsViewModel";
export { CrmReportsView } from "./src/presentation/views/CrmReportsView";
export { CrmReportsSkeleton } from "./src/presentation/components/CrmReportsSkeleton";
export {
  CrmReportsKpiGrid,
  type CrmReportsKpiGridProps,
} from "./src/presentation/components/CrmReportsKpiGrid";
export {
  CrmReportsBreakdownsSection,
  type CrmReportsBreakdownsSectionProps,
} from "./src/presentation/components/CrmReportsBreakdownsSection";
export {
  CrmReportsFunnelAndTouchpointsColumn,
  type CrmReportsFunnelAndTouchpointsColumnProps,
} from "./src/presentation/components/CrmReportsFunnelAndTouchpointsColumn";
