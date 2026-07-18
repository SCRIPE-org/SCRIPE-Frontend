"use client";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { TableHead } from "@core/ui/table";
import { RecommendationBadge } from "./RecommendationBadge";

interface ComparisonColumnHeaderProps {
  displayName: string;
  tierLevel: number;
  badges?: string[];
  isRecommended?: boolean;
  recommendedLabel?: string;
}

export function ComparisonColumnHeader({
  displayName,
  tierLevel,
  badges = [],
  isRecommended = false,
  recommendedLabel,
}: ComparisonColumnHeaderProps) {
  const { t } = useI18n();
  const highlighted = isRecommended || badges.length > 0;
  const badgeList =
    badges.length > 0 ? badges : isRecommended && recommendedLabel ? [recommendedLabel] : [];

  return (
    <TableHead
      scope="col"
      className={cn(
        "min-w-[180px] text-center",
        highlighted && "border-x-2 border-primary/20 bg-primary/5"
      )}
    >
      <div className="flex flex-col items-center gap-1.5 py-1">
        {badgeList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {badgeList.map((badge) => (
              <RecommendationBadge key={badge} label={badge} size="sm" />
            ))}
          </div>
        )}
        <span className="text-base font-semibold">{displayName}</span>
        <span className="text-xs text-muted-foreground">
          {t("entitlements.editions.comparison.tier") || "Tier"} {tierLevel}
        </span>
      </div>
    </TableHead>
  );
}
