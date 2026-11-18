"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { ArrowUpRight, CalendarCheck, Clock, Filter, Phone, Send, Users } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmCommercialReport } from "../viewmodels/useCrmReportsViewModel";

interface CrmReportsFunnelAndTouchpointsColumnProps {
  report: CrmCommercialReport;
}

/** Right column of CRM Reports showing Lead Conversion Funnel and Sales Activity Execution metrics. */
export function CrmReportsFunnelAndTouchpointsColumn({
  report,
}: CrmReportsFunnelAndTouchpointsColumnProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="lg:col-span-5 space-y-5">
      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4" data-testid="report-lead-funnel-card">
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-info" />
              <h3 className="text-sm font-bold text-nx-ink">{t("crm.reports.leadFunnelTitle")}</h3>
            </div>
            <p className="text-xs text-nx-ink-3 mt-0.5">{t("crm.reports.leadFunnelSubtitle")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/crm/leads")}
            className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
          >
            <span>{t("crm.reports.openLeadsBtn")}</span>
            <ArrowUpRight className="size-3" />
          </Button>
        </div>

        <div className="space-y-2.5">
          {[
            { label: t("crm.reports.funnelStep1"), count: report.leadFunnel.newCount, badgeClass: "border-nx-line bg-nx-raised text-nx-ink" },
            { label: t("crm.reports.funnelStep2"), count: report.leadFunnel.workingCount, badgeClass: "border-info/30 bg-info/10 text-info" },
            { label: t("crm.reports.funnelStep3"), count: report.leadFunnel.qualifiedCount, badgeClass: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent" },
            { label: t("crm.reports.funnelStep4"), count: report.leadFunnel.convertedCount, badgeClass: "border-success/30 bg-success/10 text-success" },
            { label: t("crm.reports.funnelStepDisqualified"), count: report.leadFunnel.disqualifiedCount, badgeClass: "border-destructive/30 bg-destructive/10 text-destructive" },
          ].map((step) => {
            const pct = report.leadFunnel.totalLeads > 0 ? Math.round((step.count / report.leadFunnel.totalLeads) * 100) : 0;
            return (
              <div key={step.label} className="rounded-nx-md border border-nx-line bg-nx-raised/40 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-nx-ink">{step.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-nx-ink-3">{pct}%</span>
                  <Badge variant="outline" className={cn("text-xs font-bold", step.badgeClass)}>{step.count}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4" data-testid="report-activity-execution-card">
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-nx-warning-strong" />
            <h3 className="text-sm font-bold text-nx-ink">{t("crm.reports.touchpointsTitle")}</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/crm/activities")}
            className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
          >
            <span>{t("crm.reports.executionDeskBtn")}</span>
            <ArrowUpRight className="size-3" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
            <div className="flex items-center justify-between text-nx-ink-3">
              <span>{t("crm.reports.callsLoggedLabel")}</span>
              <Phone className="size-3.5 text-info" />
            </div>
            <div className="text-lg font-bold text-nx-ink">{report.activities.callsCount}</div>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
            <div className="flex items-center justify-between text-nx-ink-3">
              <span>{t("crm.reports.meetingsHeldLabel")}</span>
              <Users className="size-3.5 text-nx-accent" />
            </div>
            <div className="text-lg font-bold text-nx-ink">{report.activities.meetingsCount}</div>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
            <div className="flex items-center justify-between text-nx-ink-3">
              <span>{t("crm.reports.communicationsSentLabel")}</span>
              <Send className="size-3.5 text-success" />
            </div>
            <div className="text-lg font-bold text-nx-ink">{report.activities.communicationsSentCount}</div>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
            <div className="flex items-center justify-between text-nx-ink-3">
              <span>{t("crm.reports.followUpTasksLabel")}</span>
              <CalendarCheck className="size-3.5 text-nx-warning-strong" />
            </div>
            <div className="text-lg font-bold text-nx-ink">{report.activities.followUpsCreatedCount}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
