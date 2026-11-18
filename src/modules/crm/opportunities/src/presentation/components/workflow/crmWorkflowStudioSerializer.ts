import { resolveDefaultStageColor, type CrmWorkflowDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";

/** Serializes 2D Studio stage nodes and transitions back into a CrmWorkflowDefinition. */
export function serializeStudioDraftToWorkflow(
  selectedWorkflow: CrmWorkflowDefinition,
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
): CrmWorkflowDefinition {
  const existingMap = new Map(selectedWorkflow.stages.map((st) => [st.stageKey, st]));
  const orderMap = new Map(stages.map((st) => [st.stageKey, st.order]));
  return {
    ...selectedWorkflow,
    version: (selectedWorkflow.version ?? 1) + 1,
    properties: { ...(selectedWorkflow.properties ?? {}), customTerminalStages: "true" },
    stages: stages.map((s, idx) => {
      const prev = existingMap.get(s.stageKey);
      const category = s.category ?? prev?.category ?? (s.isTerminalWon ? "done" : s.isTerminalLost ? "lost" : s.convertsToDeal ? "done" : s.order === 1 ? "todo" : "in_progress");
      const color = resolveDefaultStageColor(s.stageKey, category, idx + 1, s.color ?? prev?.color);
      const customColorHex = s.customColorHex ?? s.properties?.customColorHex ?? prev?.customColorHex ?? prev?.properties?.customColorHex;
      const allowInboundFromAny = Boolean(
        s.allowInboundFromAny ||
          transitions.some((tr) => (tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")) && tr.toStageKey === s.stageKey),
      );
      return {
        stageKey: s.stageKey, labelEn: s.labelEn, labelAr: s.labelAr, sortOrder: idx + 1, category, color, customColorHex,
        winProbabilityPercent: s.probability, slaDays: s.slaDays,
        properties: {
          ...(prev?.properties ?? {}),
          ...(s.properties ?? {}),
          color,
          allowInboundFromAny: String(allowInboundFromAny),
          ...(customColorHex ? { customColorHex } : {}),
        },
        requiredExitFields: s.requiredExitFields,
        requiresVerifiedParty: s.requiredExitFields.includes("partyId"),
        triggerDealConversion: Boolean(s.convertsToDeal), triggersDealConversion: Boolean(s.convertsToDeal),
        allowInboundFromAny,
        position: { x: s.x, y: s.y },
      };
    }),
    transitions: transitions.map((tr) => {
      const fromOrder = orderMap.get(tr.fromStageKey) ?? 0;
      const toOrder = orderMap.get(tr.toStageKey) ?? 0;
      const isGlobal = tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*");
      const resolvedDirection = isGlobal ? "global" : toOrder < fromOrder ? "backward" : tr.direction ?? "forward";
      const nextProps: Record<string, string> = { ...(tr.properties ?? {}) };
      if (tr.sourcePort) nextProps.sourcePort = tr.sourcePort;
      if (tr.targetPort) nextProps.targetPort = tr.targetPort;
      const noteFieldKey = selectedWorkflow.entityType === "lead" ? "qualificationNotes" : "closeNotes";
      const basePromptFields = [...(tr.promptFields ?? [])];
      const hasNoteField = basePromptFields.some((f) => f === "qualificationNotes" || f === "closeNotes");
      const nextPromptFields = tr.requireNote
        ? (hasNoteField ? basePromptFields : [...basePromptFields, noteFieldKey])
        : basePromptFields.filter((f) => f !== "qualificationNotes" && f !== "closeNotes");
      return {
        id: tr.id,
        nameEn: tr.nameEn,
        nameAr: tr.nameAr,
        fromStageKey: tr.fromStageKey,
        fromStageKeys: tr.fromStageKeys && tr.fromStageKeys.length > 0 ? tr.fromStageKeys : [tr.fromStageKey],
        toStageKey: tr.toStageKey,
        direction: resolvedDirection,
        domainEventKey: tr.domainEventKey ?? "GenericEvent",
        triggers: tr.triggers ?? [],
        properties: nextProps,
        catalogRules: tr.catalogRules ?? [],
        rules: {
          allowRollback: tr.allowRollback ?? true,
          requiredPermission: tr.restrictToRoles?.[0] ?? null,
          blockIfLinkedDealProgressed: Boolean(tr.blockIfLinkedDealProgressed),
          promptForComment: Boolean(tr.requireReason),
          promptFields: nextPromptFields,
          requireVerifiedParty: Boolean(tr.requireVerifiedParty || tr.requiredFields.includes("partyId")),
          requireEstimatedAmountPositive: Boolean(tr.requireEstimatedAmountPositive || tr.requiredFields.includes("estimatedAmount")),
          requireTargetCloseDate: tr.requiredFields.includes("targetCloseDate"),
          requiredFieldKeys: tr.requiredFields,
          triggerDealConversion: Boolean(tr.triggerDealConversion),
          autoCreateWorkTask: Boolean(tr.autoCreateWorkTask),
        },
      };
    }),
  };
}
