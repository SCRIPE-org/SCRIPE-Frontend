"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { ShieldCheck, AlertCircle, ArrowUpRight, User } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { cn } from "@core/common/utils";
import type { CrmRecentDeal } from "../../domain/entities/OverviewEntity";
import { CrmStatusBadge } from "./CrmStatusBadge";
import { useCrmCurrency } from "../viewmodels/useCrmCurrency";

interface CrmRecentDealsTableProps {
  deals: CrmRecentDeal[];
  className?: string;
}

export function CrmRecentDealsTable({ deals, className }: CrmRecentDealsTableProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, autoConvertToBase, showOriginalCurrencyOnConverted, convertAmount } =
    useCrmCurrency();

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
      <div className="p-4 sm:p-5 border-b border-nx-line flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-nx-ink font-heading">
            {t("crm.recentDeals.title")}
          </h3>
          <p className="text-xs text-nx-ink-2 mt-0.5">
            {t("crm.recentDeals.subtitle")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/crm/opportunities")}
          className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised gap-1"
        >
          <span>{t("crm.tabs.deals")}</span>
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      <div className="w-full overflow-x-auto" dir={isRtl ? "rtl" : "ltr"}>
        <Table className="w-full text-left text-xs border-collapse">
          <TableHeader>
            <TableRow className="border-b border-nx-line bg-nx-raised/50 text-nx-ink-2 font-semibold">
              <TableHead className="px-4 py-3 text-start">{t("crm.recentDeals.dealName")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crm.recentDeals.party")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crm.recentDeals.stage")}</TableHead>
              <TableHead className="px-4 py-3 text-start">
                {t("crm.recentDeals.value")} ({autoConvertToBase ? baseCurrency : "Native"})
              </TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crm.recentDeals.owner")}</TableHead>
              <TableHead className="px-4 py-3 text-end">{t("crm.recentDeals.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-nx-line">
            {deals.map((deal) => {
              const dealCurr = (deal.currency || "SAR").toUpperCase();
              const targetCurr = autoConvertToBase ? baseCurrency : dealCurr;
              const converted = convertAmount(deal.amount, dealCurr, targetCurr);
              const showDual =
                autoConvertToBase &&
                showOriginalCurrencyOnConverted &&
                dealCurr !== targetCurr;

              return (
                <TableRow
                  key={deal.id}
                  onClick={() => router.push(`/crm/opportunities/${deal.id}`)}
                  className="group hover:bg-nx-raised/40 transition-colors duration-nx-micro cursor-pointer"
                >
                  <TableCell className="px-4 py-3 font-semibold text-nx-ink max-w-xs truncate">
                    {deal.title}
                  </TableCell>

                  <TableCell className="px-4 py-3">
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
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <CrmStatusBadge stage={deal.stageKey} />
                  </TableCell>

                  <TableCell className="px-4 py-3 font-bold font-mono text-nx-ink">
                    <span>
                      {targetCurr} {converted.toLocaleString()}
                    </span>
                    {showDual && (
                      <span className="block text-[10px] font-normal text-nx-ink-3">
                        ({dealCurr} {deal.amount.toLocaleString()})
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-nx-ink-2">
                      <div className="size-5 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                        <User className="size-3 text-nx-ink-3" />
                      </div>
                      <span className="truncate max-w-[120px]">{deal.ownerName}</span>
                    </div>
                  </TableCell>

                  <TableCell
                    className="px-4 py-3 text-end"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/crm/opportunities/${deal.id}`);
                    }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/crm/opportunities/${deal.id}`)}
                      className="h-7 px-2 text-xs text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised gap-1"
                    >
                      <span>{t("crmOpportunities.actions.viewDetails", { defaultValue: "View" })}</span>
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
