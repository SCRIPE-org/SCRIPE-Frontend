// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import React from "react";
import Link from "next/link";
import {
  Building,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantAnalyticsListItem } from "../../domain/entities/AnalyticsEntities";

interface TenantTableSectionProps {
  tenants: TenantAnalyticsListItem[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  isLoading: boolean;
}

/**
 * TenantTableSection
 */
export function TenantTableSection({
  tenants,
  totalCount,
  searchQuery,
  onSearchChange,
  page,
  setPage,
  totalPages,
  isLoading,
}: TenantTableSectionProps) {
  const { t } = useI18n();

  return (
    <Card className="border-nx-line bg-nx-surface text-nx-ink">
      <CardHeader className="p-4 pb-3 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("tenantAnalytics.table.title") || "Tenants"}
              </CardTitle>
              <Badge variant="outline" className="border-nx-line px-2 py-0.5 text-xs font-semibold text-nx-ink-2">
                {totalCount} {t("tenantAnalytics.table.total") || "Total"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("tenantAnalytics.table.subtitle") ||
                "Detailed view of tenants with key metrics, current tier and operational status."}
            </CardDescription>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nx-ink-3 rtl:left-auto rtl:right-2.5" />
            <Input
              type="text"
              placeholder={
                t("tenantAnalytics.table.searchPlaceholder") || "Search by name, domain, ID..."
              }
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setPage(1);
              }}
              className="h-8.5 border-nx-line bg-nx-surface text-xs text-nx-ink rtl:pl-3 rtl:pr-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-nx-raised" />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-12 text-center">
            <Building className="mx-auto mb-2 h-8 w-8 text-nx-ink-3/50" />
            <p className="text-sm font-semibold text-nx-ink">
              {t("tenantAnalytics.table.noTenantsFound") || "No tenants found"}
            </p>
            <p className="mt-1 text-xs text-nx-ink-3">
              {t("tenantAnalytics.table.noTenantsMatchFilters") ||
                "There are no tenants matching your search or active filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs rtl:text-right">
              <thead>
                <tr className="border-y border-nx-line bg-nx-raised/40 font-semibold text-nx-ink-3">
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.tenant") || "Tenant"}
                  </th>
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.domain") || "Domain / Identifier"}
                  </th>
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.edition") || "Edition"}
                  </th>
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.region") || "Region"}
                  </th>
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.status") || "Status"}
                  </th>
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.hierarchy") || "Hierarchy"}
                  </th>
                  <th className="px-4 py-3">
                    {t("tenantAnalytics.table.columns.created") || "Created"}
                  </th>
                  <th className="px-4 py-3 text-right rtl:text-left">
                    {t("tenantAnalytics.table.columns.actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-line">
                {tenants.map((tenant) => {
                  const initial = tenant.name ? tenant.name.substring(0, 2).toUpperCase() : "TE";
                  const isSuspended = tenant.isSuspended;
                  const status = isSuspended
                    ? "Suspended"
                    : (tenant.subscriptionStatus ?? (tenant.isActive ? "Active" : "Inactive"));

                  const formattedDate = tenant.createdAt
                    ? new Date(tenant.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={tenant.id} className="group transition-colors hover:bg-nx-raised/30">
                      {/* Tenant Name + Initials */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[11px] font-bold text-primary">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[160px] truncate font-semibold text-nx-ink sm:max-w-[200px]">
                              {tenant.name}
                            </p>
                            <span className="font-mono text-[10px] text-nx-ink-3">
                              {tenant.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Domain / Code */}
                      <td className="px-4 py-3 font-mono text-nx-ink-3">
                        {tenant.primaryDomain || `${tenant.code.toLowerCase()}.scripe.io`}
                      </td>

                      {/* Edition Badge */}
                      <td className="px-4 py-3">
                        {tenant.editionName ? (
                          <Badge
                            variant="secondary"
                            className="border-nx-line bg-nx-raised text-[11px] font-medium capitalize text-nx-ink-2"
                          >
                            {tenant.editionName.replace("-", " ")}
                          </Badge>
                        ) : (
                          <span className="text-xs text-nx-ink-3">—</span>
                        )}
                      </td>

                      {/* Region */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-nx-ink">
                          <span className="rounded-xs flex h-4.5 w-6 items-center justify-center bg-nx-raised font-mono text-[9px] font-bold text-nx-ink-3">
                            {tenant.countryCode || "GL"}
                          </span>
                          <span className="text-[11px] text-nx-ink-3">
                            {tenant.countryCode ? tenant.countryCode.toUpperCase() : "Global"}
                          </span>
                        </span>
                      </td>

                      {/* Status with Semantic Dot */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            status === "Active"
                              ? "bg-success/10 text-success"
                              : status === "Trial"
                                ? "bg-info/10 text-info"
                                : "bg-warning/10 text-warning"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status === "Active"
                                ? "bg-success"
                                : status === "Trial"
                                  ? "bg-info"
                                  : "bg-warning"
                            }`}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Hierarchy Level */}
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="border-nx-line text-[10px] font-medium text-nx-ink-3"
                        >
                          {tenant.hierarchyLevel === 0 ? "Root Org" : "Child Unit"}
                        </Badge>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 font-mono text-[11px] text-nx-ink-3">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right rtl:text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 cursor-pointer text-nx-ink-3 hover:text-nx-ink"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/tenants`}
                                className="flex cursor-pointer items-center justify-between"
                              >
                                <span>
                                  {t("tenantAnalytics.table.actions.viewTenant") || "View Tenant"}
                                </span>
                                <ExternalLink className="h-3 w-3 text-nx-ink-3" />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/audit`}
                                className="flex cursor-pointer items-center justify-between"
                              >
                                <span>
                                  {t("tenantAnalytics.table.actions.viewAudit") ||
                                    "View Audit Logs"}
                                </span>
                                <ShieldAlert className="h-3 w-3 text-nx-ink-3" />
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-nx-line px-4 py-3 text-xs text-nx-ink-3">
            <div>
              {t("tenantAnalytics.table.pageOf", { page, totalPages }) ||
                `Page ${page} of ${totalPages}`}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page <= 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                <span>{t("common.previous") || "Previous"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                disabled={page >= totalPages}
                className="h-7 px-2 text-xs"
              >
                <span>{t("common.next") || "Next"}</span>
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
