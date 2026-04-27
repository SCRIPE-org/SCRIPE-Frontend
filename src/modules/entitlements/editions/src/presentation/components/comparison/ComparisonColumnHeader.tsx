/**
 * ComparisonColumnHeader — Edition column header with optional "Recommended" badge.
 *
 * Renders the edition name, tier level, and highlights the recommended column.
 */
import { Badge } from "@core/ui/badge";
import { TableHead } from "@core/ui/table";
import { Crown } from "lucide-react";
import { cn } from "@core/common/utils";

interface ComparisonColumnHeaderProps {
  displayName: string;
  tierLevel: number;
  isRecommended: boolean;
  recommendedLabel: string;
}

export function ComparisonColumnHeader({
  displayName,
  tierLevel,
  isRecommended,
  recommendedLabel,
}: ComparisonColumnHeaderProps) {
  return (
    <TableHead
      className={cn(
        "text-center min-w-[160px]",
        isRecommended && "bg-primary/5 border-x-2 border-primary/20"
      )}
    >
      <div className="flex flex-col items-center gap-1">
        {isRecommended && (
          <Badge
            variant="default"
            className="text-[10px] px-2 py-0 mb-1 gap-1"
          >
            <Crown className="h-3 w-3" />
            {recommendedLabel}
          </Badge>
        )}
        <span className="font-semibold text-base">{displayName}</span>
        <span className="text-xs text-muted-foreground">
          Tier {tierLevel}
        </span>
      </div>
    </TableHead>
  );
}
