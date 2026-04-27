/**
 * ComparisonDataRow — Generic row in the comparison table.
 *
 * Renders a label cell + one value cell per edition, with recommended highlighting.
 * Used for billing controls, trial settings, and feature rows.
 */
import type { ReactNode } from "react";
import { TableRow, TableCell } from "@core/ui/table";
import { cn } from "@core/common/utils";
import type { Edition } from "../../../domain/entities/Edition";

interface ComparisonDataRowProps {
  label: string;
  editions: Edition[];
  recommendedIdx: number;
  renderCell: (edition: Edition) => ReactNode;
}

export function ComparisonDataRow({
  label,
  editions,
  recommendedIdx,
  renderCell,
}: ComparisonDataRowProps) {
  return (
    <TableRow className="border-b hover:bg-muted/10 transition-colors">
      <TableCell className="text-muted-foreground">{label}</TableCell>
      {editions.map((ed, idx) => (
        <TableCell
          key={ed.id}
          className={cn(
            "py-2.5 px-4 text-center",
            idx === recommendedIdx && "bg-primary/5 border-x-2 border-primary/20"
          )}
        >
          <div className="flex justify-center">{renderCell(ed)}</div>
        </TableCell>
      ))}
    </TableRow>
  );
}
