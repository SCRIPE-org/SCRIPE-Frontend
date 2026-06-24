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
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  Yearly:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  Lifetime:
    "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  Trial:
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-800",
};

interface UpcomingRenewalsTimelineProps {
  renewals: RenewalItem[];
  formatDisplay: (amount: number, currency: string) => string;
  t: (key: string, params?: any) => string;
}

/**
 * React presentation component representing the upcoming renewals timeline UI element.
 */
export function UpcomingRenewalsTimeline({
  renewals,
  formatDisplay,
  t,
}: UpcomingRenewalsTimelineProps) {
  const router = useRouter();

  if (renewals.length === 0) return null;

  return (
    <Card className="border-amber-200/50 shadow-sm dark:border-amber-800/30">
      <CardHeader className="border-b bg-muted/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/95">
          <CalendarClock className="h-4.5 w-4.5 text-amber-500" />
          {t("entSubscriptions.upcomingRenewals") || "Upcoming Renewals"}
          <Badge
            variant="secondary"
            className="ml-auto border border-amber-200 bg-amber-100 text-[10px] font-extrabold tracking-wide text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
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
                      ? "animate-pulse bg-red-500"
                      : sub.daysLeft <= 14
                        ? "bg-amber-500"
                        : "bg-emerald-500"
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
                      sub.daysLeft <= 7 ? "font-bold text-red-500" : "text-muted-foreground/80"
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
