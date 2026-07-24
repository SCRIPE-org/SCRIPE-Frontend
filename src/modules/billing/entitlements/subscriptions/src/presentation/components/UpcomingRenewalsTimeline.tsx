"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { CalendarClock, ArrowRight } from "lucide-react";

interface RenewalItem {
  id: string;
  tenantId: string;
  tenantName: string;
  editionName: string;
  type: string;
  totalAmount: number;
  currency: string;
  daysLeft: number;
}

const TYPE_COLORS: Record<string, string> = {
  Monthly:
    "bg-primary/10 text-primary border-primary/30",
  Yearly:
    "bg-info/10 text-info border-info/30",
  Lifetime:
    "bg-primary/10 text-primary border-primary/30",
  Trial:
    "bg-info/10 text-info border-info/30",
};

interface UpcomingRenewalsTimelineProps {
  renewals: RenewalItem[];
  formatDisplay: (amount: number, currency: string) => string;
  t: (key: string, params?: any) => string;
}

/**
 * Presentation UI component rendering the upcoming renewals timeline.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function UpcomingRenewalsTimeline({
  renewals,
  formatDisplay,
  t,
}: UpcomingRenewalsTimelineProps) {
  const router = useRouter();

  if (renewals.length === 0) return null;

  return (
    <Card className="border-warning/30 shadow-sm">
      <CardHeader className="border-b bg-muted/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/95">
          <CalendarClock className="h-4.5 w-4.5 text-warning" />
          {t("entSubscriptions.upcomingRenewals") || "Upcoming Renewals"}
          <Badge
            variant="secondary"
            className="ml-auto border border-warning/30 bg-warning/10 text-[10px] font-extrabold tracking-wide text-warning"
          >
            {renewals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {renewals.slice(0, 5).map((sub) => (
            <div
              key={sub.id}
              className="py-4.5 flex cursor-pointer items-center justify-between px-6 transition-colors hover:bg-muted/40"
              onClick={() => router.push(`/tenants/${sub.tenantId}`)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    sub.daysLeft <= 7
                      ? "bg-destructive"
                      : sub.daysLeft <= 14
                        ? "bg-warning"
                        : "bg-success"
                  }`}
                />
                <div className="min-w-0">
                  <span className="text-sm font-bold text-foreground/90">{sub.tenantName}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {sub.editionName}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`${TYPE_COLORS[sub.type] || ""} h-4 border px-1.5 text-[9px] font-extrabold`}
                    >
                      {t(`tenant.typeLabel.${sub.type.toLowerCase()}`) || sub.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-extrabold tabular-nums text-foreground">
                    {formatDisplay(sub.totalAmount, sub.currency)}
                  </div>
                  <div
                    className={`mt-0.5 text-xs font-semibold tabular-nums ${
                      sub.daysLeft <= 7 ? "font-bold text-destructive" : "text-muted-foreground/80"
                    }`}
                  >
                    {sub.daysLeft === 1
                      ? t("dashboard.renewal.tomorrow") || "Renews tomorrow"
                      : `${sub.daysLeft} ${t("dashboard.renewal.daysLeft") || "days left"}`}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
