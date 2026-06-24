/**
 * HistorySection — Past Subscription Records
 *
 * Compact list of previous subscriptions with status dots,
 * edition names, date ranges, and amounts.
 * Only shown when tenant has more than 1 subscription record.
 */
import { format } from "date-fns";
import { cn } from "@core/common/utils";
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
 * React presentation component representing the history section UI element.
 */
export function HistorySection({ items, currentId, t }: HistorySectionProps) {
  const pastItems = items.filter((s) => s.id !== currentId);
  if (pastItems.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Subscription History
        </CardTitle>
        <CardDescription className="text-xs">
          Previous subscription records for this tenant
        </CardDescription>
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
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("h-2 w-2 rounded-full", style.dotColor)} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.editionName}</span>
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
                    <span className="text-xs text-muted-foreground">
                      {item.startDate ? format(new Date(item.startDate), "MMM d, yyyy") : "—"}
                      {item.endDate ? ` → ${format(new Date(item.endDate), "MMM d, yyyy")}` : ""}
                    </span>
                  </div>
                </div>
                {item.totalAmount != null && item.currency && (
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
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
