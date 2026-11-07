import type {
  CrmStageColorToken,
  CrmWorkflowStageCategory,
} from "@modules/crm";

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

export const CANONICAL_KANBAN_STAGES: KanbanStageDef[] = [
  { key: "default.discovery", labelKey: "crmOpportunities.stages.discovery", defaultLabelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, winProbabilityPercent: 10, category: "todo", color: "blue" },
  { key: "default.qualification", labelKey: "crmOpportunities.stages.qualification", defaultLabelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, winProbabilityPercent: 25, category: "in_progress", color: "cyan" },
  { key: "default.solution_fit", labelKey: "crmOpportunities.stages.solution_fit", defaultLabelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, winProbabilityPercent: 50, category: "in_progress", color: "indigo" },
  { key: "default.proposal", labelKey: "crmOpportunities.stages.proposal", defaultLabelEn: "Proposal", labelAr: "عرض تجاري", sortOrder: 4, winProbabilityPercent: 75, requiresParty: true, category: "in_progress", color: "violet" },
  { key: "default.negotiation", labelKey: "crmOpportunities.stages.negotiation", defaultLabelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, winProbabilityPercent: 90, requiresParty: true, category: "in_progress", color: "amber" },
];

export const CANONICAL_TERMINAL_LABELS = {
  wonStageEn: "Closed Won",
  wonStageAr: "مغلق ناجح",
  lostStageEn: "Closed Lost",
  lostStageAr: "مغلق خاسر",
  wonColumnAr: "مغلقة — رابحة",
  lostColumnAr: "مغلقة — خاسرة",
  closeWonTransitionEn: "Close as Won",
  closeWonTransitionAr: "إغلاق كصفقة رابحة",
  markLostTransitionEn: "Mark as Lost",
  markLostTransitionAr: "تسجيل كصفقة خاسرة",
  reopenLostTransitionEn: "Reopen Deal",
  reopenLostTransitionAr: "إعادة فتح الصفقة",
  moveToPrefixEn: "Move to",
  moveToPrefixAr: "الانتقال إلى",
} as const;
