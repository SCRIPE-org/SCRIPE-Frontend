/**
 * DowngradeNotice — Downgrade Alert Banner
 *
 * Shows a warning when the subscription was downgraded,
 * with the original edition name and type.
 */
import { Card, CardContent } from "@core/ui/card";
import { AlertTriangle } from "lucide-react";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";

interface DowngradeNoticeProps {
  sub: SubscriptionListItem;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Presentation UI component rendering the downgrade notice.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DowngradeNotice({ sub, t }: DowngradeNoticeProps) {
  if (!sub.isDowngraded) return null;

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="flex items-center gap-3 py-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <div className="text-sm">
          <span className="font-medium text-warning">{t("entSubscriptions.downgraded")}</span>
          {sub.downgradedFromEditionName && (
            <span className="text-nx-ink-2">
              {" · "}
              {sub.downgradedFromType
                ? t("entSubscriptions.downgradedFromType", {
                    edition: sub.downgradedFromEditionName,
                    type: sub.downgradedFromType,
                  })
                : t("entSubscriptions.downgradedFrom", {
                    edition: sub.downgradedFromEditionName,
                  })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
