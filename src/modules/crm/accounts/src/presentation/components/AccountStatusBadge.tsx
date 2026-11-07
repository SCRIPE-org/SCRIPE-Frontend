"use client";

import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface AccountStatusBadgeProps {
  tierCode?: string;
  className?: string;
}

export function AccountStatusBadge({ tierCode, className }: AccountStatusBadgeProps) {
  const { t } = useI18n();
  const rawTier = tierCode || "Standard";
  const tier = rawTier.toUpperCase();

  let variantClass = "bg-nx-raised text-nx-ink-2 border-nx-line";

  if (tier.includes("ENTERPRISE") || tier.includes("STRATEGIC")) {
    variantClass = "bg-nx-accent-wash text-nx-accent border-nx-accent/30 font-bold";
  } else if (tier.includes("TIER 1") || tier.includes("KEY")) {
    variantClass = "bg-info/10 text-info border-info/30 font-semibold";
  } else if (tier.includes("TIER 2") || tier.includes("GROWTH")) {
    variantClass = "bg-success/10 text-success border-success/30 font-medium";
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 text-[11px] rounded-nx-sm tracking-wide capitalize",
        variantClass,
        className
      )}
    >
      {t(`crmAccounts.tiers.${rawTier}`, { defaultValue: rawTier })}
    </Badge>
  );
}
