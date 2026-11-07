import { resolveDefaultStageColor, type CrmWorkflowDefinition } from "@modules/crm";
import { CANONICAL_TERMINAL_LABELS } from "../../../domain/constants/crmCanonicalStages";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import type { StagePortId } from "./CrmWorkflowCanvasSubViews";

/** Computes a generous 2-row 2D topological position (Row 1 y=84, Row 2 y=360, dx=300) so top & mid corridors fit multiple parallel lanes with zero collisions. */
export function computeBalanced2DStagePosition(idx: number): { x: number; y: number } {
  if (idx < 3) return { x: 110 + idx * 300, y: 84 };
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  return { x: 160 + col * 300, y: 84 + row * 276 };
}

/** Builds 2D Studio stage nodes from a persisted CrmWorkflowDefinition. */
export function buildStageNodesFromWorkflow(wf: CrmWorkflowDefinition): CrmWorkflowStageNode[] {
  const sorted = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
  let nonTermIdx = 0;
  const nodes: CrmWorkflowStageNode[] = sorted.map((st, idx) => {
    const isDealWon = wf.entityType === "deal" && (st.stageKey === "terminal-won" || st.category === "done");
    const isDealLost = wf.entityType === "deal" && (st.stageKey === "terminal-lost" || st.category === "lost");
    const defPos = isDealWon
      ? { x: 1010, y: 84 }
      : isDealLost
        ? { x: 1010, y: 360 }
        : computeBalanced2DStagePosition(nonTermIdx++);
    const hasCustomPos =
      st.position &&
      typeof st.position.x === "number" &&
      typeof st.position.y === "number" &&
      st.position.x <= 1100 &&
      st.position.y !== 64 &&
      st.position.y !== 340 &&
      st.position.y !== 72 &&
      st.position.y !== 272 &&
      st.position.y !== 96 &&
      st.position.y !== 260;
    const category = st.category ?? (idx === 0 ? "todo" : "in_progress");
    const color = resolveDefaultStageColor(st.stageKey, category, st.sortOrder || idx + 1, st.color || st.properties?.color);
    const hasGlobalInbound = wf.transitions.some(
      (tr) => (tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")) && tr.toStageKey === st.stageKey,
    );
    return {
      stageKey: st.stageKey,
      labelEn: st.labelEn,
      labelAr: st.labelAr,
      probability: st.winProbabilityPercent ?? 0,
      slaDays: st.slaDays ?? (category === "done" || category === "lost" ? 0 : Math.max(2, (idx + 1) * 3)),
      order: st.sortOrder || idx + 1,
      category,
      color,
      customColorHex: st.customColorHex || st.properties?.customColorHex,
      properties: st.properties ? { ...st.properties } : {},
      allowInboundFromAny: Boolean(st.allowInboundFromAny || hasGlobalInbound),
      isTerminalWon: isDealWon,
      isTerminalLost: isDealLost,
      convertsToDeal: Boolean(st.triggerDealConversion || st.triggersDealConversion),
      requiredExitFields: [...(st.requiredExitFields ?? [])],
      x: hasCustomPos ? st.position!.x : defPos.x,
      y: hasCustomPos ? st.position!.y : defPos.y,
    };
  });

  if (wf.entityType === "deal" && wf.properties?.customTerminalStages !== "true") {
    if (!nodes.some((n) => n.stageKey === "terminal-won" || n.isTerminalWon)) {
      nodes.push({
        stageKey: "terminal-won",
        labelEn: CANONICAL_TERMINAL_LABELS.wonStageEn,
        labelAr: CANONICAL_TERMINAL_LABELS.wonStageAr,
        probability: 100,
        slaDays: 0,
        order: sorted.length + 1,
        category: "done",
        color: "emerald",
        allowInboundFromAny: false,
        isTerminalWon: true,
        isTerminalLost: false,
        requiredExitFields: [],
        x: 1010,
        y: 84,
      });
    }
    if (!nodes.some((n) => n.stageKey === "terminal-lost" || n.isTerminalLost)) {
      nodes.push({
        stageKey: "terminal-lost",
        labelEn: CANONICAL_TERMINAL_LABELS.lostStageEn,
        labelAr: CANONICAL_TERMINAL_LABELS.lostStageAr,
        probability: 0,
        slaDays: 0,
        order: sorted.length + 2,
        category: "lost",
        color: "rose",
        allowInboundFromAny: true,
        isTerminalWon: false,
        isTerminalLost: true,
        requiredExitFields: [],
        x: 1010,
        y: 360,
      });
    }
  }
  return nodes;
}

/** Builds 2D Studio transitions from a persisted CrmWorkflowDefinition, connecting Closed Won and Closed Lost as first-class stages. */
export function buildTransitionsFromWorkflow(wf: CrmWorkflowDefinition): CrmWorkflowTransition[] {
  const mapped: CrmWorkflowTransition[] = wf.transitions.map((tr) => ({
    id: tr.id,
    nameEn: tr.nameEn,
    nameAr: tr.nameAr,
    fromStageKey: tr.fromStageKey,
    fromStageKeys: tr.fromStageKeys ? [...tr.fromStageKeys] : [tr.fromStageKey],
    toStageKey: tr.toStageKey,
    direction: tr.direction,
    sourcePort: (tr.properties?.sourcePort as StagePortId | undefined) ?? undefined,
    targetPort: (tr.properties?.targetPort as StagePortId | undefined) ?? undefined,
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
    requireEstimatedAmountPositive: Boolean(tr.rules?.requireEstimatedAmountPositive),
    triggerDealConversion: Boolean(tr.rules?.triggerDealConversion),
    autoCreateWorkTask: Boolean(tr.rules?.autoCreateWorkTask),
    restrictToRoles: tr.rules?.requiredPermission ? [tr.rules.requiredPermission] : [],
    triggerWebhook: tr.rules?.autoCreateWorkTask ? "crm.transition.work_item" : "",
  }));

  if (wf.entityType === "deal" && wf.properties?.customTerminalStages !== "true") {
    const sorted = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
    const firstStage = sorted[0];
    const lastActive = [...sorted].reverse().find((s) => s.category !== "done" && s.category !== "lost") ?? sorted[sorted.length - 1];
    if (lastActive && !mapped.some((t) => t.toStageKey === "terminal-won")) {
      mapped.push({
        id: "tr-deal-close-won",
        nameEn: CANONICAL_TERMINAL_LABELS.closeWonTransitionEn,
        nameAr: CANONICAL_TERMINAL_LABELS.closeWonTransitionAr,
        fromStageKey: lastActive.stageKey,
        fromStageKeys: [lastActive.stageKey],
        toStageKey: "terminal-won",
        direction: "forward",
        domainEventKey: "DealClosedWonEvent",
        triggers: [],
        properties: {},
        catalogRules: [],
        requiredFields: ["partyId", "estimatedAmount"],
        requireReason: false,
        requireNote: false,
        allowRollback: true,
        requireVerifiedParty: true,
        requireEstimatedAmountPositive: true,
      });
    }
    if (!mapped.some((t) => t.toStageKey === "terminal-lost")) {
      mapped.push({
        id: "tr-deal-mark-lost",
        nameEn: CANONICAL_TERMINAL_LABELS.markLostTransitionEn,
        nameAr: CANONICAL_TERMINAL_LABELS.markLostTransitionAr,
        fromStageKey: "*",
        fromStageKeys: ["*"],
        toStageKey: "terminal-lost",
        direction: "global",
        domainEventKey: "DealClosedLostEvent",
        triggers: [],
        properties: {},
        catalogRules: [],
        requiredFields: [],
        requireReason: true,
        requireNote: false,
        allowRollback: true,
      });
    }
    if (firstStage && !mapped.some((t) => t.fromStageKey === "terminal-lost")) {
      mapped.push({
        id: "tr-deal-reopen-lost",
        nameEn: CANONICAL_TERMINAL_LABELS.reopenLostTransitionEn,
        nameAr: CANONICAL_TERMINAL_LABELS.reopenLostTransitionAr,
        fromStageKey: "terminal-lost",
        fromStageKeys: ["terminal-lost"],
        toStageKey: firstStage.stageKey,
        direction: "backward",
        domainEventKey: "DealReopenedEvent",
        triggers: [],
        properties: {},
        catalogRules: [],
        requiredFields: [],
        requireReason: true,
        requireNote: false,
        allowRollback: true,
      });
    }
  }
  return mapped;
}

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
      return {
        stageKey: s.stageKey,
        labelEn: s.labelEn,
        labelAr: s.labelAr,
        sortOrder: idx + 1,
        category,
        color,
        customColorHex,
        winProbabilityPercent: s.probability,
        slaDays: s.slaDays,
        properties: { ...(prev?.properties ?? {}), ...(s.properties ?? {}), color, ...(customColorHex ? { customColorHex } : {}) },
        requiredExitFields: s.requiredExitFields,
        requiresVerifiedParty: s.requiredExitFields.includes("partyId"),
        triggerDealConversion: Boolean(s.convertsToDeal),
        triggersDealConversion: Boolean(s.convertsToDeal),
        allowInboundFromAny: transitions.some(
          (tr) => (tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")) && tr.toStageKey === s.stageKey,
        ),
        position: { x: s.x, y: s.y },
      };
    }),
    transitions: transitions.map((tr) => {
      const fromOrder = orderMap.get(tr.fromStageKey) ?? 0;
      const toOrder = orderMap.get(tr.toStageKey) ?? 0;
      const resolvedDirection = tr.fromStageKey === "*" ? "global" : toOrder < fromOrder ? "backward" : tr.direction ?? "forward";
      const nextProps: Record<string, string> = { ...(tr.properties ?? {}) };
      if (tr.sourcePort) nextProps.sourcePort = tr.sourcePort;
      if (tr.targetPort) nextProps.targetPort = tr.targetPort;
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
          promptFields: tr.requireNote ? ["qualificationNotes"] : [],
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
