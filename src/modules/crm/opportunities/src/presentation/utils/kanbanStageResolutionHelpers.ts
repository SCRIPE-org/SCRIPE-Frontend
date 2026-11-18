import {
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
  type CrmWorkflowStageCategory,
} from "@modules/crm";
import {
  CANONICAL_KANBAN_STAGES,
  CANONICAL_TERMINAL_LABELS,
  type KanbanStageDef,
} from "../../domain/constants/crmCanonicalStages";
import type { PipelineStageConfig } from "../../domain/entities/OpportunityEntity";

/** Resolves effective Opportunity Kanban stages by merging backend pipeline stages and active workflow metadata. */
export function buildEffectiveKanbanStages(
  stages: PipelineStageConfig[] | undefined,
  includeOutcomeStagesAsColumns: boolean
): KanbanStageDef[] {
  const activeWorkflow = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
  const wfStagesByKey = new Map((activeWorkflow?.stages ?? []).map((ws) => [ws.stageKey, ws]));
  const canonicalByKey = new Map(CANONICAL_KANBAN_STAGES.map((cs) => [cs.key, cs]));

  let baseStages: KanbanStageDef[] = [];

  if (stages && stages.length > 0) {
    const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
    const allUniform50OrNull =
      sorted.length >= 3 &&
      sorted.every((st) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50);
    baseStages = sorted.map((s) => {
      const wfStage = wfStagesByKey.get(s.stageKey);
      const canonical = canonicalByKey.get(s.stageKey);
      const category = (
        s.statusCategory ?? wfStage?.category ?? canonical?.category ?? "in_progress"
      ) as CrmWorkflowStageCategory;
      const color = resolveDefaultStageColor(
        s.stageKey,
        category,
        s.sortOrder,
        s.color ?? wfStage?.color
      );
      const rawProb = s.winProbabilityPercent ?? s.probabilityPercent;
      const resolvedProb =
        rawProb == null || allUniform50OrNull
          ? wfStage?.winProbabilityPercent ?? canonical?.winProbabilityPercent ?? rawProb ?? null
          : rawProb;
      return {
        key: s.stageKey,
        labelKey: `crmOpportunities.stages.${s.stageKey.replace("default.", "")}`,
        defaultLabelEn: s.labelEn || wfStage?.labelEn || canonical?.defaultLabelEn || s.stageKey,
        labelAr: s.labelAr || wfStage?.labelAr || canonical?.labelAr,
        sortOrder: s.sortOrder,
        winProbabilityPercent: resolvedProb,
        requiresParty: s.requiresVerifiedParty,
        category,
        color,
        customColorHex: wfStage?.customColorHex || wfStage?.properties?.customColorHex,
      };
    });
  } else if (activeWorkflow?.stages && activeWorkflow.stages.length >= 2) {
    const raw = includeOutcomeStagesAsColumns
      ? activeWorkflow.stages
      : activeWorkflow.stages.filter((s) => s.category !== "done" && s.category !== "lost");
    baseStages = [...raw]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => {
        const category = (s.category ?? "in_progress") as CrmWorkflowStageCategory;
        return {
          key: s.stageKey,
          labelKey: `crmOpportunities.stages.${s.stageKey.replace("default.", "")}`,
          defaultLabelEn: s.labelEn,
          labelAr: s.labelAr,
          sortOrder: s.sortOrder,
          winProbabilityPercent: s.winProbabilityPercent ?? null,
          requiresParty:
            s.requiresVerifiedParty ??
            (s.stageKey.includes("proposal") || s.stageKey.includes("negotiation")),
          category,
          color: resolveDefaultStageColor(s.stageKey, category, s.sortOrder, s.color),
          customColorHex: s.customColorHex || s.properties?.customColorHex,
        };
      });
  } else {
    baseStages = [...CANONICAL_KANBAN_STAGES];
  }

  if (includeOutcomeStagesAsColumns) {
    const hasDone = baseStages.some(
      (s) => s.category === "done" || s.key.includes("won") || s.winProbabilityPercent === 100
    );
    if (!hasDone) {
      const wfWon = wfStagesByKey.get("terminal-won") ?? wfStagesByKey.get("default.closed_won");
      baseStages.push({
        key: wfWon?.stageKey ?? "default.closed_won",
        labelKey: "crmOpportunities.dialogs.close.outcomeWon",
        defaultLabelEn: wfWon?.labelEn ?? CANONICAL_TERMINAL_LABELS.wonStageEn,
        labelAr: wfWon?.labelAr ?? CANONICAL_TERMINAL_LABELS.wonColumnAr,
        sortOrder: baseStages.length + 1,
        winProbabilityPercent: 100,
        requiresParty: Boolean(
          wfWon?.requiresVerifiedParty || wfWon?.requiredExitFields?.includes("partyId")
        ),
        category: "done",
        color: resolveDefaultStageColor(
          "default.closed_won",
          "done",
          baseStages.length + 1,
          wfWon?.color
        ),
        customColorHex: wfWon?.customColorHex || wfWon?.properties?.customColorHex,
      });
    }
    const hasLost = baseStages.some(
      (s) => s.category === "lost" || s.key.includes("lost") || s.winProbabilityPercent === 0
    );
    if (!hasLost) {
      const wfLost = wfStagesByKey.get("terminal-lost") ?? wfStagesByKey.get("default.closed_lost");
      baseStages.push({
        key: wfLost?.stageKey ?? "default.closed_lost",
        labelKey: "crmOpportunities.dialogs.close.outcomeLost",
        defaultLabelEn: wfLost?.labelEn ?? CANONICAL_TERMINAL_LABELS.lostStageEn,
        labelAr: wfLost?.labelAr ?? CANONICAL_TERMINAL_LABELS.lostColumnAr,
        sortOrder: baseStages.length + 1,
        winProbabilityPercent: 0,
        requiresParty: false,
        category: "lost",
        color: resolveDefaultStageColor(
          "default.closed_lost",
          "lost",
          baseStages.length + 1,
          wfLost?.color
        ),
        customColorHex: wfLost?.customColorHex || wfLost?.properties?.customColorHex,
      });
    }
  }

  return baseStages;
}
