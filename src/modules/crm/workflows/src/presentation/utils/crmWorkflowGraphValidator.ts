"use client";

import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "../components/studio/CrmWorkflowCanvas2D";

/** Toggles wildcard `allowInboundFromAny` status and global transition on a Studio draft. */
export function applyToggleAllowAnyDraft(
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
  stageKey: string,
  allowed: boolean
): { nextStages: CrmWorkflowStageNode[]; nextTransitions: CrmWorkflowTransition[] } {
  const nextStages = stages.map((s) => (s.stageKey === stageKey ? { ...s, allowInboundFromAny: allowed } : s));
  const existing = transitions.find((tr) => (tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")) && tr.toStageKey === stageKey);
  let nextTransitions = transitions;
  if (allowed && !existing) {
    const st = stages.find((s) => s.stageKey === stageKey);
    nextTransitions = [...transitions, { id: `tr-any-${stageKey}-${Date.now()}`, nameEn: st?.labelEn ?? stageKey, nameAr: st?.labelAr ?? stageKey, fromStageKey: "*", fromStageKeys: ["*"], toStageKey: stageKey, direction: "global", requiredFields: [] }];
  } else if (!allowed && existing) {
    nextTransitions = transitions.filter((tr) => tr.id !== existing.id);
  }
  return { nextStages, nextTransitions };
}

/** Replaces a removed stage across transitions and returns the migrated Studio draft. */
export function applyReplaceStageDraft(
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[],
  stageKeyToRemove: string,
  replacementStageKey: string
): { nextStages: CrmWorkflowStageNode[]; nextTransitions: CrmWorkflowTransition[] } {
  const nextStages = stages.filter((s) => s.stageKey !== stageKeyToRemove);
  const nextTransitions = transitions
    .map((tr) => ({
      ...tr,
      fromStageKey: tr.fromStageKey === stageKeyToRemove ? replacementStageKey : tr.fromStageKey,
      toStageKey: tr.toStageKey === stageKeyToRemove ? replacementStageKey : tr.toStageKey,
      fromStageKeys: tr.fromStageKeys ? Array.from(new Set(tr.fromStageKeys.map((k) => (k === stageKeyToRemove ? replacementStageKey : k)))) : undefined,
    }))
    .filter((tr) => tr.fromStageKey !== tr.toStageKey);
  return { nextStages, nextTransitions };
}

/** Result summary returned by `validateWorkflowGraph`. */
export interface WorkflowGraphValidationResult {
  valid: boolean;
  activeCount: number;
  transitionCount: number;
  unreachableStages: string[];
  deadlockedStages: string[];
  unexpectedCycleCount: number;
}

/**
 * Runs deterministic BFS reachability, outgoing deadlock analysis, and forward-edge
 * cycle detection on a 2D CRM workflow draft.
 */
export function validateWorkflowGraph(
  stages: CrmWorkflowStageNode[],
  transitions: CrmWorkflowTransition[]
): WorkflowGraphValidationResult {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const activeStages = sorted.filter((s) => !s.isTerminalWon && !s.isTerminalLost);
  const stageKeys = new Set(sorted.map((s) => s.stageKey));
  const adjacency = new Map<string, string[]>();
  const forwardAdjacency = new Map<string, string[]>();
  for (const key of stageKeys) {
    adjacency.set(key, []);
    forwardAdjacency.set(key, []);
  }

  const globalTargets: string[] = [];
  for (const s of sorted) {
    if (s.allowInboundFromAny) globalTargets.push(s.stageKey);
  }
  for (const tr of transitions) {
    const sources =
      tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")
        ? ["*"]
        : tr.fromStageKeys && tr.fromStageKeys.length > 0
          ? tr.fromStageKeys
          : [tr.fromStageKey];
    for (const src of sources) {
      if (src === "*") {
        globalTargets.push(tr.toStageKey);
        continue;
      }
      if (!stageKeys.has(src) || !stageKeys.has(tr.toStageKey)) continue;
      adjacency.get(src)?.push(tr.toStageKey);
      if (tr.direction !== "backward") {
        forwardAdjacency.get(src)?.push(tr.toStageKey);
      }
    }
  }

  // BFS reachability from initial stage + global (*) targets
  const visited = new Set<string>();
  const queue: string[] = [];
  if (sorted.length > 0) {
    visited.add(sorted[0].stageKey);
    queue.push(sorted[0].stageKey);
  }
  for (const gt of globalTargets) {
    if (stageKeys.has(gt) && !visited.has(gt)) {
      visited.add(gt);
      queue.push(gt);
    }
  }
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const next of adjacency.get(cur) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  const unreachableStages = activeStages
    .filter((s) => !visited.has(s.stageKey))
    .map((s) => s.labelEn || s.stageKey);

  // Deadlocked active stages have zero outgoing paths
  const deadlockedStages = activeStages
    .filter((s) => (adjacency.get(s.stageKey)?.length ?? 0) === 0 && globalTargets.length === 0)
    .map((s) => s.labelEn || s.stageKey);

  // DFS forward-only cycle check (intentional backward rollbacks are allowed)
  const color = new Map<string, 0 | 1 | 2>();
  let unexpectedCycleCount = 0;
  const visitDfs = (node: string) => {
    color.set(node, 1);
    for (const nxt of forwardAdjacency.get(node) ?? []) {
      const state = color.get(nxt) ?? 0;
      if (state === 1) unexpectedCycleCount += 1;
      else if (state === 0) visitDfs(nxt);
    }
    color.set(node, 2);
  };
  for (const s of sorted) {
    if ((color.get(s.stageKey) ?? 0) === 0) visitDfs(s.stageKey);
  }

  return {
    valid: unreachableStages.length === 0 && deadlockedStages.length === 0 && unexpectedCycleCount === 0,
    activeCount: activeStages.length,
    transitionCount: transitions.length,
    unreachableStages,
    deadlockedStages,
    unexpectedCycleCount,
  };
}
