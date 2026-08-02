"use client";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { TableHead } from "@core/ui/table";
import { RecommendationBadge } from "./RecommendationBadge";

/**
 * The vertical band that marks the recommended column, header and cells alike.
 *
 * It is the workspace accent wash behind a same-hue hairline on both inline
 * edges — `border-x` rather than a start/end pair, so the band reads the same
 * in Arabic. `--nx-accent` is a complete colour, so the hairline tint is a
 * color-mix; Tailwind silently drops slash-alpha on a var-valued colour.
 * Exported because the body cells must draw the identical band, otherwise the
 * column visibly steps in and out of highlight as the eye travels down it.
 */
export const comparisonHighlightClasses =
  "border-x-2 border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash";

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
      className={cn("min-w-[180px] text-center", highlighted && comparisonHighlightClasses)}
    >
      <div className="flex flex-col items-center gap-1.5 py-1">
        {badgeList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {badgeList.map((badge) => (
              <RecommendationBadge key={badge} label={badge} size="sm" />
            ))}
          </div>
        )}
        <span className="text-base font-semibold text-nx-ink">{displayName}</span>
        <span className="text-xs tabular-nums text-nx-ink-3">
          {t("entitlements.editions.comparison.tierLevel", { level: tierLevel })}
        </span>
      </div>
    </TableHead>
  );
}
