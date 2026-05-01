/**
 * PriceCell — Formatted price display for edition comparison.
 *
 * Shows the monthly USD price with currency formatting, or "Free" for zero/null.
 */
import { TableCell } from "@core/ui/table";
import { cn } from "@core/common/utils";

interface PriceCellProps {
  price: number | undefined;
  freeLabel: string;
  isRecommended: boolean;
}

export function PriceCell({ price, freeLabel, isRecommended }: PriceCellProps) {
  const formatted =
    price == null || price === 0
      ? freeLabel
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(price);

  return (
    <TableCell
      className={cn(
        "px-4 py-2.5 text-center",
        isRecommended && "border-x-2 border-primary/20 bg-primary/5"
      )}
    >
      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatted}</span>
      {price ? <span className="block text-xs text-muted-foreground">/mo</span> : null}
    </TableCell>
  );
}
