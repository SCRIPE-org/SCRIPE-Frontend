/**
 * ApiKeyActivityLog — Displays tabular log history and metrics for API key requests.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { SectionState } from "@core/ui/section-state";
import { RefreshCw } from "lucide-react";
import type { ApiKeyActivityEntry } from "../../domain/entities/ApiKeyActivity";
import { getStatusCodeGroup } from "../../domain/entities/ApiKeyActivity";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import { ApiKeyActivityFilterBar } from "./ApiKeyActivityFilterBar";
import { ApiKeyActivityPagination } from "./ApiKeyActivityPagination";

/**
 * Properties passed to the ApiKeyActivityLog component.
 */
export interface ApiKeyActivityLogProps {
  /** Paginated activity log entries and total record count */
  activity: { items: ApiKeyActivityEntry[]; totalCount: number } | undefined;
  /** Whether activity items are currently loading */
  isLoading: boolean;
  /** Active page index (1-indexed) */
  page: number;
  /** Maximum records displayed per page */
  pageSize: number;
  /** Selected column sorting identifier */
  sortBy: string | undefined;
  /** Whether sort order is descending */
  sortDesc: boolean;
  /** Callback fired when user selects a different page */
  onPageChange: (page: number) => void;
  /** Callback fired when filter criteria changes */
  onFilterChange: (filters: { endpoint?: string; method?: string; statusCode?: number }) => void;
  /** Callback fired when sorting column or direction changes */
  onSortChange: (sortBy: string, sortDesc: boolean) => void;
  /** Callback fired to reload log data */
  onRefresh: () => void;
}

/**
 * Map connecting HTTP response status groups to theme Badge variants.
 */
const STATUS_BADGE_VARIANT: Record<ReturnType<typeof getStatusCodeGroup>, BadgeProps["variant"]> = {
  "2xx": "success",
  "3xx": "warning",
  "4xx": "pending",
  "5xx": "destructive",
  other: "destructive",
};

/**
 * Renders the full API key activity log interface with filter controls, data table, and pagination.
 *
 * @param props Component properties.
 * @returns JSX card element containing the activity log table.
 */
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
  const { t } = useI18n();

  const totalCount = activity?.totalCount ?? 0;
  const items = activity?.items ?? [];

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
        <ApiKeyActivityFilterBar isLoading={isLoading} onFilterChange={onFilterChange} />

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
        <ApiKeyActivityPagination
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
