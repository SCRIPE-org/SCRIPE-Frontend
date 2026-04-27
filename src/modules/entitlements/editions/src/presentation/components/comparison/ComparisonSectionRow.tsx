/**
 * ComparisonSectionRow — Section divider row in the comparison table.
 *
 * Renders a full-width header that separates groups (Billing Controls, Trial, Features).
 */
import { TableRow, TableCell } from "@core/ui/table";

interface ComparisonSectionRowProps {
  label: string;
  colSpan: number;
}

export function ComparisonSectionRow({ label, colSpan }: ComparisonSectionRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40"
      >
        {label}
      </TableCell>
    </TableRow>
  );
}
