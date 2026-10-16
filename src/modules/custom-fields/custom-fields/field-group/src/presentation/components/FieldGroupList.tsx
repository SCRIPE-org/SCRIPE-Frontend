"use client";

import * as React from "react";
import type { FieldGroup } from "../../domain/entities/FieldGroup";
import { FieldGroupRow } from "./FieldGroupRow";

/**
 * Documentation for module export
 */
export interface FieldGroupListProps {
  groups: readonly FieldGroup[];
  language: string;
  labels: {
    moveUp: string;
    moveDown: string;
    edit: string;
    delete: string;
    global: string;
    sortOrder: string;
  };
  canMutate: (group: FieldGroup) => boolean;
  canMoveUp: (id: string) => boolean;
  canMoveDown: (id: string) => boolean;
  isReordering: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (group: FieldGroup) => void;
  draggedId: string | null;
  dropTargetId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragEnterRow: (id: string) => void;
  onDropOnRow: (id: string) => void;
}

/**
 * Renders the ordered list of field group rows with drag-and-drop and accessibility controls.
 */
export function FieldGroupList({
  groups,
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
  draggedId,
  dropTargetId,
  onDragStart,
  onDragEnd,
  onDragEnterRow,
  onDropOnRow,
}: FieldGroupListProps): React.ReactElement {
  return (
    <ul className="overflow-hidden rounded-nx-md border border-nx-line">
      {groups.map((group) => (
        <FieldGroupRow
          key={group.id}
          group={group}
          language={language}
          labels={labels}
          canMutate={canMutate(group)}
          canMoveUp={canMoveUp(group.id)}
          canMoveDown={canMoveDown(group.id)}
          isReordering={isReordering}
          onMoveUp={() => onMoveUp(group.id)}
          onMoveDown={() => onMoveDown(group.id)}
          onEdit={() => onEdit(group.id)}
          onDelete={() => onDelete(group)}
          isDragging={draggedId === group.id}
          isDropTarget={dropTargetId === group.id}
          onDragStart={() => onDragStart(group.id)}
          onDragEnd={onDragEnd}
          onDragEnterRow={() => onDragEnterRow(group.id)}
          onDropOnRow={() => onDropOnRow(group.id)}
        />
      ))}
    </ul>
  );
}
