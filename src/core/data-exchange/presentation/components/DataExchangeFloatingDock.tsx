"use client";

import React from "react";
import {
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeFloatingDockViewModel } from "../viewmodels/useDataExchangeFloatingDockViewModel";
import { FloatingDockJobItem } from "./FloatingDockJobItem";

/**
 * Floating task dock displaying real-time Data Exchange background imports,
 * exports, and multi-sheet migrations with Sileo morphing status transitions.
 */
export function DataExchangeFloatingDock() {
  const { t } = useI18n();
  const vm = useDataExchangeFloatingDockViewModel();

  if (!vm.isVisible) {
    return null;
  }

  return (
    <aside
      aria-label={t("dataExchange.dock.title")}
      dir={vm.direction}
      className="fixed bottom-4 end-4 z-40 w-96 max-w-[calc(100vw-2rem)] select-none"
    >
      <Card className="border border-nx-line bg-nx-surface text-nx-ink">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-nx-line">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-nx-accent" />
            <CardTitle className="text-xs font-semibold text-nx-ink">
              {t("dataExchange.dock.title")}
            </CardTitle>
            {vm.activeCount > 0 && (
              <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
                {t("dataExchange.dock.activeCount", { count: vm.activeCount })}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {vm.hasFinishedJobs && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-nx-ink-2 hover:text-nx-ink"
                onClick={vm.clearFinished}
                title={t("dataExchange.dock.clearCompleted")}
                aria-label={t("dataExchange.dock.clearCompleted")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
              onClick={vm.toggleCollapsed}
              aria-expanded={!vm.isCollapsed}
              aria-label={
                vm.isCollapsed ? t("dataExchange.dock.expand") : t("dataExchange.dock.collapse")
              }
              title={
                vm.isCollapsed ? t("dataExchange.dock.expand") : t("dataExchange.dock.collapse")
              }
            >
              {vm.isCollapsed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {!vm.isCollapsed && (
          <CardContent className="p-3 max-h-80 overflow-y-auto overscroll-contain space-y-3">
            {vm.jobs.map((job) => (
              <FloatingDockJobItem
                key={job.id}
                job={job}
                isCancelling={vm.cancellingJobIds[job.id] || false}
                onCancelJob={vm.handleCancelJob}
                onDownload={vm.handleDownload}
                onDismiss={vm.dismissJob}
              />
            ))}
          </CardContent>
        )}
      </Card>
    </aside>
  );
}
