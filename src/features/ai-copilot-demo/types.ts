export type CopilotMode = "ask" | "execute" | "analyze" | "monitor";

export type ScenarioId = "academy-coach-replacement" | "financial-q3-report";

export type SessionStatus = "available" | "conflict";

export interface CoachOption {
  id: string;
  nameEn: string;
  nameAr: string;
  certification: string;
  isAvailable: boolean;
}

export interface SessionReassignmentRow {
  id: string;
  sessionTitleKey: string;
  ageGroup: string;
  timeRange: string;
  pitchEn: string;
  pitchAr: string;
  athletesCount: number;
  guardiansCount: number;
  currentCoachEn: string;
  currentCoachAr: string;
  selectedReplacementId: string;
  defaultReplacementId: string;
  status: SessionStatus;
  conflictReasonKey?: string;
}

export interface ProposedActionItem {
  id: "reassign_sessions" | "prepare_notifications" | "escalate_conflict";
  labelKey: string;
  descriptionKey: string;
  enabled: boolean;
  requiresHumanApproval: boolean;
}

export interface GuardianNotificationSample {
  id: string;
  group: string;
  recipientCount: number;
  channel: "SMS & Push";
  sampleGuardianEn: string;
  sampleGuardianAr: string;
  messageEn: string;
  messageAr: string;
}

export interface MonthlyFinancialPoint {
  id: "jul" | "aug" | "sep";
  monthEn: string;
  monthAr: string;
  revenueM: number;
  expensesM: number;
  surplusM: number;
}

export interface BreakdownItem {
  id: string;
  labelKey: string;
  amountEgp: number;
  formattedAmountEn: string;
  formattedAmountAr: string;
  sharePercent: number;
  chartSlot: number;
}

export interface ExecutiveInsightItem {
  id: string;
  tone: "success" | "info" | "warning";
  titleKey: string;
  summaryKey: string;
  metricBadge: string;
}

export interface SupportingDocumentItem {
  id: string;
  code: string;
  categoryKey: string;
  titleKey: string;
  fileName: string;
  dateRange: string;
  recordCount: string;
  amountSummaryEn: string;
  amountSummaryAr: string;
  status: "verified" | "review";
  privacyMasked?: boolean;
  previewSummaryKey: string;
  previewLines: Array<{
    labelKey: string;
    valueEn: string;
    valueAr: string;
  }>;
}

export type ThinkingPhase = "idle" | "thinking" | "collecting" | "analyzing" | "done";

export type ToolCallStatus = "pending" | "running" | "done";

export interface ToolCallTraceItem {
  id: string;
  toolName: string;
  labelKey: string;
  findingKey: string;
  status: ToolCallStatus;
  durationMs?: number;
}

export interface CopilotStageItem {
  id: string;
  labelKey: string;
  status: "pending" | "active" | "done";
}

export type CopilotCardType =
  | "academy-plan"
  | "financial-summary"
  | "unsupported"
  | "mode-preview";

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
  timestamp: string;
  scenarioId?: ScenarioId;
  cardType?: CopilotCardType;
  modePreview?: CopilotMode;
}

export type ExecutionPhase = "idle" | "executing" | "completed";

export type QuickQueryId = "roster" | "utilization" | "surplus" | "approvals";

export type MonitorSeverity = "critical" | "warning" | "resolved";

export type MonitorSeverityFilter = "all" | MonitorSeverity;

export interface MonitorAlertItem {
  id: string;
  baseSeverity: "critical" | "warning";
  isResolvedByDefault?: boolean;
  titleKey: string;
  descKey: string;
  moduleKey: string;
  timestampLabel: string;
  targetMode: "execute" | "analyze";
  targetScenario?: ScenarioId;
}

export interface QueuedWorkflowItem {
  id: string;
  titleKey: string;
  descKey: string;
  badgeKey: string;
  badgeTone: "success" | "warning" | "info";
  scenarioId?: ScenarioId;
}
