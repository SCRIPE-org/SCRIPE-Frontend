import type { DropEvaluationResult, StageCategory } from "./types";

/** Resolves the stage indicator dot Tailwind class based on explicit stage color or semantic category. */
export function resolveKanbanStageDotClass(
  swatchClass?: string,
  colorClass?: string,
  category?: StageCategory
): string {
  if (swatchClass) return swatchClass;
  if (colorClass) return colorClass;
  switch (category) {
    case "todo":
      return "bg-nx-ink-3";
    case "in_progress":
      return "bg-info";
    case "done":
      return "bg-success";
    case "lost":
      return "bg-nx-danger";
    default:
      return "bg-nx-accent";
  }
}

/** Resolves column border/ring/background styling according to drag evaluation state. */
export function resolveKanbanDropStateClasses(
  hasActiveItem: boolean,
  isActiveSourceStage: boolean,
  evalResult: DropEvaluationResult | null,
  isColumnHovered: boolean
): string {
  if (!hasActiveItem || isActiveSourceStage) {
    return "border-nx-line bg-nx-surface";
  }
  if (evalResult?.state === "blocked") {
    return isColumnHovered
      ? "border-nx-danger/80 ring-2 ring-nx-danger/40 bg-nx-danger/10"
      : "border-nx-line/50 opacity-60 bg-nx-surface";
  }
  if (evalResult?.state === "allowed_screen_required") {
    return isColumnHovered
      ? "border-warning ring-2 ring-warning/30 bg-warning/10"
      : "border-warning/40 bg-warning/5";
  }
  return isColumnHovered
    ? "border-nx-accent ring-2 ring-nx-accent/30 bg-nx-accent-wash/40"
    : "border-nx-line hover:border-nx-line-hi bg-nx-surface";
}

/** Resolves localized text for the active transition badge during drag. */
export function resolveDropEvaluationBadgeLabel(
  evalResult: DropEvaluationResult,
  t: (key: string, opts?: Record<string, any>) => string
): string {
  if (evalResult.state === "blocked") {
    return (
      evalResult.reason ||
      t("crud.kanban.transitionBlocked", { defaultValue: "Transition blocked" })
    );
  }
  if (evalResult.badgeText) return evalResult.badgeText;
  if (evalResult.actionLabel) return evalResult.actionLabel;
  if (evalResult.transitions && evalResult.transitions.length > 1) {
    return t("crud.kanban.pathsAvailable", {
      count: evalResult.transitions.length,
      defaultValue: `${evalResult.transitions.length} Paths Available`,
    });
  }
  return evalResult.state === "allowed_screen_required"
    ? t("crud.kanban.transitionScreen", { defaultValue: "Transition Screen" })
    : t("crud.kanban.instantMove", { defaultValue: "Instant Move" });
}
