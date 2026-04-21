/**
 * ConnectAccountsTable
 * Paginated table of all tenant Stripe Connect accounts.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import {
  ExternalLink,
  Eye,
  RefreshCw,
  LayoutDashboard,
  Percent,
  Search,
  Plus,
} from "lucide-react";
import type { ConnectAccountListItem } from "../../domain/entities/ConnectAccount";

interface ConnectAccountsTableProps {
  accounts: ConnectAccountListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search: string;
  isLoading: boolean;
  t: (key: string) => string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onViewDetail: (account: ConnectAccountListItem) => void;
  onRefreshLink: (tenantId: string) => void;
  onOpenDashboard: (tenantId: string) => void;
  onOpenRateDialog: (account: ConnectAccountListItem) => void;
  onCreateAccount: () => void;
  isRefreshing: boolean;
  isOpeningDashboard: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  Complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Restricted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ConnectAccountsTable({
  accounts,
  totalCount,
  page,
  pageSize,
  totalPages,
  search,
  isLoading,
  t,
  onSearchChange,
  onPageChange,
  onViewDetail,
  onRefreshLink,
  onOpenDashboard,
  onOpenRateDialog,
  onCreateAccount,
  isRefreshing,
  isOpeningDashboard,
}: ConnectAccountsTableProps) {
  const formatPercent = (rate: number | undefined) =>
    rate != null ? `${(rate * 100).toFixed(2)}%` : "—";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="connect-search"
            placeholder={t("common.search") || "Search..."}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button id="connect-create-btn" onClick={onCreateAccount} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("entitlements.stripeConnect.createAccount")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("entitlements.stripeConnect.columns.tenant")}</TableHead>
              <TableHead>{t("entitlements.stripeConnect.columns.status")}</TableHead>
              <TableHead>{t("entitlements.stripeConnect.columns.charges")}</TableHead>
              <TableHead>{t("entitlements.stripeConnect.columns.payouts")}</TableHead>
              <TableHead>{t("entitlements.stripeConnect.columns.rate")}</TableHead>
              <TableHead>{t("entitlements.stripeConnect.columns.totalAmount")}</TableHead>
              <TableHead className="text-right">
                {t("entitlements.stripeConnect.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t("common.loading") || "Loading..."}
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t("entitlements.stripeConnect.noAccounts")}
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs max-w-[140px] truncate">
                    {account.tenantId}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[account.onboardingStatus] ?? ""}>
                      {t(`entitlements.stripeConnect.status.${account.onboardingStatus}`) ||
                        account.onboardingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.chargesEnabled ? (
                      <span className="text-emerald-600 text-sm">✅</span>
                    ) : (
                      <span className="text-red-500 text-sm">❌</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.payoutsEnabled ? (
                      <span className="text-emerald-600 text-sm">✅</span>
                    ) : (
                      <span className="text-red-500 text-sm">❌</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {formatPercent(account.effectiveCommissionRate)}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {account.totalPayoutsAmount != null
                      ? `$${account.totalPayoutsAmount.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        id={`view-${account.id}`}
                        variant="ghost"
                        size="icon"
                        title={t("common.view") || "View"}
                        onClick={() => onViewDetail(account)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {account.onboardingStatus === "Complete" ? (
                        <Button
                          id={`dashboard-${account.id}`}
                          variant="ghost"
                          size="icon"
                          title={t("entitlements.stripeConnect.viewDashboard")}
                          onClick={() => onOpenDashboard(account.tenantId)}
                          disabled={isOpeningDashboard}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          id={`refresh-${account.id}`}
                          variant="ghost"
                          size="icon"
                          title={t("entitlements.stripeConnect.refreshLink")}
                          onClick={() => onRefreshLink(account.tenantId)}
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                      <Button
                        id={`rate-${account.id}`}
                        variant="ghost"
                        size="icon"
                        title={t("entitlements.stripeConnect.commissionRateOverride")}
                        onClick={() => onOpenRateDialog(account)}
                      >
                        <Percent className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {totalCount} {t("common.results") || "results"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              {t("common.previous") || "Previous"}
            </Button>
            <span>
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              {t("common.next") || "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
