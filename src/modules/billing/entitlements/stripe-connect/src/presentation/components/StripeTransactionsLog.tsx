// FILE-EXCEPTION: file length
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { StatCard } from "@core/ui/stat-card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { SectionState } from "@core/ui/section-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Zap, Banknote } from "lucide-react";
import type { TenantTransactionsResult } from "../../domain/entities/ConnectAccount";

const TXN_STATUS_OPTIONS = ["ALL", "Pending", "Collected", "Refunded", "PartiallyRefunded"] as const;
const TXN_TYPE_OPTIONS = ["ALL", "Payment", "Refund", "PartialRefund"] as const;

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  Pending: "warning",
  Collected: "success",
  Refunded: "destructive",
  PartiallyRefunded: "warning",
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

/**
 * Presentation UI component rendering the stripe transactions log.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
      timeZone: "UTC",
    }).format(new Date(dateStr));
  };

  // Filter option labels resolve at render time, since the dictionary is only
  // available inside the component.
  const statusLabel = (value: string) =>
    value === "ALL" ? t("common.all") : t(`entitlements.stripeConnect.status${value}`);
  const typeLabel = (value: string) =>
    value === "ALL" ? t("common.all") : t(`entitlements.tenantConnect.txn.type${value}`);

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
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} isLoading label="" value="" />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ArrowUpRight}
              tone="success"
              label={t("entitlements.tenantConnect.txn.grossRevenue")}
              value={formatCurrency(summary.totalGrossRevenue, summary.currency)}
              subtitle={`${summary.totalTransactions} ${t("entitlements.tenantConnect.transactions")}`}
            />
            <StatCard
              icon={Zap}
              tone="neutral"
              label={t("entitlements.tenantConnect.txn.platformFees")}
              value={formatCurrency(summary.totalPlatformFees, summary.currency)}
              subtitle={t("entitlements.tenantConnect.txn.deducted")}
            />
            <StatCard
              icon={Banknote}
              tone="info"
              label={t("entitlements.tenantConnect.txn.netRevenue")}
              value={formatCurrency(summary.totalNetRevenue, summary.currency)}
              subtitle={t("entitlements.tenantConnect.txn.yourEarnings")}
            />
            <StatCard
              icon={ArrowDownLeft}
              tone="danger"
              label={t("entitlements.tenantConnect.txn.refunded")}
              value={formatCurrency(summary.totalRefunded, summary.currency)}
              subtitle={`${summary.refundCount} ${t("entitlements.tenantConnect.txn.refunds")}`}
            />
          </div>
        )
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader className="border-b border-nx-line pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">{t("entitlements.tenantConnect.txn.title")}</CardTitle>
              <CardDescription className="mt-0.5">
                {t("entitlements.tenantConnect.txn.desc")}
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
                  <SelectTrigger
                    className="h-8 text-xs font-semibold"
                    aria-label={t("common.status")}
                  >
                    <SelectValue placeholder={t("common.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TXN_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                        {statusLabel(opt)}
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
                  <SelectTrigger
                    className="h-8 text-xs font-semibold"
                    aria-label={t("entitlements.tenantConnect.txn.col.type")}
                  >
                    <SelectValue placeholder={t("entitlements.tenantConnect.txn.col.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TXN_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                        {typeLabel(opt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SectionState
            isLoading={isLoading}
            isEmpty={txnItems.length === 0}
            emptyMessage={t("entitlements.tenantConnect.txn.empty")}
            skeletonType="rows"
            skeletonRows={5}
          >
            <div className="space-y-4 p-6 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("entitlements.tenantConnect.txn.col.date")}</TableHead>
                    <TableHead>{t("entitlements.tenantConnect.txn.col.type")}</TableHead>
                    <TableHead variant="numeric">
                      {t("entitlements.tenantConnect.txn.col.gross")}
                    </TableHead>
                    <TableHead variant="numeric">
                      {t("entitlements.tenantConnect.txn.col.fee")}
                    </TableHead>
                    <TableHead variant="numeric">
                      {t("entitlements.tenantConnect.txn.col.net")}
                    </TableHead>
                    <TableHead>{t("entitlements.tenantConnect.txn.col.status")}</TableHead>
                    <TableHead variant="numeric">
                      {t("entitlements.tenantConnect.txn.col.refund")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txnItems.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="whitespace-nowrap text-xs font-semibold tabular-nums text-nx-ink-2">
                        {formatDate(txn.transactionDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {txn.type === "Payment" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                          ) : (
                            <ArrowDownLeft
                              className="h-3.5 w-3.5 text-destructive"
                              aria-hidden="true"
                            />
                          )}
                          <span className="text-xs font-bold text-nx-ink-2">
                            {t(`entitlements.tenantConnect.txn.type${txn.type}`)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell variant="numeric" className="text-xs font-bold text-nx-ink">
                        {formatCurrency(txn.grossAmount, txn.currency)}
                      </TableCell>
                      <TableCell variant="numeric" className="text-xs font-semibold text-nx-ink-2">
                        −{formatCurrency(txn.platformFee, txn.currency)}
                      </TableCell>
                      <TableCell variant="numeric" className="text-xs font-extrabold text-nx-ink">
                        {formatCurrency(txn.netAmount, txn.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[txn.status] ?? "secondary"}>
                          {t(`entitlements.stripeConnect.status${txn.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell variant="numeric" className="text-xs font-semibold">
                        {txn.refundedAmount != null && txn.refundedAmount > 0 ? (
                          <span className="font-bold text-destructive">
                            −{formatCurrency(txn.refundedAmount, txn.currency)}
                          </span>
                        ) : (
                          <span className="text-nx-ink-3">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-nx-line pt-4">
                  <p className="text-xs font-semibold text-nx-ink-2">
                    {t("entitlements.tenantConnect.txn.showing")}{" "}
                    <span className="font-bold text-nx-ink">
                      {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
                    </span>{" "}
                    {t("entitlements.tenantConnect.txn.of")}{" "}
                    <span className="font-bold text-nx-ink">{totalCount}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      aria-label={t("common.previous")}
                    >
                      <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                    </Button>
                    <span className="px-2 text-xs font-bold tabular-nums text-nx-ink">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                      aria-label={t("common.next")}
                    >
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SectionState>
        </CardContent>
      </Card>
    </div>
  );
}
