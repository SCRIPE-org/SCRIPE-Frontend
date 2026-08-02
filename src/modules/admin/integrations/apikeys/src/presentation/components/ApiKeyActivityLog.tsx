"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { SectionState } from "@core/ui/section-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { Search, ChevronsLeft, ChevronsRight, RefreshCw } from "lucide-react";
import type { ApiKeyActivityEntry } from "../../domain/entities/ApiKeyActivity";
import { getStatusCodeGroup } from "../../domain/entities/ApiKeyActivity";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";

interface ApiKeyActivityLogProps {
  activity: { items: ApiKeyActivityEntry[]; totalCount: number } | undefined;
  isLoading: boolean;
  page: number;
  pageSize: number;
  sortBy: string | undefined;
  sortDesc: boolean;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { endpoint?: string; method?: string; statusCode?: number }) => void;
  onSortChange: (sortBy: string, sortDesc: boolean) => void;
  onRefresh: () => void;
}

// The status-group → Badge-variant map. "pending" carries the fourth ramp
// step (warning-strong) that 4xx needs alongside plain 2xx/3xx/5xx.
const STATUS_BADGE_VARIANT: Record<ReturnType<typeof getStatusCodeGroup>, BadgeProps["variant"]> = {
  "2xx": "success",
  "3xx": "warning",
  "4xx": "pending",
  "5xx": "destructive",
  other: "destructive",
};

export function ApiKeyActivityLog({
  activity,
  isLoading,
  page,
  pageSize,
  sortBy,
  sortDesc,
  onPageChange,
  onFilterChange,
  onSortChange,
  onRefresh,
}: ApiKeyActivityLogProps) {
  const { t, direction } = useI18n();

  const [endpointInput, setEndpointInput] = useState("");
  const [method, setMethod] = useState("all");
  const [statusInput, setStatusInput] = useState("");
  const [jumpPageVal, setJumpPageVal] = useState(page.toString());

  useEffect(() => {
    setJumpPageVal(page.toString());
  }, [page]);

  const handleApplyFilters = () => {
    onFilterChange({
      endpoint: endpointInput || undefined,
      method: method === "all" ? undefined : method,
      statusCode: statusInput ? parseInt(statusInput) : undefined,
    });
  };

  const handleClearFilters = () => {
    setEndpointInput("");
    setMethod("all");
    setStatusInput("");
    onFilterChange({
      endpoint: undefined,
      method: undefined,
      statusCode: undefined,
    });
  };

  const totalCount = activity?.totalCount ?? 0;
  const items = activity?.items ?? [];
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const atFirstPage = page <= 1;
  const atLastPage = page >= totalPages;

  const handleJumpPageSubmit = () => {
    const parsed = parseInt(jumpPageVal);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      if (parsed !== page) {
        onPageChange(parsed);
      }
    } else {
      setJumpPageVal(page.toString());
    }
  };

  const sortableHeadProps = (field: string) => ({
    sortable: true as const,
    sortDirection: (sortBy === field ? (sortDesc ? "desc" : "asc") : null) as "asc" | "desc" | null,
    tabIndex: 0,
    onClick: () => onSortChange(field, sortBy === field ? !sortDesc : true),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSortChange(field, sortBy === field ? !sortDesc : true);
      }
    },
  });

  return (
    <Card className="flex min-h-[220px] flex-col overflow-hidden">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-nx-line pb-3">
        <CardTitle className="text-sm font-semibold">{t("apikeys.activity.title")}</CardTitle>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onRefresh}
          disabled={isLoading}
          loading={isLoading}
          aria-label={t("common.refresh")}
        >
          {!isLoading && <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-nx-line bg-nx-raised p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              placeholder={t("apikeys.activity.searchPlaceholder")}
              aria-label={t("apikeys.activity.searchPlaceholder")}
              className="h-9 ps-9"
              value={endpointInput}
              onChange={(e) => setEndpointInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            />
          </div>

          <div className="w-[120px]">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("apikeys.activity.methodPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("apikeys.activity.anyMethod")}</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[120px]">
            <Input
              type="number"
              placeholder={t("apikeys.activity.statusPlaceholder")}
              aria-label={t("apikeys.activity.statusPlaceholder")}
              className="h-9"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleApplyFilters} disabled={isLoading}>
              {t("common.filter")}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClearFilters} disabled={isLoading}>
              {t("common.clear")}
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="max-h-[400px] min-h-[120px] flex-1 overflow-auto">
          <SectionState
            isLoading={isLoading}
            isEmpty={items.length === 0}
            emptyMessage={t("apikeys.activity.noLogs")}
            skeletonType="rows"
            skeletonRows={5}
          >
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead className="w-[100px]" {...sortableHeadProps("method")}>
                    {t("apikeys.activity.method")}
                  </TableHead>
                  <TableHead {...sortableHeadProps("endpoint")}>
                    {t("apikeys.activity.endpoint")}
                  </TableHead>
                  <TableHead className="w-[120px]" {...sortableHeadProps("status")}>
                    {t("apikeys.activity.status")}
                  </TableHead>
                  <TableHead
                    className="w-[120px]"
                    variant="numeric"
                    {...sortableHeadProps("latency")}
                  >
                    {t("apikeys.activity.duration")}
                  </TableHead>
                  <TableHead className="w-[150px]">{t("apikeys.activity.ip")}</TableHead>
                  <TableHead className="w-[180px]" {...sortableHeadProps("time")}>
                    {t("apikeys.activity.time")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((log) => (
                  <TableRow key={log.id} className="font-mono text-xs">
                    <TableCell className="font-bold">{log.method}</TableCell>
                    <TableCell className="max-w-md select-all truncate" title={log.endpoint}>
                      {log.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[getStatusCodeGroup(log.statusCode)]}>
                        {log.statusCode}
                      </Badge>
                    </TableCell>
                    <TableCell variant="numeric">{log.responseTimeMs} ms</TableCell>
                    <TableCell className="select-all truncate">{log.ipAddress || "—"}</TableCell>
                    <TableCell className="text-nx-ink-2">
                      {formatDateTimeUtc(log.requestedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionState>
        </div>

        {/* Pagination Bar */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-nx-line bg-nx-raised p-4">
          <p className="text-xs text-nx-ink-2">
            {t("apikeys.activity.showing")}:{" "}
            <span className="font-semibold text-nx-ink">{totalCount}</span>
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label={t("table.firstPage")}
                  aria-disabled={atFirstPage || isLoading || undefined}
                  tabIndex={atFirstPage ? -1 : undefined}
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                >
                  {direction === "rtl" ? (
                    <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                  )}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={atFirstPage || isLoading || undefined}
                  tabIndex={atFirstPage ? -1 : undefined}
                  className="h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page - 1);
                  }}
                />
              </PaginationItem>

              <PaginationItem className="mx-1 flex items-center gap-1.5 border-s border-nx-line ps-3 text-xs font-medium text-nx-ink-2">
                <span className="whitespace-nowrap">{t("common.page")}</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  aria-label={t("table.goToPage")}
                  className="h-8 w-12 p-1 text-center font-mono text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  value={jumpPageVal}
                  onChange={(e) => setJumpPageVal(e.target.value)}
                  onBlur={handleJumpPageSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleJumpPageSubmit()}
                  disabled={isLoading}
                />
                <span className="whitespace-nowrap">/ {totalPages}</span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={atLastPage || isLoading || undefined}
                  tabIndex={atLastPage ? -1 : undefined}
                  className="h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page + 1);
                  }}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label={t("table.lastPage")}
                  aria-disabled={atLastPage || isLoading || undefined}
                  tabIndex={atLastPage ? -1 : undefined}
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(totalPages);
                  }}
                >
                  {direction === "rtl" ? (
                    <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
