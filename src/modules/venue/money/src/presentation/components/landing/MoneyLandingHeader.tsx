"use client";

import Link from "next/link";
import { CircleDollarSign, CreditCard, Plus, ReceiptText, RefreshCw } from "lucide-react";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { DateRangeFilter } from "../../viewmodels/useMoneyLandingViewModel";

interface MoneyLandingHeaderProps {
  dateFilter: DateRangeFilter;
  onDateFilterChange: (filter: DateRangeFilter) => void;
  loading: boolean;
  onRefresh: () => void;
  canViewReceivables: boolean;
  canViewPayments: boolean;
  canRecordPayment: boolean;
}

const FILTER_OPTIONS: ReadonlyArray<{ key: DateRangeFilter; labelKey: string }> = [
  { key: "today", labelKey: "money.landing.filters.today" },
  { key: "days7", labelKey: "money.landing.filters.days7" },
  { key: "days30", labelKey: "money.landing.filters.days30" },
  { key: "thisMonth", labelKey: "money.landing.filters.thisMonth" },
];

/**
 * Header and quick-filter toolbar for MoneyLandingView.
 */
export function MoneyLandingHeader({
  dateFilter,
  onDateFilterChange,
  loading,
  onRefresh,
  canViewReceivables,
  canViewPayments,
  canRecordPayment,
}: MoneyLandingHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col justify-between gap-4 border-b border-nx-line pb-5 md:flex-row md:items-center">
      <div>
        <PageHeader
          icon={CircleDollarSign}
          title={t("money.landing.title")}
          description={t("money.landing.description")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <fieldset
          aria-label={t("money.landing.filters.ariaLabel")}
          className="m-0 flex min-w-0 items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-surface p-0.5 text-xs"
        >
          {FILTER_OPTIONS.map(({ key, labelKey }) => {
            const isActive = dateFilter === key;
            return (
              <Button
                key={key}
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={isActive}
                onClick={() => onDateFilterChange(key)}
                className={cn(
                  "h-7 rounded-nx-sm border px-2.5 py-1 text-xs transition-colors",
                  isActive
                    ? "border-nx-accent/40 bg-nx-accent-wash font-semibold text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
                    : "border-transparent font-medium text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
                )}
              >
                {t(labelKey)}
              </Button>
            );
          })}
        </fieldset>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw
            className={cn("size-3.5", loading && "animate-spin")}
            aria-hidden="true"
          />
          <span>{t("money.refresh")}</span>
        </Button>

        {canViewReceivables && (
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/venue/money/receivables">
              <ReceiptText className="size-3.5" aria-hidden="true" />
              <span>{t("money.landing.viewReceivables")}</span>
            </Link>
          </Button>
        )}

        {canViewPayments && (
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/venue/money/payments">
              <CreditCard className="size-3.5" aria-hidden="true" />
              <span>{t("money.landing.viewPayments")}</span>
            </Link>
          </Button>
        )}

        {canRecordPayment && (
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
            <Link href="/venue/money/payments">
              <Plus className="size-3.5" aria-hidden="true" />
              <span>{t("money.landing.recordPayment")}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
