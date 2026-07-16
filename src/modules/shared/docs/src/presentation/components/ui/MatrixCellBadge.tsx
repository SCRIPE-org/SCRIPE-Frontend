"use client";

import type { MatrixCell } from "../../../domain/entities/DocSection";

interface MatrixCellBadgeProps {
  cell: MatrixCell;
}

const statusLabels = {
  supported: "✅",
  partial: "⚠️",
  unsupported: "❌",
};

export function MatrixCellBadge({ cell }: MatrixCellBadgeProps) {
  return (
    <span className={`docs-matrix-badge badge-${cell.status}`} title={cell.value}>
      {statusLabels[cell.status]} {cell.value}
    </span>
  );
}
