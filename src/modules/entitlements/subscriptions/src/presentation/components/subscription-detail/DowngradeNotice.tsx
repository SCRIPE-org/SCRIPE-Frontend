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
  t: (key: string) => string;
}

/**
 * React presentation component representing the downgrade notice UI element.
 */
export function DowngradeNotice({ sub, t }: DowngradeNoticeProps) {
  if (!sub.isDowngraded) return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex items-center gap-3 py-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <div className="text-sm">
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {t("entSubscriptions.downgraded")}
          </span>
          {sub.downgradedFromEditionName && (
            <span className="text-muted-foreground">
              {" · "}From {sub.downgradedFromEditionName}
              {sub.downgradedFromType && ` (${sub.downgradedFromType})`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
