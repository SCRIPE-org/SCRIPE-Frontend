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
    <Card className="border-border/80 bg-card/80 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                {t("tenantAnalytics.table.title") || "Tenants"}
              </CardTitle>
              <Badge variant="outline" className="text-xs px-2 py-0.5 font-semibold">
                {totalCount} {t("tenantAnalytics.table.total") || "Total"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {t("tenantAnalytics.table.subtitle") ||
                "Detailed view of tenants with key metrics, current tier and operational status."}
            </CardDescription>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("tenantAnalytics.table.searchPlaceholder") || "Search by name, domain, ID..."}
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setPage(1);
              }}
              className="h-8.5 pl-8 rtl:pl-3 rtl:pr-8 text-xs bg-background/80 border-border"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-12 text-center">
            <Building className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              {t("tenantAnalytics.table.noTenantsFound") || "No tenants found"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("tenantAnalytics.table.noTenantsMatchFilters") ||
                "There are no tenants matching your search or active filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="border-y border-border/80 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.tenant") || "Tenant"}</th>
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.domain") || "Domain / Identifier"}</th>
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.edition") || "Edition"}</th>
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.region") || "Region"}</th>
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.status") || "Status"}</th>
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.hierarchy") || "Hierarchy"}</th>
                  <th className="py-3 px-4">{t("tenantAnalytics.table.columns.created") || "Created"}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t("tenantAnalytics.table.columns.actions") || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tenants.map((tenant) => {
                  const initial = tenant.name ? tenant.name.substring(0, 2).toUpperCase() : "TE";
                  const isSuspended = tenant.isSuspended;
                  const status = isSuspended
                    ? "Suspended"
                    : tenant.subscriptionStatus ?? (tenant.isActive ? "Active" : "Inactive");

                  const formattedDate = tenant.createdAt
                    ? new Date(tenant.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-muted/15 transition-colors group"
                    >
                      {/* Tenant Name + Initials */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 font-bold text-[11px] text-primary">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                              {tenant.name}
                            </p>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {tenant.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Domain / Code */}
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {tenant.primaryDomain || `${tenant.code.toLowerCase()}.scripe.io`}
                      </td>

                      {/* Edition Badge */}
                      <td className="py-3 px-4">
                        {tenant.editionName ? (
                          <Badge
                            variant="secondary"
                            className="text-[11px] capitalize font-medium border-border/80 bg-background/80"
                          >
                            {tenant.editionName.replace("-", " ")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* Region */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                          <span className="flex h-4.5 w-6 items-center justify-center rounded-xs bg-muted/40 font-mono text-[9px] font-bold text-muted-foreground">
                            {tenant.countryCode || "GL"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {tenant.countryCode ? tenant.countryCode.toUpperCase() : "Global"}
                          </span>
                        </span>
                      </td>

                      {/* Status with Semantic Dot */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : status === "Trial"
                              ? "bg-info/10 text-info"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status === "Active"
                                ? "bg-emerald-500"
                                : status === "Trial"
                                ? "bg-info"
                                : "bg-amber-500"
                            }`}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Hierarchy Level */}
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium border-border/70"
                        >
                          {tenant.hierarchyLevel === 0 ? "Root Org" : "Child Unit"}
                        </Badge>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right rtl:text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/tenants`}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <span>{t("tenantAnalytics.table.actions.viewTenant") || "View Tenant"}</span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/audit`}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <span>{t("tenantAnalytics.table.actions.viewAudit") || "View Audit Logs"}</span>
                                <ShieldAlert className="h-3 w-3 text-muted-foreground" />
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
          <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 text-xs text-muted-foreground">
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
