// FILE-EXCEPTION: file length
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Search, ArrowRight, Tag } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";

interface SubscriptionItem {
  id: string;
  tenantId: string;
  tenantName: string;
  editionName: string;
  isDowngraded?: boolean;
  status: string;
  type: string;
  totalAmount: number;
  totalAmountUsd: number;
  currency: string;
  appliedPromoCode?: string;
  promotionDiscount?: number;
  startDate: string;
  endDate?: string;
}

interface SubscriptionsDataTableProps {
  subscriptions: SubscriptionItem[];
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  totalCount: number;
  totalPromoDiscount: number;
  totalMrr: number;
  formatDisplay: (amount: number, currency: string) => string;
  t: (key: string) => string;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/30",
  Trialing: "bg-info/10 text-info border-info/30",
  Suspended: "bg-warning/10 text-warning border-warning/30",
  Canceled: "bg-destructive/10 text-destructive border-destructive/30",
  Expired: "bg-nx-raised text-nx-ink-2 border-nx-line",
  GracePeriod: "bg-warning/10 text-warning border-warning/30",
};

// See UpcomingRenewalsTimeline for why Monthly/Lifetime borrow the workspace
// accent rather than a fixed hue.
const TYPE_COLORS: Record<string, string> = {
  Monthly:
    "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
  Yearly: "border-info/30 bg-info/10 text-info",
  Lifetime:
    "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
  Trial: "border-info/30 bg-info/10 text-info",
};

/**
 * Presentation UI component rendering the subscriptions data table.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubscriptionsDataTable({
  subscriptions,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  totalCount,
  totalPromoDiscount,
  totalMrr,
  formatDisplay,
  t,
}: SubscriptionsDataTableProps) {
  const router = useRouter();

  const goToTenant = (tenantId: string) => router.push(`/tenants/${tenantId}`);

  return (
    <div className="space-y-4">
      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            placeholder={t("entSubscriptions.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 text-xs font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-1.5 rounded-nx-control border border-nx-line bg-nx-raised p-1">
            {["all", "Active", "Trialing", "Suspended", "Canceled"].map((status) => {
              const statusLabels: Record<string, string> = {
                all: t("common.all"),
                Active: t("tenant.statusLabel.active"),
                Trialing: t("tenant.statusLabel.trialing"),
                Suspended: t("tenant.statusLabel.suspended"),
                Canceled: t("tenant.statusLabel.canceled"),
              };
              const isActive = statusFilter === status;
              return (
                <Button
                  key={status}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="h-7 px-3 text-[11px] font-semibold"
                >
                  {statusLabels[status] || status}
                </Button>
              );
            })}
          </div>

          {/* Type buttons */}
          <div className="flex items-center gap-1.5 rounded-nx-control border border-nx-line bg-nx-raised p-1">
            {["all", "Monthly", "Yearly", "Lifetime", "Trial"].map((type) => {
              const typeLabels: Record<string, string> = {
                all: t("common.all"),
                Monthly: t("tenant.typeLabel.monthly"),
                Yearly: t("tenant.typeLabel.yearly"),
                Lifetime: t("tenant.typeLabel.lifetime"),
                Trial: t("tenant.typeLabel.trial"),
              };
              const isActive = typeFilter === type;
              return (
                <Button
                  key={type}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className="h-7 px-3 text-[11px] font-semibold"
                >
                  {typeLabels[type] || type}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>{t("common.tenant")}</TableHead>
                <TableHead>{t("entSubscriptions.edition")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("entSubscriptions.type")}</TableHead>
                <TableHead variant="numeric">{t("entSubscriptions.amount")}</TableHead>
                <TableHead>{t("tenant.promoCode")}</TableHead>
                <TableHead variant="numeric">{t("entSubscriptions.mrrContribution")}</TableHead>
                <TableHead>{t("entSubscriptions.startDate")}</TableHead>
                <TableHead>{t("entSubscriptions.endDate")}</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-28 text-center text-sm font-medium text-nx-ink-3"
                  >
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub, idx) => {
                  const mrr =
                    sub.status === "Canceled" || sub.status === "Expired"
                      ? 0
                      : sub.type === "Lifetime"
                        ? 0
                        : sub.type === "Yearly"
                          ? sub.totalAmountUsd / 12
                          : sub.totalAmountUsd;

                  return (
                    <TableRow
                      key={sub.id}
                      clickable
                      onClick={() => goToTenant(sub.tenantId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          goToTenant(sub.tenantId);
                        }
                      }}
                    >
                      <TableCell className="text-xs font-medium tabular-nums text-nx-ink-3">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-nx-ink">{sub.tenantName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-nx-ink">
                            {sub.editionName}
                          </span>
                          {sub.isDowngraded && (
                            <span className="text-[10px] font-semibold text-warning">
                              {t("entSubscriptions.downgraded")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                            STATUS_COLORS[sub.status] || ""
                          }`}
                        >
                          {t(`tenant.statusLabel.${sub.status.toLowerCase()}`) || sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                            TYPE_COLORS[sub.type] || ""
                          }`}
                        >
                          {t(`tenant.typeLabel.${sub.type.toLowerCase()}`) || sub.type}
                        </Badge>
                      </TableCell>
                      <TableCell variant="numeric" className="text-xs font-semibold text-nx-ink">
                        {formatDisplay(sub.totalAmount, sub.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {sub.appliedPromoCode ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="outline"
                              className="w-fit border-success/30 bg-success/10 text-[10px] font-semibold text-success"
                            >
                              <Tag className="h-3 w-3" aria-hidden="true" />
                              {sub.appliedPromoCode}
                            </Badge>
                            {sub.promotionDiscount != null && sub.promotionDiscount > 0 && (
                              <span className="text-[10px] font-semibold text-success">
                                −{formatDisplay(sub.promotionDiscount, sub.currency)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-nx-ink-3">—</span>
                        )}
                      </TableCell>
                      <TableCell variant="numeric" className="text-xs font-medium text-nx-ink-2">
                        {formatDisplay(mrr, "USD")}
                        <span className="text-[10px] text-nx-ink-3">/mo</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-nx-ink-2">
                        {formatDateUtc(sub.startDate)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-nx-ink-2">
                        {sub.endDate ? formatDateUtc(sub.endDate) : "∞"}
                      </TableCell>
                      <TableCell variant="numeric">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={t("entSubscriptions.manage")}
                          aria-label={t("entSubscriptions.manage")}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/entitlements/subscriptions/${sub.tenantId}`);
                          }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs font-semibold text-nx-ink-2">
        <span>
          {subscriptions.length} {t("common.of")} {totalCount} {t("common.total")}
        </span>
        <div className="flex items-center gap-4">
          {totalPromoDiscount > 0 && (
            <span className="flex items-center gap-1 font-medium text-success">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {t("dashboard.footer.promoDiscount")}: {formatDisplay(totalPromoDiscount, "USD")}
            </span>
          )}
          <span>
            {t("entSubscriptions.totalMrr")}:{" "}
            <span className="text-nx-ink">{formatDisplay(totalMrr, "USD")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
