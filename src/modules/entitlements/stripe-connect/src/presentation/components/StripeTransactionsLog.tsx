// FILE-EXCEPTION: file length
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Zap,
  Banknote,
} from "lucide-react";
import type { TenantTransactionsResult } from "../../domain/entities/ConnectAccount";

const TXN_STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Collected", label: "Collected" },
  { value: "Refunded", label: "Refunded" },
  { value: "PartiallyRefunded", label: "Partial Refund" },
] as const;

const TXN_TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "Payment", label: "Payment" },
  { value: "Refund", label: "Refund" },
  { value: "PartialRefund", label: "Partial Refund" },
] as const;

const TXN_STATUS_STYLES: Record<string, string> = {
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Collected:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Refunded:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  PartiallyRefunded:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

interface StripeTransactionsLogProps {
  transactions: TenantTransactionsResult | null;
  isLoading: boolean;
  page: number;
  pageSize: number;
  status?: string;
  type?: string;
  setPage: (p: number) => void;
  setStatus: (s: string | undefined) => void;
  setType: (t: string | undefined) => void;
}

export function StripeTransactionsLog({
  transactions,
  isLoading,
  page,
  pageSize,
  status,
  type,
  setPage,
  setStatus,
  setType,
}: StripeTransactionsLogProps) {
  const { t, language } = useI18n();

  const formatCurrency = (amount: number, cur?: string) => {
    const c = (cur || "USD").toUpperCase();
    return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: c,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const summary = transactions?.summary;
  const txnItems = transactions?.transactions?.items ?? [];
  const totalCount = transactions?.transactions?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Map undefined/empty to ALL for select components
  const activeStatus = status ?? "ALL";
  const activeType = type ?? "ALL";

  return (
    <div className="space-y-4">
      {/* Financial Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<ArrowUpRight className="h-4 w-4 text-emerald-500" />}
            label={t("entitlements.tenantConnect.txn.grossRevenue") || "Gross Revenue"}
            value={formatCurrency(summary.totalGrossRevenue, summary.currency)}
            sublabel={`${summary.totalTransactions} ${t("entitlements.tenantConnect.transactions") || "transactions"}`}
          />
          <KpiCard
            icon={<Zap className="h-4 w-4 text-violet-500" />}
            label={t("entitlements.tenantConnect.txn.platformFees") || "Platform Fees"}
            value={formatCurrency(summary.totalPlatformFees, summary.currency)}
            sublabel={t("entitlements.tenantConnect.txn.deducted") || "deducted by platform"}
          />
          <KpiCard
            icon={<Banknote className="h-4 w-4 text-blue-500" />}
            label={t("entitlements.tenantConnect.txn.netRevenue") || "Net Revenue"}
            value={formatCurrency(summary.totalNetRevenue, summary.currency)}
            sublabel={t("entitlements.tenantConnect.txn.yourEarnings") || "your earnings"}
          />
          <KpiCard
            icon={<ArrowDownLeft className="h-4 w-4 text-red-500" />}
            label={t("entitlements.tenantConnect.txn.refunded") || "Refunded"}
            value={formatCurrency(summary.totalRefunded, summary.currency)}
            sublabel={`${summary.refundCount} ${t("entitlements.tenantConnect.txn.refunds") || "refunds"}`}
          />
        </div>
      )}

      {/* Transactions Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-foreground/95">
                {t("entitlements.tenantConnect.txn.title") || "Recent Transactions"}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t("entitlements.tenantConnect.txn.desc") ||
                  "Payments received, platform fees, and refunds"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Status filter */}
              <div className="w-[140px]">
                <Select
                  value={activeStatus}
                  onValueChange={(val) => {
                    setStatus(val === "ALL" ? undefined : val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs font-semibold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TXN_STATUS_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs font-semibold"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type filter */}
              <div className="w-[140px]">
                <Select
                  value={activeType}
                  onValueChange={(val) => {
                    setType(val === "ALL" ? undefined : val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs font-semibold">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TXN_TYPE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs font-semibold"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : txnItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-2xl bg-muted/50 p-4">
                <CreditCard className="h-8 w-8 text-muted-foreground/80" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground/85">
                {t("entitlements.tenantConnect.txn.empty") || "No transactions found."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-6 pt-4">
              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                      <th className="px-4 py-3 text-start font-semibold">
                        {t("entitlements.tenantConnect.txn.col.date") || "Date"}
                      </th>
                      <th className="px-4 py-3 text-start font-semibold">
                        {t("entitlements.tenantConnect.txn.col.type") || "Type"}
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {t("entitlements.tenantConnect.txn.col.gross") || "Gross"}
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {t("entitlements.tenantConnect.txn.col.fee") || "Fee"}
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {t("entitlements.tenantConnect.txn.col.net") || "Net"}
                      </th>
                      <th className="px-4 py-3 text-start font-semibold">
                        {t("entitlements.tenantConnect.txn.col.status") || "Status"}
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {t("entitlements.tenantConnect.txn.col.refund") || "Refund"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {txnItems.map((txn) => (
                      <tr key={txn.id} className="transition-colors hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold tabular-nums text-foreground/80">
                          {formatDate(txn.transactionDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {txn.type === "Payment" ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className="text-xs font-bold text-foreground/80">{txn.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-bold tabular-nums text-foreground/90">
                          {formatCurrency(txn.grossAmount, txn.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums text-muted-foreground/85">
                          −{formatCurrency(txn.platformFee, txn.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-extrabold tabular-nums text-foreground">
                          {formatCurrency(txn.netAmount, txn.currency)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className={`border px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
                              TXN_STATUS_STYLES[txn.status] || "bg-muted text-foreground"
                            }`}
                          >
                            {txn.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums">
                          {txn.refundedAmount != null && txn.refundedAmount > 0 ? (
                            <span className="font-bold text-red-600 dark:text-red-400">
                              −{formatCurrency(txn.refundedAmount, txn.currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground/85">
                    {t("entitlements.tenantConnect.txn.showing") || "Showing"}{" "}
                    <span className="font-bold text-foreground/80">
                      {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
                    </span>{" "}
                    {t("entitlements.tenantConnect.txn.of") || "of"}{" "}
                    <span className="font-bold text-foreground/80">{totalCount}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-xs font-bold tabular-nums text-foreground/90">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Local helper ─────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-1.5 flex items-center gap-2 text-muted-foreground/90">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-lg font-extrabold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        {sublabel && (
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground/75">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
