"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { CrmShell, CrmSectionHeader } from "@modules/crm";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Building2, CheckCircle2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { useActivitiesExecutionDeskViewModel } from "../viewmodels/useActivitiesExecutionDeskViewModel";
import { ActivityTimeline } from "../components/ActivityTimeline";

export function ActivitiesExecutionDeskView() {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const {
    accounts,
    selectedAccountId,
    selectedAccountName,
    isLoadingAccounts,
    selectAccount,
  } = useActivitiesExecutionDeskViewModel(language);

  return (
    <CrmShell activeTab="activities" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        {/* Header */}
        <CrmSectionHeader
          title={t("crmActivities.executionDesk.title") || "Sales Execution Desk"}
          subtitle={
            t("crmActivities.executionDesk.description") ||
            "Unified commercial interaction timeline, meeting notes, call logs, and WorkManagement task dispatch."
          }
        />

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 bg-nx-surface border-nx-line space-y-1">
            <span className="text-[10px] font-mono text-nx-ink-3 uppercase font-medium">
              {t("crmActivities.stats.mode") || "Execution Protocol"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-nx-ink font-heading">
                SCRIPE D5/B Append-Only
              </span>
              <Badge variant="outline" className="border-nx-accent/30 bg-nx-accent-wash text-nx-accent text-[10px]">
                Active
              </Badge>
            </div>
            <p className="text-[10px] text-nx-ink-3">
              Immutable timeline audit with cryptographic ID scoping
            </p>
          </Card>

          <Card className="p-3.5 bg-nx-surface border-nx-line space-y-1">
            <span className="text-[10px] font-mono text-nx-ink-3 uppercase font-medium">
              {t("crmActivities.stats.dispatch") || "Follow-up Engine"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-nx-ink font-heading">
                WorkManagement Tasks
              </span>
              <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning text-[10px]">
                Cross-Module
              </Badge>
            </div>
            <p className="text-[10px] text-nx-ink-3">
              Zero physical foreign keys; decoupled AstraFlow correlation
            </p>
          </Card>

          <Card className="p-3.5 bg-nx-surface border-nx-line space-y-1">
            <span className="text-[10px] font-mono text-nx-ink-3 uppercase font-medium">
              {t("crmActivities.stats.privacy") || "Field-Level Security"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-nx-ink font-heading">
                PII Policy Enforced
              </span>
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px]">
                Verified
              </Badge>
            </div>
            <p className="text-[10px] text-nx-ink-3">
              Confidential interaction masking per role permissions
            </p>
          </Card>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Accounts Navigation Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-nx-line">
              <span className="text-xs font-bold text-nx-ink flex items-center gap-1.5 font-mono uppercase">
                <Building2 className="size-3.5 text-nx-accent" />
                {t("crmActivities.executionDesk.selectAccount") || "Commercial Accounts"}
              </span>
              <Badge variant="secondary" className="bg-nx-surface border-nx-line text-[10px] font-mono text-nx-ink-3">
                {accounts.length}
              </Badge>
            </div>

            {isLoadingAccounts ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" className="text-nx-accent" />
              </div>
            ) : accounts.length === 0 ? (
              <Card className="p-4 text-center text-xs text-nx-ink-3 border-nx-line bg-nx-surface">
                No accounts available
              </Card>
            ) : (
              <div className="space-y-1.5">
                {accounts.map((acc) => {
                  const isSelected = acc.id === selectedAccountId;
                  const name =
                    language === "ar" && acc.nameAr
                      ? acc.nameAr
                      : acc.nameEn;

                  return (
                    <Card
                      key={acc.id}
                      onClick={() => selectAccount(acc)}
                      className={cn(
                        "p-3 border transition-all cursor-pointer",
                        isSelected
                          ? "bg-nx-surface border-nx-accent text-nx-ink"
                          : "bg-nx-surface border-nx-line hover:border-nx-line-hi text-nx-ink-2"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-nx-ink block hover:text-nx-accent">
                            {name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-3">
                            <Badge variant="outline" className="border-nx-line bg-nx-raised py-0 px-1 text-[9px]">
                              {acc.commercialTierCode || "Standard"}
                            </Badge>
                            {acc.preferredCurrencyCode && (
                              <>
                                <span>•</span>
                                <span className="font-mono">{acc.preferredCurrencyCode}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center justify-center size-5 rounded-full border border-nx-accent/30 bg-nx-accent-wash text-nx-accent shrink-0">
                            <CheckCircle2 className="size-3.5" />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Active Entity Timeline */}
          <div className="lg:col-span-8 space-y-4">
            {selectedAccountId ? (
              <Card className="p-5 bg-nx-surface border-nx-line space-y-4">
                <div className="flex items-center justify-between border-b border-nx-line pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-nx-ink-3 uppercase font-medium">
                      {t("crmActivities.executionDesk.activeAccount") || "Selected Target Account"}
                    </span>
                    <h3 className="text-sm font-bold text-nx-ink font-heading">
                      {selectedAccountName}
                    </h3>
                  </div>
                </div>

                <ActivityTimeline
                  accountId={selectedAccountId}
                  targetLabel={selectedAccountName}
                />
              </Card>
            ) : (
              <Card className="p-8 text-center bg-nx-surface border-nx-line text-xs text-nx-ink-3">
                Select an account from the left to view and record timeline interactions.
              </Card>
            )}
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
