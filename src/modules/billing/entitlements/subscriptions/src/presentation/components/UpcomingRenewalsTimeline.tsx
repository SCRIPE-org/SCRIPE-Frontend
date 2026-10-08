/* eslint-disable @typescript-eslint/no-explicit-any */
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

// The workspace accent stands in for the two "brand" plan types (there is no
// fixed status meaning here, just a categorical highlight); Yearly/Trial use
// the info token, matching the badge the data table renders for the same field.
const TYPE_COLORS: Record<string, string> = {
  Monthly:
    "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
  Yearly: "border-info/30 bg-info/10 text-info",
  Lifetime:
    "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
  Trial: "border-info/30 bg-info/10 text-info",
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
    <Card className="border-warning/30">
      <CardHeader className="border-b border-nx-line pb-3">
        <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
          <CalendarClock className="h-4 w-4 text-warning" aria-hidden="true" />
          {t("entSubscriptions.upcomingRenewals")}
          <Badge
            variant="secondary"
            className="ms-auto border border-warning/30 bg-warning/10 text-[10px] font-semibold tracking-wide text-warning"
          >
            {renewals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-nx-line">
          {renewals.slice(0, 5).map((sub) => (
            <div
              key={sub.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/tenants/${sub.tenantId}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/tenants/${sub.tenantId}`);
                }
              }}
              className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    sub.daysLeft <= 7
                      ? "bg-destructive"
                      : sub.daysLeft <= 14
                        ? "bg-warning"
                        : "bg-success"
                  }`}
                />
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-nx-ink">{sub.tenantName}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-nx-ink-2">{sub.editionName}</span>
                    <Badge
                      variant="secondary"
                      className={`${TYPE_COLORS[sub.type] || ""} h-4 border px-1.5 text-[9px] font-semibold`}
                    >
                      {t(`tenant.typeLabel.${sub.type.toLowerCase()}`) || sub.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-end">
                  <div className="text-sm font-semibold tabular-nums text-nx-ink">
                    {formatDisplay(sub.totalAmount, sub.currency)}
                  </div>
                  <div
                    className={`mt-0.5 text-xs font-medium tabular-nums ${
                      sub.daysLeft <= 7 ? "font-semibold text-destructive" : "text-nx-ink-3"
                    }`}
                  >
                    {sub.daysLeft === 1
                      ? t("dashboard.renewal.tomorrow")
                      : `${sub.daysLeft} ${t("dashboard.renewal.daysLeft")}`}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
