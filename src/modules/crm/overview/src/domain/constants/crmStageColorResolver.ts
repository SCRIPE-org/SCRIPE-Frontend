import type { CrmStageColorToken } from "./crmWorkflowColorPalette";

export const CRM_STAGE_COLOR_TOKENS: CrmStageColorToken[] = [
  "slate", "zinc", "blue", "sky", "cyan", "teal", "emerald", "green", "lime", "amber",
  "orange", "coral", "rose", "crimson", "pink", "fuchsia", "purple", "violet", "indigo",
];

/** Resolves a deterministic semantic color token for a stage key or category. */
export function resolveDefaultStageColor(
  stageKey?: string | null,
  category?: string | null,
  sortOrder?: number | null,
  explicitColor?: string | null
): CrmStageColorToken {
  if (explicitColor && (CRM_STAGE_COLOR_TOKENS as string[]).includes(explicitColor)) {
    return explicitColor as CrmStageColorToken;
  }
  const norm = (stageKey || "").toLowerCase();
  if (norm.includes("won") || norm.includes("converted") || norm.includes("deal")) return "emerald";
  if (norm.includes("lost") || norm.includes("disqualified")) return "rose";
  if (norm.includes("discovery") || norm.includes("new")) return "blue";
  if (norm.includes("qualification") || norm.includes("working")) return "cyan";
  if (norm.includes("solution_fit") || norm.includes("qualified")) return "indigo";
  if (norm.includes("proposal")) return "violet";
  if (norm.includes("negotiation")) return "amber";
  if (category === "done") return "emerald";
  if (category === "lost") return "rose";
  if (category === "todo") return "blue";
  const cycle: CrmStageColorToken[] = ["blue", "cyan", "indigo", "violet", "amber", "teal", "purple"];
  const idx = Math.max(0, (sortOrder ?? 1) - 1) % cycle.length;
  return cycle[idx];
}
