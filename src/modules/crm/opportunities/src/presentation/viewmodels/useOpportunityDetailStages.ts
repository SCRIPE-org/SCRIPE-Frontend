"use client";

import { useMemo } from "react";
import { resolveDefaultStageColor, type CrmStageColorToken } from "@modules/crm";

export interface ResolvedDetailStage {
  key: string;
  label: string;
  order: number;
  color: CrmStageColorToken;
  customColorHex?: string;
  requiresParty: boolean;
}

const DEFAULT_STAGE_STEPS = [
  { key: "default.discovery", labelKey: "crmOpportunities.stages.discovery", order: 1, requiresParty: false },
  { key: "default.qualification", labelKey: "crmOpportunities.stages.qualification", order: 2, requiresParty: false },
  { key: "default.solution_fit", labelKey: "crmOpportunities.stages.solutionFit", order: 3, requiresParty: false },
  { key: "default.proposal", labelKey: "crmOpportunities.stages.proposal", order: 4, requiresParty: true },
  { key: "default.negotiation", labelKey: "crmOpportunities.stages.negotiation", order: 5, requiresParty: true },
];

export function useOpportunityDetailStages({
  activeDealWorkflow,
  pipeline,
  isRtl,
  t,
}: {
  readonly activeDealWorkflow: any;
  readonly pipeline: any;
  readonly isRtl: boolean;
  readonly t: (key: string) => string;
}): ResolvedDetailStage[] {
  return useMemo(() => {
    const sourceStages =
      activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
        ? activeDealWorkflow.stages
        : pipeline?.stages ?? [];

    const baseStages: ResolvedDetailStage[] =
      sourceStages.length > 0
        ? [...sourceStages]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((s) => {
              const rawStage = s as {
                category?: "todo" | "in_progress" | "done" | "lost";
                color?: string;
                customColorHex?: string;
                properties?: Record<string, string>;
              };
              return {
                key: s.stageKey,
                label: isRtl && s.labelAr ? s.labelAr : s.labelEn,
                order: s.sortOrder,
                color: resolveDefaultStageColor(s.stageKey, rawStage.category, s.sortOrder, rawStage.color),
                customColorHex: rawStage.customColorHex || rawStage.properties?.customColorHex,
                requiresParty:
                  s.stageKey !== "terminal-lost" &&
                  rawStage.category !== "lost" &&
                  Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")),
              };
            })
        : DEFAULT_STAGE_STEPS.map((st) => ({
            ...st,
            label: t(st.labelKey),
            color: resolveDefaultStageColor(st.key, "in_progress", st.order),
            customColorHex: undefined as string | undefined,
          }));

    return activeDealWorkflow?.properties?.customTerminalStages === "true"
      ? baseStages
      : [
          ...baseStages,
          ...(baseStages.some((s) => s.key === "terminal-won" || s.key.includes("won"))
            ? []
            : [
                {
                  key: "terminal-won",
                  label: t("crmOpportunities.stages.closed_won"),
                  order: baseStages.length + 1,
                  color: resolveDefaultStageColor("terminal-won", "done", baseStages.length + 1),
                  customColorHex: undefined,
                  requiresParty: true,
                },
              ]),
          ...(baseStages.some((s) => s.key === "terminal-lost" || s.key.includes("lost"))
            ? []
            : [
                {
                  key: "terminal-lost",
                  label: t("crmOpportunities.stages.closed_lost"),
                  order: baseStages.length + 2,
                  color: resolveDefaultStageColor("terminal-lost", "lost", baseStages.length + 2),
                  customColorHex: undefined,
                  requiresParty: false,
                },
              ]),
        ];
  }, [activeDealWorkflow, pipeline, isRtl, t]);
}
