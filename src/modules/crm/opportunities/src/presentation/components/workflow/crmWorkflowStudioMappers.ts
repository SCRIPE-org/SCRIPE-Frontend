import { resolveDefaultStageColor, type CrmWorkflowDefinition } from "@modules/crm";
import { CANONICAL_TERMINAL_LABELS } from "../../../domain/constants/crmCanonicalStages";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import type { StagePortId } from "./CrmWorkflowCanvasSubViews";

/** Computes a generous 2-row 2D topological position (Row 1 y=110, Row 2 y=410, dx=460) so top & mid corridors fit multiple parallel lanes with zero collisions. */
export function computeBalanced2DStagePosition(idx: number): { x: number; y: number } {
  const row = Math.floor(idx / 3), col = idx % 3;
  return { x: 240 + col * 460 + (row % 2 === 1 ? 80 : 0), y: 110 + row * 300 };
}

/** Builds 2D Studio stage nodes from a persisted CrmWorkflowDefinition. */
export function buildStageNodesFromWorkflow(wf: CrmWorkflowDefinition): CrmWorkflowStageNode[] {
  const sorted = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
  let nonTermIdx = 0;
  const nodes: CrmWorkflowStageNode[] = sorted.map((st, idx) => {
    const isLegacyWon = st.stageKey === "terminal-won" || st.stageKey === "default.closed_won";
    const isLegacyLost = st.stageKey === "terminal-lost" || st.stageKey === "default.closed_lost";
    const isDealWon = wf.entityType === "deal" && (isLegacyWon || st.category === "done");
    const isDealLost = wf.entityType === "deal" && (isLegacyLost || st.category === "lost");
    
    // Normalize to canonical keys
    const canonicalKey = isDealWon ? "default.closed_won" : isDealLost ? "default.closed_lost" : st.stageKey;

    const defPos = isDealWon ? { x: 1620, y: 110 } : isDealLost ? { x: 1620, y: 410 } : computeBalanced2DStagePosition(nonTermIdx++);
    const hasCustomPos = Boolean(
      st.position && typeof st.position.x === "number" && typeof st.position.y === "number" &&
      ![64, 72, 96, 260, 272, 340].includes(st.position.y),
    );
    const category = st.category ?? (idx === 0 ? "todo" : "in_progress");
    const color = resolveDefaultStageColor(canonicalKey, category, st.sortOrder || idx + 1, st.color || st.properties?.color);
    const hasGlobalInbound = wf.transitions.some(
      (tr) =>
        (tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")) &&
        (tr.toStageKey === st.stageKey || (isDealWon && tr.toStageKey === "terminal-won") || (isDealLost && tr.toStageKey === "terminal-lost")),
    );
    return {
      stageKey: canonicalKey,
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
    if (!nodes.some((n) => n.stageKey === "default.closed_won" || n.isTerminalWon)) {
      nodes.push({
        stageKey: "default.closed_won", labelEn: CANONICAL_TERMINAL_LABELS.wonStageEn, labelAr: CANONICAL_TERMINAL_LABELS.wonStageAr,
        probability: 100, slaDays: 0, order: sorted.length + 1, category: "done", color: "emerald",
        allowInboundFromAny: false, isTerminalWon: true, isTerminalLost: false, requiredExitFields: [], x: 1620, y: 110,
      });
    }
    if (!nodes.some((n) => n.stageKey === "default.closed_lost" || n.isTerminalLost)) {
      nodes.push({
        stageKey: "default.closed_lost", labelEn: CANONICAL_TERMINAL_LABELS.lostStageEn, labelAr: CANONICAL_TERMINAL_LABELS.lostStageAr,
        probability: 0, slaDays: 0, order: sorted.length + 2, category: "lost", color: "rose",
        allowInboundFromAny: true, isTerminalWon: false, isTerminalLost: true, requiredExitFields: [], x: 1620, y: 410,
      });
    }
  }

  // Auto-upgrade cramped legacy positions to spacious balanced positions
  const hasCrampedPairs = nodes.some((a, i) =>
    nodes.slice(i + 1).some((b) => Math.abs(a.x - b.x) < 330 && Math.abs(a.y - b.y) < 180),
  );
  if (hasCrampedPairs) {
    let autoIdx = 0;
    nodes.forEach((n) => {
      if (n.isTerminalWon) {
        n.x = 1620; n.y = 110;
      } else if (n.isTerminalLost) {
        n.x = 1620; n.y = 410;
      } else {
        const p = computeBalanced2DStagePosition(autoIdx++);
        n.x = p.x; n.y = p.y;
      }
    });
  }

  return nodes;
}

/** Builds 2D Studio transitions from a persisted CrmWorkflowDefinition, connecting Closed Won and Closed Lost as first-class stages. */
export function buildTransitionsFromWorkflow(wf: CrmWorkflowDefinition): CrmWorkflowTransition[] {
  const normalizeKey = (key: string) => {
    if (key === "terminal-won") return "default.closed_won";
    if (key === "terminal-lost") return "default.closed_lost";
    return key;
  };

  const mapped: CrmWorkflowTransition[] = wf.transitions.map((tr) => {
    const fromStageKey = normalizeKey(tr.fromStageKey);
    const fromStageKeys = tr.fromStageKeys ? tr.fromStageKeys.map(normalizeKey) : [fromStageKey];
    const toStageKey = normalizeKey(tr.toStageKey);

    return {
      id: tr.id,
      nameEn: tr.nameEn,
      nameAr: tr.nameAr,
      fromStageKey,
      fromStageKeys,
      toStageKey,
      direction: tr.direction,
      sourcePort: ((tr as any).sourcePort ?? tr.properties?.sourcePort) as StagePortId | undefined,
      targetPort: ((tr as any).targetPort ?? tr.properties?.targetPort) as StagePortId | undefined,
      domainEventKey: tr.domainEventKey ?? "GenericEvent",
      triggers: tr.triggers ? [...tr.triggers] : [],
      properties: tr.properties ? { ...tr.properties } : {},
      catalogRules: tr.catalogRules ? tr.catalogRules.map((r) => ({ ...r })) : [],
      requiredFields: [...(tr.rules?.requiredFieldKeys ?? [])],
      promptFields: [...(tr.rules?.promptFields ?? [])],
      requireReason: Boolean(tr.rules?.promptForComment),
      requireNote: (tr.rules?.promptFields ?? []).some((f) => f === "qualificationNotes" || f === "closeNotes"),
      allowRollback: tr.rules?.allowRollback ?? true,
      blockIfLinkedDealProgressed: Boolean(tr.rules?.blockIfLinkedDealProgressed),
      requireVerifiedParty: Boolean(tr.rules?.requireVerifiedParty),
      requireEstimatedAmountPositive: Boolean(tr.rules?.requireEstimatedAmountPositive),
      triggerDealConversion: Boolean(tr.rules?.triggerDealConversion),
      autoCreateWorkTask: Boolean(tr.rules?.autoCreateWorkTask),
      restrictToRoles: tr.rules?.requiredPermission ? [tr.rules.requiredPermission] : [],
      triggerWebhook: tr.rules?.autoCreateWorkTask ? "crm.transition.work_item" : "",
    };
  });

  if (wf.entityType === "deal" && wf.properties?.customTerminalStages !== "true") {
    const sorted = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);
    const firstStage = sorted[0];
    const lastActive = [...sorted].reverse().find((s) => s.category !== "done" && s.category !== "lost") ?? sorted[sorted.length - 1];
    const activeKey = lastActive ? normalizeKey(lastActive.stageKey) : "default.negotiation";
    const firstKey = firstStage ? normalizeKey(firstStage.stageKey) : "default.discovery";

    if (!mapped.some((t) => t.toStageKey === "default.closed_won")) {
      mapped.push({
        id: "tr-deal-close-won",
        nameEn: CANONICAL_TERMINAL_LABELS.closeWonTransitionEn,
        nameAr: CANONICAL_TERMINAL_LABELS.closeWonTransitionAr,
        fromStageKey: activeKey,
        fromStageKeys: [activeKey],
        toStageKey: "default.closed_won",
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
    if (!mapped.some((t) => t.toStageKey === "default.closed_lost")) {
      mapped.push({
        id: "tr-deal-mark-lost",
        nameEn: CANONICAL_TERMINAL_LABELS.markLostTransitionEn,
        nameAr: CANONICAL_TERMINAL_LABELS.markLostTransitionAr,
        fromStageKey: "*",
        fromStageKeys: ["*"],
        toStageKey: "default.closed_lost",
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
    if (firstKey && !mapped.some((t) => t.fromStageKey === "default.closed_lost")) {
      mapped.push({
        id: "tr-deal-reopen-lost",
        nameEn: CANONICAL_TERMINAL_LABELS.reopenLostTransitionEn,
        nameAr: CANONICAL_TERMINAL_LABELS.reopenLostTransitionAr,
        fromStageKey: "default.closed_lost",
        fromStageKeys: ["default.closed_lost"],
        toStageKey: firstKey,
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
