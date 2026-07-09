"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@core/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@core/ui/select";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import type { ApiKeyActivityEntry } from "../../domain/entities/ApiKeyActivity";
import { getStatusCodeColor } from "../../domain/entities/ApiKeyActivity";
import { useI18n } from "@core/providers/i18n-provider";
import { format } from "date-fns";

interface ApiKeyActivityLogProps {
  activity: { items: ApiKeyActivityEntry[]; totalCount: number } | undefined;
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { endpoint?: string; method?: string; statusCode?: number }) => void;
  onRefresh: () => void;
}

export function ApiKeyActivityLog({
  activity,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onFilterChange,
  onRefresh,
}: ApiKeyActivityLogProps) {
  const { t } = useI18n();

  const [endpointInput, setEndpointInput] = useState("");
  const [method, setMethod] = useState("all");
  const [statusInput, setStatusInput] = useState("");

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

  return (
    <Card className="flex flex-col overflow-hidden min-h-[220px]">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle className="text-sm font-semibold">
          {t("apikeys.activity.title") || "Real-time Access Logs"}
        </CardTitle>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 p-4 border-b bg-muted/10 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("apikeys.activity.searchPlaceholder") || "Filter by endpoint..."}
              className="pl-9 h-9"
              value={endpointInput}
              onChange={e => setEndpointInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleApplyFilters()}
            />
          </div>

          <div className="w-[120px]">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ANY Method</SelectItem>
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
              placeholder={t("apikeys.activity.statusPlaceholder") || "Status Code"}
              className="h-9"
              value={statusInput}
              onChange={e => setStatusInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleApplyFilters()}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleApplyFilters} disabled={isLoading}>
              {t("common.filter") || "Filter"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClearFilters} disabled={isLoading}>
              {t("common.clear") || "Clear"}
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto min-h-[120px] max-h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[80px]">{t("apikeys.activity.method") || "Method"}</TableHead>
                <TableHead>{t("apikeys.activity.endpoint") || "Endpoint"}</TableHead>
                <TableHead className="w-[100px]">{t("apikeys.activity.status") || "Status"}</TableHead>
                <TableHead className="w-[100px] text-right">{t("apikeys.activity.duration") || "Latency"}</TableHead>
                <TableHead className="w-[150px]">{t("apikeys.activity.ip") || "IP Address"}</TableHead>
                <TableHead className="w-[180px]">{t("apikeys.activity.time") || "Time (UTC)"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    {t("apikeys.activity.noLogs") || "No requests logged for this key yet"}
                  </TableCell>
                </TableRow>
              ) : (
                items.map(log => (
                  <TableRow key={log.id} className="font-mono text-xs">
                    <TableCell className="font-bold">{log.method}</TableCell>
                    <TableCell className="truncate max-w-md select-all" title={log.endpoint}>{log.endpoint}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded font-bold ${getStatusCodeColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{log.responseTimeMs} ms</TableCell>
                    <TableCell className="truncate select-all">{log.ipAddress || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(log.requestedAt), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/10 mt-auto">
          <p className="text-xs text-muted-foreground">
            {t("apikeys.activity.showing") || "Total records"}: <span className="font-semibold text-foreground">{totalCount}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium font-mono">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
