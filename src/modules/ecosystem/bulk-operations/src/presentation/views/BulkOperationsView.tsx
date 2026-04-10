"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Progress } from "@core/ui/progress";
import { Layers, Upload, Download, RefreshCw, Loader2, XCircle } from "lucide-react";
import { useBulkOperationsViewModel } from "../viewmodels/useBulkOperationsViewModel";

export function BulkOperationsView() {
  useModuleLocales(() => import("../../../locales"), "bulk-operations");
  const { t } = useI18n();
  const vm = useBulkOperationsViewModel();

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed": return "success";
      case "Running": case "InProgress": return "default";
      case "Failed": return "destructive";
      case "Cancelled": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Layers className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("bulkOperations.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("bulkOperations.description")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={vm.fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.json"
            onChange={vm.handleFileSelected}
          />
          <Button variant="outline" size="sm" className="gap-2" onClick={vm.handleImport} disabled={vm.isImporting}>
            {vm.isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {t("bulkOperations.import") || "Import"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={vm.handleExport} disabled={vm.isExporting}>
            {vm.isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t("bulkOperations.export") || "Export"}
          </Button>
        </div>
      </div>

      {vm.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Layers className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("bulkOperations.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("bulkOperations.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t("bulkOperations.type") || "Type"}</TableHead>
                  <TableHead>{t("bulkOperations.status") || "Status"}</TableHead>
                  <TableHead>{t("bulkOperations.progress") || "Progress"}</TableHead>
                  <TableHead>{t("bulkOperations.records") || "Records"}</TableHead>
                  <TableHead>{t("bulkOperations.startedAt") || "Started"}</TableHead>
                  <TableHead className="text-right">{t("common.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((op: any, idx: number) => (
                  <TableRow key={op.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{op.type ?? op.operationType ?? "—"}</TableCell>
                    <TableCell><Badge variant={statusColor(op.status) as any}>{op.status}</Badge></TableCell>
                    <TableCell className="w-32">
                      <Progress value={op.progress ?? 0} className="h-2" />
                      <span className="text-xs text-muted-foreground">{op.progress ?? 0}%</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{op.totalRecords ?? op.recordCount ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{op.startedAt ?? op.createdAt ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {(op.status === "Running" || op.status === "InProgress" || op.status === "Pending") && (
                        <Button
                          variant="ghost" size="sm" className="gap-1 text-destructive"
                          disabled={vm.isCancelling && vm.cancellingId === op.id}
                          onClick={() => vm.handleCancel(op.id)}
                        >
                          {vm.isCancelling && vm.cancellingId === op.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {t("common.cancel") || "Cancel"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
