/**
 * FieldGroupRow -- one reorderable row of the Field Groups screen (Wave 5 row 5.2)
 *
 * ACCESSIBILITY: this row deliberately copies `MenuTreeItem`'s reorder shape --
 * native HTML5 drag PAIRED WITH real Move up / Move down buttons, each with its
 * own `aria-label`. That pairing is the requirement, not a nicety: WCAG 2.2
 * SC 2.5.7 (Dragging Movements) says any function operated by dragging must
 * also be achievable with a single pointer activation, and a keyboard user has
 * no drag gesture at all.
 *
 * The `@dnd-kit` reorder implementations elsewhere in this codebase
 * (`useBuilderDnd.ts`, `DashboardBuilderPanel.tsx`) register a PointerSensor
 * only, with no KeyboardSensor and no click alternative. They are NOT the
 * pattern to copy here.
 *
 * A row the caller may not mutate (a platform-owned group seen from tenant
 * context) renders no action controls at all rather than disabled ones the
 * backend would reject -- the same choice CustomFieldListView makes for Edit
 * and Delete on a global definition.
 */
"use client";

import { useCallback } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { ArrowDown, ArrowUp, GripVertical, Globe2, Pencil, Trash2 } from "lucide-react";
import type { FieldGroup } from "../../domain/entities/FieldGroup";

export interface FieldGroupRowProps {
  group: FieldGroup;
  language: string;
  /** Localized label text, resolved by the caller so this row stays i18n-free. */
  labels: {
    moveUp: string;
    moveDown: string;
    edit: string;
    delete: string;
    global: string;
    sortOrder: string;
  };
  /** False for a row this principal cannot update/delete/reorder. */
  canMutate: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** True while a reorder request is in flight — blocks a second queued move. */
  isReordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragEnterRow: () => void;
  onDropOnRow: () => void;
}

export function FieldGroupRow({
  group,
  language,
  labels,
  canMutate,
  canMoveUp,
  canMoveDown,
  isReordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragEnterRow,
  onDropOnRow,
}: FieldGroupRowProps) {
  const handleDragOver = useCallback((event: React.DragEvent) => {
    // Without preventDefault the element is not a valid drop target at all and
    // onDrop never fires — same reason MenuTreeItem does it.
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onDropOnRow();
    },
    [onDropOnRow]
  );

  const displayLabel = group.displayLabel(language);

  return (
    <li
      // Drag is offered only where a move is actually permitted; the buttons
      // below carry the same condition, so the two never disagree.
      draggable={canMutate}
      onDragStart={canMutate ? onDragStart : undefined}
      onDragEnd={canMutate ? onDragEnd : undefined}
      onDragEnter={canMutate ? onDragEnterRow : undefined}
      onDragOver={canMutate ? handleDragOver : undefined}
      onDrop={canMutate ? handleDrop : undefined}
      className={cn(
        "group relative flex items-center gap-2 border-b border-nx-line px-3 py-2.5 last:border-b-0",
        "transition-[background-color] duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
        isDragging && "opacity-30",
        isDropTarget &&
          !isDragging &&
          "before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-[3px] before:rounded-full before:bg-info"
      )}
    >
      {canMutate && (
        <GripVertical
          aria-hidden="true"
          className="h-4 w-4 shrink-0 cursor-grab text-nx-ink-3 active:cursor-grabbing"
        />
      )}

      <span className="truncate text-sm font-medium text-nx-ink">{displayLabel}</span>

      {group.isGlobal && (
        <Badge variant="outline" className="shrink-0 gap-1">
          <Globe2 className="h-3 w-3" aria-hidden="true" />
          {labels.global}
        </Badge>
      )}

      <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] tabular-nums">
        {labels.sortOrder}: {group.sortOrder}
      </Badge>

      {canMutate && (
        <div className="ms-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={!canMoveUp || isReordering}
            aria-label={labels.moveUp}
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={!canMoveDown || isReordering}
            aria-label={labels.moveDown}
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
            aria-label={labels.edit}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive/80"
            onClick={onDelete}
            aria-label={labels.delete}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}
    </li>
  );
}
