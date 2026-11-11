import type { ReactNode } from "react";

export type DropState = "allowed_instant" | "allowed_screen_required" | "blocked";

export interface DropEvaluationResult {
  state: DropState;
  badgeText?: string;
  reason?: string;
  /** Action label describing transition (e.g. "Fast-Track Approval", "Standard Review") */
  actionLabel?: string;
  /** Selected or default transition identifier */
  transitionId?: string;
  /** List of eligible parallel transitions when multiple paths exist between stages */
  transitions?: Array<{
    id: string;
    name?: string;
    label?: string;
    actionLabel?: string;
    rules?: any;
    screenRequired?: boolean;
    [key: string]: any;
  }>;
  /** Additional transition evaluation metadata */
  metadata?: Record<string, any>;
}

export type StageCategory = "todo" | "in_progress" | "done" | "lost";
export type CardDensity = "compact" | "standard" | "comfortable";
export type SwimlaneMode = "none" | "assignee" | "account" | "custom";

export interface WorkflowKanbanStageConfig<TItem = any> {
  /** Unique key identifying this stage (matches item[stageField]) */
  stageKey: string;
  /** Display label for the stage */
  label: string;
  /** Semantic category for color accents and default transitions */
  category?: StageCategory;
  /** Optional badge/accent color class */
  colorClass?: string;
  /** Optional swatch background indicator class */
  swatchClass?: string;
  /** Custom hex color code for custom stage tinting */
  customColorHex?: string;
  /** Optional WIP (Work in Progress) limit for cards in this column */
  wipLimit?: number;
  /** Column aggregate or header summary generator */
  headerSummary?: (items: TItem[]) => ReactNode;
  /** Column icon */
  icon?: ReactNode;
  /** Whether the column starts collapsed */
  isCollapsed?: boolean;
  /** Custom column container classes */
  columnClass?: string;
  /** Custom column header classes */
  headerClass?: string;
}

export interface WorkflowKanbanSwimlane<TItem = any> {
  id: string;
  label: string;
  count?: number;
  filter?: (item: TItem) => boolean;
}

export interface WorkflowKanbanConfig<TItem = any> {
  /** Dynamic 2..N stages in display order */
  stages: WorkflowKanbanStageConfig<TItem>[];
  /** Field name or accessor function to determine which stage an item belongs to (defaults to 'stageKey') */
  stageField?: string | ((item: TItem) => string);
  /** Visual card density: compact, standard, or comfortable (defaults to 'standard') */
  cardDensity?: CardDensity;
  /** Swimlane grouping mode */
  swimlaneMode?: SwimlaneMode;
  /** Swimlane grouping field or accessor function */
  swimlaneField?: string | ((item: TItem) => string);
  /** Custom explicit swimlane definitions */
  swimlanes?: WorkflowKanbanSwimlane<TItem>[];
  /**
   * Smart 3-State Jira Drop Evaluation callback:
   * - "allowed_instant": direct valid transition, drops immediately.
   * - "allowed_screen_required": requires transition fields/dialog, DOES NOT ABORT DROP — calls onMoveItem with evalResult.
   * - "blocked": transition forbidden/locked, drop is safely rejected.
   */
  evaluateDropTarget?: (item: TItem, targetStageKey: string) => DropEvaluationResult;
  /**
   * Callback fired when an item is moved to another stage.
   * For "allowed_screen_required", caller receives evalResult and opens the dynamic Transition Dialog.
   */
  onMoveItem?: (
    item: TItem,
    targetStageKey: string,
    evalResult?: DropEvaluationResult
  ) => void | Promise<void>;
  /** Custom render function for card content */
  renderCard?: (item: TItem, actions: ReactNode, index: number) => ReactNode;
  /** Custom header summary or extra content in column header */
  renderStageHeaderExtra?: (
    stage: WorkflowKanbanStageConfig<TItem>,
    items: TItem[]
  ) => ReactNode;
  /** Card threshold to activate column auto-virtualization (defaults to 25) */
  virtualizationThreshold?: number;
  /** Error message banner / notification */
  errorMessage?: string | null;
  /** Callback to dismiss error message banner */
  onDismissError?: () => void;
  /** Whether drag-and-drop interactions are disabled */
  isReadOnly?: boolean;
  /** Item display name extractor for drag overlay and accessibility */
  getItemDisplayName?: (item: TItem) => string;
}
