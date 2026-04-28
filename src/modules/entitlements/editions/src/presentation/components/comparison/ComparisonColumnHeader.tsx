/**
 * ComparisonColumnHeader — Edition column header with multi-badge recommendation system.
 *
 * Replaces the single isRecommended boolean with a string[] badges array.
 * Each badge gets its deterministic OKLCH color via RecommendationBadge.
 */
import { TableHead } from "@core/ui/table";
import { cn } from "@core/common/utils";
import { RecommendationBadge } from "./RecommendationBadge";

interface ComparisonColumnHeaderProps {
  displayName: string;
  tierLevel: number;
  /** Array of recommendation badge labels. Empty = no badges. */
  badges?: string[];
  isRecommended?: boolean;
  /** Legacy: shown as a single badge if no badges[] provided */
  recommendedLabel?: string;
}

export function ComparisonColumnHeader({
  displayName,
  tierLevel,
  badges = [],
  isRecommended = false,
  recommendedLabel,
}: ComparisonColumnHeaderProps) {
  const highlighted = isRecommended || badges.length > 0;

  // Derive badge list from either new badges[] or legacy isRecommended flag
  const badgeList =
    badges.length > 0
      ? badges
      : isRecommended && recommendedLabel
      ? [recommendedLabel]
      : [];

  return (
    <TableHead
      className={cn(
        "text-center min-w-[180px]",
        highlighted && "bg-primary/5 border-x-2 border-primary/20"
      )}
    >
      <div className="flex flex-col items-center gap-1.5 py-1">
        {/* Badges */}
        {badgeList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {badgeList.map((b) => (
              <RecommendationBadge key={b} label={b} size="sm" />
            ))}
          </div>
        )}
        <span className="font-semibold text-base">{displayName}</span>
        <span className="text-xs text-muted-foreground">Tier {tierLevel}</span>
      </div>
    </TableHead>
  );
}
