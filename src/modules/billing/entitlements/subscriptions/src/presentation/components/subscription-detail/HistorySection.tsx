/**
 * HistorySection — Past Subscription Records
 *
 * Compact list of previous subscriptions with status dots,
 * edition names, date ranges, and amounts.
 * Only shown when tenant has more than 1 subscription record.
 */
import { cn, formatDateUtc } from "@core/common/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Clock } from "lucide-react";
import { STATUS_VARIANTS, STATUS_KEY_MAP, TYPE_KEY_MAP } from "../../constants";
import { STATUS_STYLES, DEFAULT_STATUS_STYLE } from "./status-styles";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";

interface HistorySectionProps {
  items: SubscriptionListItem[];
  currentId: string;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the history section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function HistorySection({ items, currentId, t }: HistorySectionProps) {
  const pastItems = items.filter((s) => s.id !== currentId);
  if (pastItems.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />
          {t("entSubscriptions.history")}
        </CardTitle>
        <CardDescription className="text-xs">{t("entSubscriptions.historyDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pastItems.map((item) => {
            const style = STATUS_STYLES[item.status] ?? DEFAULT_STATUS_STYLE;
            const typeKey = TYPE_KEY_MAP[item.type] ?? item.type;
            const statusKey = STATUS_KEY_MAP[item.status] ?? item.status;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-nx-md border border-nx-line px-4 py-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("h-2 w-2 rounded-full", style.dotColor)} aria-hidden="true" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-nx-ink">{item.editionName}</span>
                      <Badge
                        variant={STATUS_VARIANTS[item.status] ?? "outline"}
                        className="text-[10px]"
                      >
                        {t(`entSubscriptions.${statusKey}`) || item.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {t(`entSubscriptions.${typeKey}`) || item.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-nx-ink-2">
                      {item.startDate ? formatDateUtc(item.startDate) : "—"}
                      {item.endDate ? ` → ${formatDateUtc(item.endDate)}` : ""}
                    </span>
                  </div>
                </div>
                {item.totalAmount != null && item.currency && (
                  <span className="text-sm font-medium tabular-nums text-nx-ink-2">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: item.currency,
                      minimumFractionDigits: 2,
                    }).format(item.totalAmount)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
