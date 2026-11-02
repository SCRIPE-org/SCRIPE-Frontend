"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { ShieldCheck, AlertCircle, ArrowUpRight, User } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import type { CrmRecentDeal } from "../../domain/entities/OverviewEntity";
import { CrmStatusBadge } from "./CrmStatusBadge";

interface CrmRecentDealsTableProps {
  deals: CrmRecentDeal[];
  className?: string;
}

export function CrmRecentDealsTable({ deals, className }: CrmRecentDealsTableProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  if (deals.length === 0) {
    return (
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-8 text-center">
        <EmptyState
          title={t("crm.recentDeals.emptyTitle")}
          description={t("crm.recentDeals.emptyDescription")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="p-4 sm:p-5 border-b border-nx-line">
        <h3 className="text-sm font-bold text-nx-ink font-heading">
          {t("crm.recentDeals.title")}
        </h3>
        <p className="text-xs text-nx-ink-2 mt-0.5">
          {t("crm.recentDeals.subtitle")}
        </p>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-nx-line bg-nx-surfaceSubtle/50 text-nx-ink-2 font-semibold">
              <th className="px-4 py-3 text-start">{t("crm.recentDeals.dealName")}</th>
              <th className="px-4 py-3 text-start">{t("crm.recentDeals.party")}</th>
              <th className="px-4 py-3 text-start">{t("crm.recentDeals.stage")}</th>
              <th className="px-4 py-3 text-start">{t("crm.recentDeals.value")}</th>
              <th className="px-4 py-3 text-start">{t("crm.recentDeals.owner")}</th>
              <th className="px-4 py-3 text-end">{t("crm.recentDeals.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line">
            {deals.map((deal) => {
              return (
                <tr
                  key={deal.id}
                  className="group hover:bg-nx-surfaceSubtle/40 transition-colors duration-nx-micro"
                >
                  <td className="px-4 py-3 font-semibold text-nx-ink max-w-xs truncate">
                    {deal.title}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-nx-ink-2 truncate max-w-[180px]">
                        {deal.partyName}
                      </span>
                      {deal.partyVerified ? (
                        <span
                          title={t("crm.recentDeals.verified")}
                          className="text-success inline-flex items-center"
                        >
                          <ShieldCheck className="size-3.5 text-success shrink-0" />
                        </span>
                      ) : (
                        <span
                          title={t("crm.recentDeals.unverified")}
                          className="text-warning inline-flex items-center"
                        >
                          <AlertCircle className="size-3.5 text-warning shrink-0" />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <CrmStatusBadge stage={deal.stageKey} />
                  </td>

                  <td className="px-4 py-3 font-bold text-nx-ink">
                    {deal.currency} {deal.amount.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-nx-ink-2">
                      <div className="size-5 rounded-full bg-nx-surfaceSubtle border border-nx-line flex items-center justify-center shrink-0">
                        <User className="size-3 text-nx-ink-3" />
                      </div>
                      <span className="truncate max-w-[120px]">{deal.ownerName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surfaceSubtle gap-1"
                    >
                      <span>View</span>
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
