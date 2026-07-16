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

/**
 * Presentation UI component rendering the comparison section row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ComparisonSectionRow({ label, colSpan }: ComparisonSectionRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </TableCell>
    </TableRow>
  );
}
