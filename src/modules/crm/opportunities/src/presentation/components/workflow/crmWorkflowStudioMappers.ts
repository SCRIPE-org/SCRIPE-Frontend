import type { CrmWorkflowDefinition } from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "./CrmWorkflowCanvas2D";

/** Builds 2D Studio stage nodes from a persisted CrmWorkflowDefinition. */
export function buildStageNodesFromWorkflow(
  wf: CrmWorkflowDefinition,
): CrmWorkflowStageNode[] {
  const sorted = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const nodes: CrmWorkflowStageNode[] = sorted.map((st, idx) => ({
    stageKey: st.stageKey,
    labelEn: st.labelEn,
    labelAr: st.labelAr,
    probability: st.winProbabilityPercent ?? 0,
    slaDays:
      st.slaDays ??
      (st.category === "done" || st.category === "lost"
        ? 0
        : Math.max(2, (idx + 1) * 3)),
    order: st.sortOrder || idx + 1,
    category: st.category ?? (idx === 0 ? "todo" : "in_progress"),
    properties: st.properties ? { ...st.properties } : {},
    isTerminalWon: st.category === "done" && wf.entityType === "deal",
    isTerminalLost: st.category === "lost",
    convertsToDeal: Boolean(
      st.triggerDealConversion || st.triggersDealConversion,
    ),
    requiredExitFields: [...(st.requiredExitFields ?? [])],
    x: st.position?.x && st.position.x >= 116 + idx * 360 ? st.position.x : 116 + idx * 360,
    y: st.position?.y ?? 176,
  }));

  if (wf.entityType === "deal") {
    const lastStageX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x)) : 116;
    const termX = Math.max(116 + sorted.length * 360 + 32, lastStageX + 188 + 204);
    if (!nodes.some((n) => n.stageKey === "terminal-won")) {
      nodes.push({
        stageKey: "terminal-won",
        labelEn: "Closed Won",
        labelAr: "مغلق ناجح",
        probability: 100,
        slaDays: 0,
        order: sorted.length + 1,
        category: "done",
        isTerminalWon: true,
        isTerminalLost: false,
        requiredExitFields: [],
        x: termX,
        y: 92,
      });
    }
    if (!nodes.some((n) => n.stageKey === "terminal-lost")) {
      nodes.push({
        stageKey: "terminal-lost",
        labelEn: "Closed Lost",
        labelAr: "مغلق خاسر",
        probability: 0,
        slaDays: 0,
        order: sorted.length + 2,
        category: "lost",
        isTerminalWon: false,
        isTerminalLost: true,
        requiredExitFields: [],
        x: termX,
        y: 260,
      });
    }
  }
  return nodes;
}

/** Builds 2D Studio transitions from a persisted CrmWorkflowDefinition. */
export function buildTransitionsFromWorkflow(
  wf: CrmWorkflowDefinition,
): CrmWorkflowTransition[] {
  return wf.transitions.map((tr) => ({
    id: tr.id,
    nameEn: tr.nameEn,
    nameAr: tr.nameAr,
    fromStageKey: tr.fromStageKey,
    fromStageKeys: tr.fromStageKeys ? [...tr.fromStageKeys] : [tr.fromStageKey],
    toStageKey: tr.toStageKey,
    direction: tr.direction,
    domainEventKey: tr.domainEventKey ?? "GenericEvent",
    triggers: tr.triggers ? [...tr.triggers] : [],
    properties: tr.properties ? { ...tr.properties } : {},
    catalogRules: tr.catalogRules ? tr.catalogRules.map((r) => ({ ...r })) : [],
    requiredFields: [...(tr.rules?.requiredFieldKeys ?? [])],
    requireReason: Boolean(tr.rules?.promptForComment),
    requireNote: (tr.rules?.promptFields ?? []).length > 0,
    allowRollback: tr.rules?.allowRollback ?? true,
    blockIfLinkedDealProgressed: Boolean(tr.rules?.blockIfLinkedDealProgressed),
    requireVerifiedParty: Boolean(tr.rules?.requireVerifiedParty),
    requireEstimatedAmountPositive: Boolean(
      tr.rules?.requireEstimatedAmountPositive,
    ),
    triggerDealConversion: Boolean(tr.rules?.triggerDealConversion),
    autoCreateWorkTask: Boolean(tr.rules?.autoCreateWorkTask),
    restrictToRoles: tr.rules?.requiredPermission
      ? [tr.rules.requiredPermission]
      : [],
    triggerWebhook: tr.rules?.autoCreateWorkTask
      ? "crm.transition.work_item"
      : "",
  }));
}

/** Serializes 2D Studio stage nodes and transitions back into a CrmWorkflowDefinition. */
export function serializeStudioDraftToWorkflow(
  selectedWorkflow: CrmWorkflowDefinition,
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
): CrmWorkflowDefinition {
  const nonTerm = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost);
  const existingMap = new Map(selectedWorkflow.stages.map((st) => [st.stageKey, st]));
  const orderMap = new Map(stages.map((st) => [st.stageKey, st.order]));
  return {
    ...selectedWorkflow,
    version: (selectedWorkflow.version ?? 1) + 1,
    stages: nonTerm.map((s) => {
      const prev = existingMap.get(s.stageKey);
      return {
        stageKey: s.stageKey,
        labelEn: s.labelEn,
        labelAr: s.labelAr,
        sortOrder: s.order,
        category:
          s.category ??
          prev?.category ??
          (s.convertsToDeal ? "done" : s.order === 1 ? "todo" : "in_progress"),
        winProbabilityPercent: s.probability,
        slaDays: s.slaDays,
        properties: s.properties ?? prev?.properties,
        requiredExitFields: s.requiredExitFields,
        requiresVerifiedParty: s.requiredExitFields.includes("partyId"),
        triggerDealConversion: Boolean(s.convertsToDeal),
        triggersDealConversion: Boolean(s.convertsToDeal),
        allowInboundFromAny: prev?.allowInboundFromAny,
        position: { x: s.x, y: s.y },
      };
    }),
    transitions: transitions.map((tr) => {
      const fromOrder = orderMap.get(tr.fromStageKey) ?? 0;
      const toOrder = orderMap.get(tr.toStageKey) ?? 0;
      const resolvedDirection =
        tr.fromStageKey === "*"
          ? "global"
          : toOrder < fromOrder
            ? "backward"
            : tr.direction ?? "forward";
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
        properties: tr.properties ?? {},
        catalogRules: tr.catalogRules ?? [],
        rules: {
          allowRollback: tr.allowRollback ?? true,
          requiredPermission: tr.restrictToRoles?.[0] ?? null,
          blockIfLinkedDealProgressed: Boolean(tr.blockIfLinkedDealProgressed),
          promptForComment: Boolean(tr.requireReason),
          promptFields: tr.requireNote ? ["qualificationNotes"] : [],
          requireVerifiedParty: Boolean(
            tr.requireVerifiedParty || tr.requiredFields.includes("partyId"),
          ),
          requireEstimatedAmountPositive: Boolean(
            tr.requireEstimatedAmountPositive ||
              tr.requiredFields.includes("estimatedAmount"),
          ),
          requireTargetCloseDate: tr.requiredFields.includes("targetCloseDate"),
          requiredFieldKeys: tr.requiredFields,
          triggerDealConversion: Boolean(tr.triggerDealConversion),
          autoCreateWorkTask: Boolean(tr.autoCreateWorkTask),
        },
      };
    }),
  };
}
