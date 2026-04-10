"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { BarChart3, Play, Download, RefreshCw, Loader2, Plus, FileBarChart } from "lucide-react";
import { useReportsViewModel } from "../viewmodels/useReportsViewModel";

export function ReportsView() {
  useModuleLocales(() => import("../../../locales"), "reports");
  const { t } = useI18n();
  const vm = useReportsViewModel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <BarChart3 className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("reports.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("reports.description")}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => vm.setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />{t("reports.create")}
        </Button>
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
              <FileBarChart className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("reports.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("reports.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t("reports.name") || "Name"}</TableHead>
                  <TableHead>{t("reports.source") || "Data Source"}</TableHead>
                  <TableHead>{t("reports.lastRun") || "Last Run"}</TableHead>
                  <TableHead>{t("reports.status") || "Status"}</TableHead>
                  <TableHead className="text-right">{t("common.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((rpt: any, idx: number) => (
                  <TableRow key={rpt.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{rpt.name}</TableCell>
                    <TableCell><Badge variant="outline">{rpt.dataSource ?? rpt.source ?? "—"}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rpt.lastRunAt ?? rpt.lastRun ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={rpt.status === "Completed" ? "success" : "secondary"}>
                        {rpt.status ?? "Ready"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm" className="gap-1"
                          disabled={vm.isRunning}
                          onClick={() => vm.handleRun(rpt.id)}
                        >
                          {vm.isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          {t("reports.run") || "Run"}
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="gap-1"
                          disabled={vm.isExporting}
                          onClick={() => vm.handleExport(rpt.id)}
                        >
                          {vm.isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          {t("reports.export") || "Export"}
                        </Button>
                      </div>
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
