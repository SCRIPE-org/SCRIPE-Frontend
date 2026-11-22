import type {
  CrmStageColorToken,
  CrmWorkflowStageCategory,
} from "@modules/crm";

/** Definition of a canonical opportunity Kanban pipeline stage column. */
export interface KanbanStageDef {
  key: string;
  labelKey: string;
  defaultLabelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  winProbabilityPercent?: number | null;
  requiresParty?: boolean;
  category?: CrmWorkflowStageCategory;
  color?: CrmStageColorToken;
  customColorHex?: string;
}

/** Default five-stage commercial Kanban pipeline definitions with bilingual labels and probabilities. */
export const CANONICAL_KANBAN_STAGES: KanbanStageDef[] = [
  { key: "default.discovery", labelKey: "crmOpportunities.stages.discovery", defaultLabelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, winProbabilityPercent: 10, category: "todo", color: "blue" },
  { key: "default.qualification", labelKey: "crmOpportunities.stages.qualification", defaultLabelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, winProbabilityPercent: 25, category: "in_progress", color: "cyan" },
  { key: "default.solution_fit", labelKey: "crmOpportunities.stages.solution_fit", defaultLabelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, winProbabilityPercent: 50, category: "in_progress", color: "indigo" },
  { key: "default.proposal", labelKey: "crmOpportunities.stages.proposal", defaultLabelEn: "Proposal", labelAr: "عرض تجاري", sortOrder: 4, winProbabilityPercent: 75, requiresParty: true, category: "in_progress", color: "violet" },
  { key: "default.negotiation", labelKey: "crmOpportunities.stages.negotiation", defaultLabelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, winProbabilityPercent: 90, requiresParty: true, category: "in_progress", color: "amber" },
];

/** Re-exported canonical bilingual terminal stage labels for Opportunities views. */
export { CANONICAL_TERMINAL_LABELS } from "@modules/crm/shared";
