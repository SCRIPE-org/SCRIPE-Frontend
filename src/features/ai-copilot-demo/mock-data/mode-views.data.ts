import type {
  MonitorAlertItem,
  QueuedWorkflowItem,
  QuickQueryId,
  ThinkingPhase,
} from "../types";

export interface QuickQueryDefinition {
  id: QuickQueryId;
  titleKey: string;
  metricKey: string;
  promptKey: string;
  answerKey: string;
  tools: Array<{
    id: string;
    toolName: string;
    labelKey: string;
    findingKey: string;
    thinkingPhase: Exclude<ThinkingPhase, "idle" | "done">;
    delayMs: number;
  }>;
}

export const QUICK_QUERIES: QuickQueryDefinition[] = [
  {
    id: "roster",
    titleKey: "quickQueries.rosterTitle",
    metricKey: "quickQueries.rosterMetric",
    promptKey: "quickQueries.rosterPrompt",
    answerKey: "quickQueries.rosterAnswer",
    tools: [
      {
        id: "qq-roster-1",
        toolName: "academy.roster.summary",
        labelKey: "quickQueries.toolRosterLabel",
        findingKey: "quickQueries.toolRosterFinding",
        thinkingPhase: "collecting",
        delayMs: 360,
      },
      {
        id: "qq-roster-2",
        toolName: "academy.branches.breakdown",
        labelKey: "quickQueries.toolBranchesLabel",
        findingKey: "quickQueries.toolBranchesFinding",
        thinkingPhase: "analyzing",
        delayMs: 360,
      },
    ],
  },
  {
    id: "utilization",
    titleKey: "quickQueries.utilizationTitle",
    metricKey: "quickQueries.utilizationMetric",
    promptKey: "quickQueries.utilizationPrompt",
    answerKey: "quickQueries.utilizationAnswer",
    tools: [
      {
        id: "qq-util-1",
        toolName: "venue.slots.occupancy",
        labelKey: "quickQueries.toolUtilLabel",
        findingKey: "quickQueries.toolUtilFinding",
        thinkingPhase: "collecting",
        delayMs: 360,
      },
      {
        id: "qq-util-2",
        toolName: "venue.pitches.peakWindow",
        labelKey: "quickQueries.toolPeakLabel",
        findingKey: "quickQueries.toolPeakFinding",
        thinkingPhase: "analyzing",
        delayMs: 360,
      },
    ],
  },
  {
    id: "surplus",
    titleKey: "quickQueries.surplusTitle",
    metricKey: "quickQueries.surplusMetric",
    promptKey: "quickQueries.surplusPrompt",
    answerKey: "quickQueries.surplusAnswer",
    tools: [
      {
        id: "qq-surplus-1",
        toolName: "finance.ledger.snapshot",
        labelKey: "quickQueries.toolSurplusLabel",
        findingKey: "quickQueries.toolSurplusFinding",
        thinkingPhase: "collecting",
        delayMs: 360,
      },
      {
        id: "qq-surplus-2",
        toolName: "finance.margin.compute",
        labelKey: "quickQueries.toolMarginLabel",
        findingKey: "quickQueries.toolMarginFinding",
        thinkingPhase: "analyzing",
        delayMs: 360,
      },
    ],
  },
  {
    id: "approvals",
    titleKey: "quickQueries.approvalsTitle",
    metricKey: "quickQueries.approvalsMetric",
    promptKey: "quickQueries.approvalsPrompt",
    answerKey: "quickQueries.approvalsAnswer",
    tools: [
      {
        id: "qq-approvals-1",
        toolName: "governance.approvals.list",
        labelKey: "quickQueries.toolApprovalsLabel",
        findingKey: "quickQueries.toolApprovalsFinding",
        thinkingPhase: "collecting",
        delayMs: 360,
      },
      {
        id: "qq-approvals-2",
        toolName: "hr.payroll.checkFlags",
        labelKey: "quickQueries.toolFlagsLabel",
        findingKey: "quickQueries.toolFlagsFinding",
        thinkingPhase: "analyzing",
        delayMs: 360,
      },
    ],
  },
];

export const QUEUED_WORKFLOWS: QueuedWorkflowItem[] = [
  {
    id: "wf-coach-replace",
    titleKey: "executeView.wf1Title",
    descKey: "executeView.wf1Desc",
    badgeKey: "executeView.wf1Badge",
    badgeTone: "warning",
    scenarioId: "academy-coach-replacement",
  },
  {
    id: "wf-u16-escalate",
    titleKey: "executeView.wf2Title",
    descKey: "executeView.wf2Desc",
    badgeKey: "executeView.wf2Badge",
    badgeTone: "info",
    scenarioId: "academy-coach-replacement",
  },
  {
    id: "wf-weekend-pitches",
    titleKey: "executeView.wf3Title",
    descKey: "executeView.wf3Desc",
    badgeKey: "executeView.wf3Badge",
    badgeTone: "success",
  },
];

export const MONITOR_TELEMETRY = [
  {
    id: "pitch-util",
    labelKey: "monitorView.metricPitchLabel",
    value: "84%",
    subKey: "monitorView.metricPitchSub",
  },
  {
    id: "coach-cov",
    labelKey: "monitorView.metricCoachLabel",
    value: "91%",
    subKey: "monitorView.metricCoachSub",
  },
  {
    id: "collection-sla",
    labelKey: "monitorView.metricSlaLabel",
    value: "84.7%",
    subKey: "monitorView.metricSlaSub",
  },
] as const;

export const INITIAL_MONITOR_ALERTS: MonitorAlertItem[] = [
  {
    id: "alert-u16-conflict",
    baseSeverity: "critical",
    titleKey: "monitorView.alert1Title",
    descKey: "monitorView.alert1Desc",
    moduleKey: "monitorView.moduleAcademy",
    timestampLabel: "19:30",
    targetMode: "execute",
    targetScenario: "academy-coach-replacement",
  },
  {
    id: "alert-overdue-receivables",
    baseSeverity: "warning",
    titleKey: "monitorView.alert2Title",
    descKey: "monitorView.alert2Desc",
    moduleKey: "monitorView.moduleFinance",
    timestampLabel: "Q3 2026",
    targetMode: "analyze",
    targetScenario: "financial-q3-report",
  },
  {
    id: "alert-nasr-overtime",
    baseSeverity: "warning",
    titleKey: "monitorView.alert3Title",
    descKey: "monitorView.alert3Desc",
    moduleKey: "monitorView.moduleHrms",
    timestampLabel: "Sep Batch",
    targetMode: "analyze",
    targetScenario: "financial-q3-report",
  },
  {
    id: "alert-pitch-b-floodlight",
    baseSeverity: "warning",
    isResolvedByDefault: true,
    titleKey: "monitorView.alert4Title",
    descKey: "monitorView.alert4Desc",
    moduleKey: "monitorView.moduleVenue",
    timestampLabel: "08:15",
    targetMode: "execute",
  },
];
