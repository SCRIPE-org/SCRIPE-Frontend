// FILE-EXCEPTION: file length
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Search, ArrowRight, Tag } from "lucide-react";

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
  Active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Trialing:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Suspended:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Canceled:
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800",
  Expired:
    "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  GracePeriod:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

const TYPE_COLORS: Record<string, string> = {
  Monthly:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  Yearly:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  Lifetime:
    "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  Trial:
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-800",
};

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

  return (
    <div className="space-y-4">
      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
          <Input
            placeholder={t("common.search") || "Search by tenant or edition..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs font-semibold"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-1.5 rounded-lg border bg-muted/20 p-1">
            {["all", "Active", "Trialing", "Suspended", "Canceled"].map((status) => {
              const statusLabels: Record<string, string> = {
                all: t("common.all") || "All",
                Active: t("tenant.statusLabel.active") || "Active",
                Trialing: t("tenant.statusLabel.trialing") || "Trialing",
                Suspended: t("tenant.statusLabel.suspended") || "Suspended",
                Canceled: t("tenant.statusLabel.canceled") || "Canceled",
              };
              const isActive = statusFilter === status;
              return (
                <Button
                  key={status}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`h-7 px-3 text-[11px] font-bold ${
                    isActive
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {statusLabels[status] || status}
                </Button>
              );
            })}
          </div>

          {/* Type buttons */}
          <div className="flex items-center gap-1.5 rounded-lg border bg-muted/20 p-1">
            {["all", "Monthly", "Yearly", "Lifetime", "Trial"].map((type) => {
              const typeLabels: Record<string, string> = {
                all: t("common.all") || "All",
                Monthly: t("tenant.typeLabel.monthly") || "Monthly",
                Yearly: t("tenant.typeLabel.yearly") || "Yearly",
                Lifetime: t("tenant.typeLabel.lifetime") || "Lifetime",
                Trial: t("tenant.typeLabel.trial") || "Trial",
              };
              const isActive = typeFilter === type;
              return (
                <Button
                  key={type}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={`h-7 px-3 text-[11px] font-bold ${
                    isActive
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {typeLabels[type] || type}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="w-[50px] text-start text-xs font-bold uppercase tracking-wider">
                    #
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("common.tenant") || "Tenant"}
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("entSubscriptions.edition") || "Edition"}
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("common.status") || "Status"}
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("entSubscriptions.type") || "Type"}
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                    {t("entSubscriptions.amount") || "Amount"}
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("tenant.promoCode") || "Promo"}
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                    {t("entSubscriptions.mrrContribution") || "MRR (USD)"}
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("entSubscriptions.startDate") || "Start Date"}
                  </TableHead>
                  <TableHead className="text-start text-xs font-bold uppercase tracking-wider">
                    {t("entSubscriptions.endDate") || "End Date"}
                  </TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-28 text-center text-sm font-semibold text-muted-foreground/80"
                    >
                      {t("common.noResults") || "No subscriptions found"}
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
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                        onClick={() => router.push(`/tenants/${sub.tenantId}`)}
                      >
                        <TableCell className="text-start text-xs font-semibold tabular-nums text-muted-foreground/80">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-foreground/90">
                            {sub.tenantName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground/90">
                              {sub.editionName}
                            </span>
                            {sub.isDowngraded && (
                              <span className="text-[10px] font-bold text-amber-600">
                                {t("tenant.downgrade") || "Downgraded"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
                              STATUS_COLORS[sub.status] || ""
                            }`}
                          >
                            {t(`tenant.statusLabel.${sub.status.toLowerCase()}`) || sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
                              TYPE_COLORS[sub.type] || ""
                            }`}
                          >
                            {t(`tenant.typeLabel.${sub.type.toLowerCase()}`) || sub.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-extrabold tabular-nums text-foreground/90">
                          {formatDisplay(sub.totalAmount, sub.currency)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {sub.appliedPromoCode ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge
                                variant="outline"
                                className="w-fit border-emerald-200 bg-emerald-100 text-[10px] font-extrabold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                              >
                                🏷️ {sub.appliedPromoCode}
                              </Badge>
                              {sub.promotionDiscount != null && sub.promotionDiscount > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600">
                                  −{formatDisplay(sub.promotionDiscount, sub.currency)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums text-foreground/80">
                          {formatDisplay(mrr, "USD")}
                          <span className="text-[10px] text-muted-foreground/70">/mo</span>
                        </TableCell>
                        <TableCell className="text-start text-xs font-semibold tabular-nums text-muted-foreground">
                          {new Date(sub.startDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-start text-xs font-semibold tabular-nums text-muted-foreground">
                          {sub.endDate
                            ? new Date(sub.endDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "∞"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 transition-colors hover:bg-muted"
                            title={t("entSubscriptions.manage") || "Manage Subscriptions"}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/entitlements/subscriptions/${sub.tenantId}`);
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground/95">
        <span>
          {subscriptions.length} {t("common.of") || "of"} {totalCount}{" "}
          {t("common.total") || "total"}
        </span>
        <div className="flex items-center gap-4">
          {totalPromoDiscount > 0 && (
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <Tag className="h-3 w-3" />
              {t("dashboard.footer.promoDiscount") || "Promo discounts"}:{" "}
              {formatDisplay(totalPromoDiscount, "USD")}
            </span>
          )}
          <span>
            {t("entSubscriptions.totalMrr") || "Total MRR"}:{" "}
            <span className="text-foreground">{formatDisplay(totalMrr, "USD")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
