"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Receipt, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import type { Commission } from "../../../domain/entities/ConnectAccount";

// ─────────────────────────────────────────────────────────────────────────────
// Shared types (re-exported for the view)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for payouts filter.
 */
export interface PayoutsFilter {
  status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
// Backend already returns dollar-denominated decimals (converted from Stripe cents server-side).
const fmt = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

const fmtDate = (s: string) => formatDateUtc(s);

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  Collected: "success",
  Pending: "warning",
  Refunded: "destructive",
  Failed: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface CommissionHistoryCardProps {
  commissions: Commission[];
  totalCount: number;
  page: number;
  totalPages: number;
  filter: PayoutsFilter;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onFilterChange: (f: Partial<PayoutsFilter>) => void;
  onClearFilter: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Presentation UI component rendering the commission history card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CommissionHistoryCard({
  commissions,
  totalCount,
  page,
  totalPages,
  filter,
  isLoading,
  onPageChange,
  onFilterChange,
  onClearFilter,
}: CommissionHistoryCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      {/* ── Header ── */}
      <CardHeader className="border-b border-nx-line pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
              {t("entitlements.stripeConnect.commissionHistory")}
            </CardTitle>
            <p className="mt-0.5 text-xs text-nx-ink-3">
              {t("entitlements.stripeConnect.totalRecords", { count: totalCount })}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            <Select
              value={filter.status || "all"}
              onValueChange={(v) => onFilterChange({ status: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="h-8 w-36 text-xs" aria-label={t("common.status")}>
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="Collected">
                  {t("entitlements.stripeConnect.statusCollected")}
                </SelectItem>
                <SelectItem value="Pending">
                  {t("entitlements.stripeConnect.statusPending")}
                </SelectItem>
                <SelectItem value="Refunded">
                  {t("entitlements.stripeConnect.statusRefunded")}
                </SelectItem>
              </SelectContent>
            </Select>
            {filter.status && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
                onClick={onClearFilter}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t("common.clear")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* ── Body ── */}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : commissions.length === 0 ? (
          <EmptyState
            bare
            size="sm"
            icon={Receipt}
            title={t("entitlements.stripeConnect.noCommissions")}
            description={t("entitlements.stripeConnect.noCommissionsDesc")}
          />
        ) : (
          <>
            <CommissionTable commissions={commissions} />
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Private sub-parts — each calls useI18n() internally
// ─────────────────────────────────────────────────────────────────────────────

function CommissionTable({ commissions }: { commissions: Commission[] }) {
  const { t } = useI18n();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("entitlements.stripeConnect.date")}</TableHead>
          <TableHead variant="numeric">{t("entitlements.stripeConnect.gross")}</TableHead>
          <TableHead variant="numeric">{t("entitlements.stripeConnect.fee")}</TableHead>
          <TableHead variant="numeric">{t("entitlements.stripeConnect.net")}</TableHead>
          <TableHead>{t("entitlements.stripeConnect.commissionRate")}</TableHead>
          <TableHead>{t("common.status")}</TableHead>
          <TableHead>{t("entitlements.stripeConnect.paymentRef")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="whitespace-nowrap text-xs text-nx-ink-2">
              {fmtDate(c.collectedAt ?? c.createdAt)}
            </TableCell>
            <TableCell variant="numeric" className="font-medium">
              {fmt(c.grossAmount, c.currency)}
            </TableCell>
            <TableCell variant="numeric" className="text-destructive">
              −{fmt(c.commissionAmount, c.currency)}
            </TableCell>
            <TableCell variant="numeric" className="font-semibold text-success">
              {fmt(c.netAmount, c.currency)}
            </TableCell>
            <TableCell className="text-xs tabular-nums text-nx-ink-2">
              {(c.commissionRate * 100).toFixed(1)}%
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>
                {t(`entitlements.stripeConnect.status${c.status}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="block max-w-[100px] truncate font-mono text-xs text-nx-ink-3">
                {c.stripePaymentIntentId?.substring(0, 16) ?? "—"}…
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between border-t border-nx-line px-4 py-3">
      <p className="text-xs text-nx-ink-3">
        {t("common.page")} {page} {t("common.of")} {totalPages}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("common.previous")}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("common.next")}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
