/** Entity types supported by the CRM Workflow Engine. */
export type CrmWorkflowEntityType = "deal" | "lead";
/** Visual and lifecycle category of a workflow stage node. */
export type CrmWorkflowStageCategory = "todo" | "in_progress" | "done" | "lost";
/** Semantic color token configurable per stage across Deals & Leads workflows, minimap, and Kanban columns (19 curated tokens). */
export type CrmStageColorToken =
  | "slate"
  | "zinc"
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "emerald"
  | "green"
  | "lime"
  | "amber"
  | "orange"
  | "coral"
  | "rose"
  | "crimson"
  | "pink"
  | "fuchsia"
  | "purple"
  | "violet"
  | "indigo";

/** Ordered list of 19 semantic stage color tokens for the Status Inspector swatch picker. */
export const CRM_STAGE_COLOR_TOKENS: CrmStageColorToken[] = [
  "slate", "zinc", "blue", "sky", "cyan", "teal", "emerald", "green", "lime", "amber",
  "orange", "coral", "rose", "crimson", "pink", "fuchsia", "purple", "violet", "indigo",
];

/** Semantic styling classes for each of the 19 stage color tokens (Dark & Light safe). */
export const STAGE_COLOR_PALETTE: Record<
  CrmStageColorToken,
  {
    labelEn: string;
    labelAr: string;
    swatchClass: string;
    borderClass: string;
    badgeClass: string;
    headerBorderClass: string;
    dotClass: string;
    minimapClass: string;
    accentBarClass: string;
  }
> = {
  slate: {
    labelEn: "Slate",
    labelAr: "أردوازي",
    swatchClass: "bg-nx-ink-3",
    borderClass: "border-nx-line bg-nx-surface hover:border-nx-line-hi",
    badgeClass: "border-nx-line bg-nx-raised text-nx-ink-2",
    headerBorderClass: "border-t-2 border-t-nx-line-hi",
    dotClass: "bg-nx-ink-3",
    minimapClass: "border-nx-line-hi bg-nx-raised",
    accentBarClass: "bg-nx-ink-3",
  },
  zinc: {
    labelEn: "Zinc",
    labelAr: "زنك",
    swatchClass: "bg-zinc-500",
    borderClass: "border-zinc-500/45 bg-zinc-500/[0.04] hover:border-zinc-500/70",
    badgeClass: "border-zinc-500/40 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
    headerBorderClass: "border-t-2 border-t-zinc-400/80",
    dotClass: "bg-zinc-400",
    minimapClass: "border-zinc-400/60 bg-zinc-500/25",
    accentBarClass: "bg-zinc-400",
  },
  blue: {
    labelEn: "Blue",
    labelAr: "أزرق",
    swatchClass: "bg-blue-500",
    borderClass: "border-blue-500/45 bg-blue-500/[0.04] hover:border-blue-500/70",
    badgeClass: "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300",
    headerBorderClass: "border-t-2 border-t-blue-500/80",
    dotClass: "bg-blue-500",
    minimapClass: "border-blue-500/60 bg-blue-500/25",
    accentBarClass: "bg-blue-500",
  },
  sky: {
    labelEn: "Sky",
    labelAr: "سماوي",
    swatchClass: "bg-sky-500",
    borderClass: "border-sky-500/45 bg-sky-500/[0.04] hover:border-sky-500/70",
    badgeClass: "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300",
    headerBorderClass: "border-t-2 border-t-sky-500/80",
    dotClass: "bg-sky-500",
    minimapClass: "border-sky-500/60 bg-sky-500/25",
    accentBarClass: "bg-sky-500",
  },
  cyan: {
    labelEn: "Cyan",
    labelAr: "فيروزي",
    swatchClass: "bg-cyan-500",
    borderClass: "border-cyan-500/45 bg-cyan-500/[0.04] hover:border-cyan-500/70",
    badgeClass: "border-cyan-500/40 bg-cyan-500/15 text-cyan-800 dark:text-cyan-300",
    headerBorderClass: "border-t-2 border-t-cyan-500/80",
    dotClass: "bg-cyan-500",
    minimapClass: "border-cyan-500/60 bg-cyan-500/25",
    accentBarClass: "bg-cyan-500",
  },
  teal: {
    labelEn: "Teal",
    labelAr: "تركواز",
    swatchClass: "bg-teal-500",
    borderClass: "border-teal-500/45 bg-teal-500/[0.04] hover:border-teal-500/70",
    badgeClass: "border-teal-500/40 bg-teal-500/15 text-teal-800 dark:text-teal-300",
    headerBorderClass: "border-t-2 border-t-teal-500/80",
    dotClass: "bg-teal-500",
    minimapClass: "border-teal-500/60 bg-teal-500/25",
    accentBarClass: "bg-teal-500",
  },
  emerald: {
    labelEn: "Emerald",
    labelAr: "زمردي",
    swatchClass: "bg-success",
    borderClass: "border-success/50 bg-success/[0.05] hover:border-success/80",
    badgeClass: "border-success/40 bg-success/15 text-success",
    headerBorderClass: "border-t-2 border-t-success",
    dotClass: "bg-success",
    minimapClass: "border-success/60 bg-success/25",
    accentBarClass: "bg-success",
  },
  green: {
    labelEn: "Green",
    labelAr: "أخضر",
    swatchClass: "bg-green-500",
    borderClass: "border-green-500/45 bg-green-500/[0.04] hover:border-green-500/70",
    badgeClass: "border-green-500/40 bg-green-500/15 text-green-800 dark:text-green-300",
    headerBorderClass: "border-t-2 border-t-green-500/80",
    dotClass: "bg-green-500",
    minimapClass: "border-green-500/60 bg-green-500/25",
    accentBarClass: "bg-green-500",
  },
  lime: {
    labelEn: "Lime",
    labelAr: "ليموني",
    swatchClass: "bg-lime-500",
    borderClass: "border-lime-500/45 bg-lime-500/[0.04] hover:border-lime-500/70",
    badgeClass: "border-lime-500/40 bg-lime-500/15 text-lime-800 dark:text-lime-300",
    headerBorderClass: "border-t-2 border-t-lime-500/80",
    dotClass: "bg-lime-500",
    minimapClass: "border-lime-500/60 bg-lime-500/25",
    accentBarClass: "bg-lime-500",
  },
  amber: {
    labelEn: "Amber",
    labelAr: "كهرماني",
    swatchClass: "bg-warning",
    borderClass: "border-warning/50 bg-warning/[0.05] hover:border-warning/80",
    badgeClass: "border-warning-strong/40 bg-warning/15 text-nx-warning-strong",
    headerBorderClass: "border-t-2 border-t-warning",
    dotClass: "bg-warning",
    minimapClass: "border-warning/60 bg-warning/25",
    accentBarClass: "bg-warning",
  },
  orange: {
    labelEn: "Orange",
    labelAr: "برتقالي",
    swatchClass: "bg-orange-500",
    borderClass: "border-orange-500/45 bg-orange-500/[0.04] hover:border-orange-500/70",
    badgeClass: "border-orange-500/40 bg-orange-500/15 text-orange-800 dark:text-orange-300",
    headerBorderClass: "border-t-2 border-t-orange-500/80",
    dotClass: "bg-orange-500",
    minimapClass: "border-orange-500/60 bg-orange-500/25",
    accentBarClass: "bg-orange-500",
  },
  coral: {
    labelEn: "Coral",
    labelAr: "مرجاني",
    swatchClass: "bg-red-400",
    borderClass: "border-red-400/45 bg-red-400/[0.04] hover:border-red-400/70",
    badgeClass: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300",
    headerBorderClass: "border-t-2 border-t-red-400/80",
    dotClass: "bg-red-400",
    minimapClass: "border-red-400/60 bg-red-400/25",
    accentBarClass: "bg-red-400",
  },
  rose: {
    labelEn: "Rose",
    labelAr: "وردي",
    swatchClass: "bg-destructive",
    borderClass: "border-destructive/50 bg-destructive/[0.05] hover:border-destructive/80",
    badgeClass: "border-destructive/40 bg-destructive/15 text-destructive",
    headerBorderClass: "border-t-2 border-t-destructive",
    dotClass: "bg-destructive",
    minimapClass: "border-destructive/60 bg-destructive/25",
    accentBarClass: "bg-destructive",
  },
  crimson: {
    labelEn: "Crimson",
    labelAr: "قرمزي",
    swatchClass: "bg-red-600",
    borderClass: "border-red-600/45 bg-red-600/[0.04] hover:border-red-600/70",
    badgeClass: "border-red-600/40 bg-red-600/15 text-red-800 dark:text-red-300",
    headerBorderClass: "border-t-2 border-t-red-600/80",
    dotClass: "bg-red-600",
    minimapClass: "border-red-600/60 bg-red-600/25",
    accentBarClass: "bg-red-600",
  },
  pink: {
    labelEn: "Pink",
    labelAr: "زهري",
    swatchClass: "bg-pink-500",
    borderClass: "border-pink-500/45 bg-pink-500/[0.04] hover:border-pink-500/70",
    badgeClass: "border-pink-500/40 bg-pink-500/15 text-pink-700 dark:text-pink-300",
    headerBorderClass: "border-t-2 border-t-pink-500/80",
    dotClass: "bg-pink-500",
    minimapClass: "border-pink-500/60 bg-pink-500/25",
    accentBarClass: "bg-pink-500",
  },
  fuchsia: {
    labelEn: "Fuchsia",
    labelAr: "فوشيا",
    swatchClass: "bg-fuchsia-500",
    borderClass: "border-fuchsia-500/45 bg-fuchsia-500/[0.04] hover:border-fuchsia-500/70",
    badgeClass: "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    headerBorderClass: "border-t-2 border-t-fuchsia-500/80",
    dotClass: "bg-fuchsia-500",
    minimapClass: "border-fuchsia-500/60 bg-fuchsia-500/25",
    accentBarClass: "bg-fuchsia-500",
  },
  purple: {
    labelEn: "Purple",
    labelAr: "أرجواني",
    swatchClass: "bg-purple-500",
    borderClass: "border-purple-500/45 bg-purple-500/[0.04] hover:border-purple-500/70",
    badgeClass: "border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300",
    headerBorderClass: "border-t-2 border-t-purple-500/80",
    dotClass: "bg-purple-500",
    minimapClass: "border-purple-500/60 bg-purple-500/25",
    accentBarClass: "bg-purple-500",
  },
  violet: {
    labelEn: "Violet",
    labelAr: "بنفسجي",
    swatchClass: "bg-violet-500",
    borderClass: "border-violet-500/45 bg-violet-500/[0.04] hover:border-violet-500/70",
    badgeClass: "border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300",
    headerBorderClass: "border-t-2 border-t-violet-500/80",
    dotClass: "bg-violet-500",
    minimapClass: "border-violet-500/60 bg-violet-500/25",
    accentBarClass: "bg-violet-500",
  },
  indigo: {
    labelEn: "Indigo",
    labelAr: "نيلي",
    swatchClass: "bg-indigo-500",
    borderClass: "border-indigo-500/45 bg-indigo-500/[0.04] hover:border-indigo-500/70",
    badgeClass: "border-indigo-500/40 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    headerBorderClass: "border-t-2 border-t-indigo-500/80",
    dotClass: "bg-indigo-500",
    minimapClass: "border-indigo-500/60 bg-indigo-500/25",
    accentBarClass: "bg-indigo-500",
  },
};

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
