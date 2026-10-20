"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ReceiptText,
  RefreshCw,
  Lock,
  Search,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { Input } from "@core/ui/input";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueMoneyNav } from "@modules/venue/shared/src/presentation/components/VenueMoneyNav";
import {
  useReceivablesViewModel,
  type ReceivablesStatusFilter,
} from "../viewmodels/useReceivablesViewModel";

function money(value: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/**
 * Documentation for module export
 */
export function ReceivablesView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const { t, language, direction } = useI18n();
  const canView = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canCreatePayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canUpdateAllocations = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE);
  const canRecordPayment = canCreatePayment && canUpdateAllocations;
  const model = useReceivablesViewModel(canView, t("money.error.description"));

  if (!canView) {
    return (
      <div className="space-y-6" dir={direction} data-testid="venue-receivables-denied">
        <EmptyState
          icon={Lock}
          title={t("money.permission.title")}
          description={t("money.permission.description")}
        />
      </div>
    );
  }

  if (model.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner showText={false} />
      </div>
    );
  }

  if (model.error) {
    return (
      <div className="space-y-6" dir={direction}>
        <VenueMoneyNav />
        <EmptyState
          icon={AlertCircle}
          title={t("money.error.title")}
          description={model.error}
          action={
            <Button variant="outline" onClick={() => void model.load()}>
              <RefreshCw className="size-4" />
              {t("money.retry")}
            </Button>
          }
        />
      </div>
    );
  }

  const currencyKeys = Object.keys(model.currencyTotals);

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-receivables">
      <VenueMoneyNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nx-line/80 pb-5">
        <PageHeader
          icon={ReceiptText}
          title={t("money.receivables.title", { defaultValue: "Customer Receivables & Invoices" })}
          description={t("money.receivables.description", {
            defaultValue: "Authoritative customer balances, issued invoices, and payment tracking.",
          })}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void model.load()}
            className="h-8 gap-1.5 text-xs border-nx-line hover:border-nx-accent hover:text-nx-accent"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            <span>{t("money.retry", { defaultValue: "Refresh" })}</span>
          </Button>
          {canRecordPayment && (
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
              <Link href="/venue/money/payments">
                <span>{t("money.receivables.recordPayment", { defaultValue: "Record Payment" })}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Multi-Currency Isolated Balance KPI Cards (Never sum different currencies into one total!) */}
      {currencyKeys.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-nx-ink-3 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {t("money.receivables.pageSummaryTitle", { defaultValue: "Page Receivables Summary" })}
            </span>
            <span className="text-[11px] font-mono">
              {model.isPartial
                ? t("money.receivables.partialBadge", {
                    defaultValue: `Showing ${model.filteredItems.length} of ${model.totalCount} authoritative records`,
                    filtered: model.filteredItems.length,
                    total: model.totalCount,
                  })
                : t("money.receivables.completeBadge", {
                    defaultValue: `All ${model.totalCount} records loaded`,
                    total: model.totalCount,
                  })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {currencyKeys.map((curr) => {
              const stats = model.currencyTotals[curr]!;
              const isUnspecified = curr === "UNSPECIFIED";
              return (
                <Card
                  key={curr}
                  className={`border-nx-line/80 bg-nx-surface p-4 rounded-nx-xl shadow-xs space-y-2.5 ${
                    isUnspecified ? "border-amber-500/40 bg-amber-500/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={isUnspecified ? "destructive" : "outline"}
                      className="font-mono text-xs font-bold px-2 py-0.5"
                    >
                      {isUnspecified
                        ? t("money.receivables.unspecifiedCurrency", { defaultValue: "Unspecified Currency" })
                        : curr}
                    </Badge>
                    <span className="text-[11px] text-nx-ink-3">
                      {stats.count} {t("money.receivables.invoicesCount", { defaultValue: "invoices" })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-nx-line/60 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-nx-ink-3 block">
                        {t("money.receivables.total", { defaultValue: "Total" })}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-nx-ink">
                        {isUnspecified ? stats.total.toFixed(2) : money(stats.total, curr, language)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-nx-ink-3 block">
                        {t("money.receivables.paid", { defaultValue: "Paid" })}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {isUnspecified ? stats.paid.toFixed(2) : money(stats.paid, curr, language)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-nx-ink-3 block">
                        {t("money.receivables.outstanding", { defaultValue: "Outstanding" })}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                        {isUnspecified ? stats.outstanding.toFixed(2) : money(stats.outstanding, curr, language)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-nx-line/80 bg-nx-surface p-3.5 rounded-nx-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center rounded-nx-md border border-nx-line bg-nx-surfaceSubtle p-0.5 text-xs">
            {(
              [
                ["all", t("money.receivables.filterAll", { defaultValue: "All" })],
                ["outstanding", t("money.receivables.filterOutstanding", { defaultValue: "Outstanding" })],
                ["partiallyPaid", t("money.receivables.filterPartiallyPaid", { defaultValue: "Partial" })],
                ["paid", t("money.receivables.filterPaid", { defaultValue: "Paid" })],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => model.setStatusFilter(key as ReceivablesStatusFilter)}
                className={`rounded-nx-sm px-3 py-1 font-medium transition-colors ${
                  model.statusFilter === key
                    ? "bg-nx-accent text-nx-surface font-semibold shadow-xs"
                    : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-hover"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 rtl:left-auto rtl:right-2.5" />
            <Input
              type="text"
              placeholder={t("money.receivables.searchPlaceholder", {
                defaultValue: "Search by invoice # or party ID...",
              })}
              value={model.searchQuery}
              onChange={(e) => model.setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8 rtl:pl-3 rtl:pr-8 bg-nx-surfaceSubtle border-nx-line"
            />
          </div>
        </div>
      </Card>

      {/* Invoices List */}
      {!model.items?.length ? (
        <EmptyState
          icon={ReceiptText}
          title={t("money.receivables.empty.title")}
          description={t("money.receivables.empty.description")}
        />
      ) : model.filteredItems.length === 0 ? (
        <div className="py-12 text-center text-xs text-nx-ink-3 border border-dashed border-nx-line rounded-nx-xl p-8">
          <p>{t("money.receivables.noSearchResults", { defaultValue: "No receivables match your active filters." })}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              model.setSearchQuery("");
              model.setStatusFilter("all");
            }}
            className="mt-3 text-xs"
          >
            {t("money.receivables.clearFilters", { defaultValue: "Reset Filters" })}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {model.filteredItems.map((invoice) => {
            const hasBalance = invoice.outstandingAmount > 0;
            const isSettled = invoice.outstandingAmount === 0 && invoice.paidAmount > 0;

            const badgeVariant = hasBalance ? "warning" : isSettled ? "active" : "outline";

            return (
              <Card
                key={invoice.id}
                className="border-nx-line/80 bg-nx-surface rounded-nx-xl overflow-hidden hover:border-nx-line transition-colors shadow-xs"
              >
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3 border-b border-nx-line/40 bg-nx-surfaceSubtle/30">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-sm font-bold font-mono text-nx-ink" dir="ltr">
                        {invoice.invoiceNumber}
                      </CardTitle>
                      <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                        {invoice.status}
                      </Badge>
                      {invoice.reservationId && (
                        <Link
                          href={`/venue/bookings/${encodeURIComponent(invoice.reservationId)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-nx-accent hover:underline"
                        >
                          <span>{t("money.receivables.viewBooking", { defaultValue: "Booking" })}</span>
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-nx-ink-2">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="size-3 text-nx-ink-3" aria-hidden="true" />
                        {t("money.receivables.issued", {
                          value: new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
                            new Date(invoice.issuedAtUtc)
                          ),
                        })}
                      </span>
                      {invoice.dueAtUtc && (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-nx-ink-3">
                          <Clock className="size-3" aria-hidden="true" />
                          {t("money.receivables.due", {
                            defaultValue: "Due:",
                          })}{" "}
                          {new Intl.DateTimeFormat(language, { dateStyle: "short" }).format(
                            new Date(invoice.dueAtUtc)
                          )}
                        </span>
                      )}
                      <span className="text-[11px] text-nx-ink-3 font-mono">
                        Payer: {invoice.payerPartyId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-nx-ink-3 block uppercase font-semibold">
                      {t("money.receivables.outstanding", { defaultValue: "Outstanding" })}
                    </span>
                    <span className={`text-base font-bold font-mono ${hasBalance ? "text-amber-600 dark:text-amber-400" : "text-nx-ink"}`}>
                      {money(invoice.outstandingAmount, invoice.currencyCode, language)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-3 pb-3 flex flex-wrap items-center justify-between gap-4">
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                    <div>
                      <dt className="text-[11px] text-nx-ink-3">{t("money.receivables.total")}</dt>
                      <dd className="font-semibold font-mono text-nx-ink">
                        {money(invoice.effectiveTotalAmount, invoice.currencyCode, language)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-nx-ink-3">{t("money.receivables.paid")}</dt>
                      <dd className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                        {money(invoice.paidAmount, invoice.currencyCode, language)}
                      </dd>
                    </div>
                    {invoice.creditAmount > 0 && (
                      <div>
                        <dt className="text-[11px] text-nx-ink-3">Credit</dt>
                        <dd className="font-semibold font-mono text-blue-500">
                          {money(invoice.creditAmount, invoice.currencyCode, language)}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {canRecordPayment && hasBalance && (
                    <Button size="sm" asChild className="h-7 text-xs font-semibold px-3">
                      <Link href={`/venue/money/payments?invoiceId=${encodeURIComponent(invoice.id)}`}>
                        {t("money.receivables.recordPayment", { defaultValue: "Record Payment" })}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

