"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
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
const fmt = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

const fmtDate = (s: string) => formatDateUtc(s);


const STATUS_COLORS: Record<string, string> = {
  Collected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Pending: "bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400",
  Refunded: "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400",
  Failed: "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400",
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
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-primary" />
              {t("entitlements.stripeConnect.commissionHistory") || "Commission History"}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalCount} {t("entitlements.stripeConnect.totalRecords") || "total records"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filter.status || "all"}
              onValueChange={(v) => onFilterChange({ status: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder={t("common.status") || "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all") || "All"}</SelectItem>
                <SelectItem value="Collected">
                  {t("entitlements.stripeConnect.statusCollected") || "Collected"}
                </SelectItem>
                <SelectItem value="Pending">
                  {t("entitlements.stripeConnect.statusPending") || "Pending"}
                </SelectItem>
                <SelectItem value="Refunded">
                  {t("entitlements.stripeConnect.statusRefunded") || "Refunded"}
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
                <X className="h-3.5 w-3.5" />
                {t("common.clear") || "Clear"}
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
          <EmptyCommissions />
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

function EmptyCommissions() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Receipt className="mb-3 h-10 w-10 opacity-30" />
      <p className="font-medium">
        {t("entitlements.stripeConnect.noCommissions") || "No commission records yet"}
      </p>
      <p className="mt-1 text-sm opacity-70">
        {t("entitlements.stripeConnect.noCommissionsDesc") ||
          "Commission records will appear here after your first successful payment."}
      </p>
    </div>
  );
}

function CommissionTable({ commissions }: { commissions: Commission[] }) {
  const { t } = useI18n();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">
            {t("entitlements.stripeConnect.date") || "Date"}
          </TableHead>
          <TableHead className="text-right text-xs">
            {t("entitlements.stripeConnect.gross") || "Gross"}
          </TableHead>
          <TableHead className="text-right text-xs">
            {t("entitlements.stripeConnect.fee") || "Platform Fee"}
          </TableHead>
          <TableHead className="text-right text-xs">
            {t("entitlements.stripeConnect.net") || "Your Net"}
          </TableHead>
          <TableHead className="text-xs">
            {t("entitlements.stripeConnect.commissionRate") || "Rate"}
          </TableHead>
          <TableHead className="text-xs">{t("common.status") || "Status"}</TableHead>
          <TableHead className="text-xs">
            {t("entitlements.stripeConnect.paymentRef") || "Stripe Ref"}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.map((c) => (
          <TableRow key={c.id} className="text-sm">
            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
              {fmtDate(c.collectedAt ?? c.createdAt)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {fmt(c.grossAmount, c.currency)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-red-500">
              −{fmt(c.commissionAmount, c.currency)}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-emerald-500">
              {fmt(c.netAmount, c.currency)}
            </TableCell>
            <TableCell className="text-xs tabular-nums text-muted-foreground">
              {(c.commissionRate * 100).toFixed(1)}%
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={`text-xs ${STATUS_COLORS[c.status] ?? ""}`}>
                {t(`entitlements.stripeConnect.status${c.status}`) || c.status}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="block max-w-[100px] truncate font-mono text-xs text-muted-foreground">
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
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {t("common.page") || "Page"} {page} {t("common.of") || "of"} {totalPages}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
