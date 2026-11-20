"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Separator } from "@core/ui/separator";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import { EXECUTIVE_INSIGHTS, FINANCIAL_KPIS } from "../mock-data/financial-scenario.data";

interface ExecutiveReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExecutiveReportPreviewDialog({
  open,
  onOpenChange,
}: ExecutiveReportPreviewDialogProps) {
  const { tc, language, direction } = useCopilotI18n();
  const isAr = language === "ar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={direction}
        className="max-h-[85dvh] max-w-2xl overflow-y-auto border-nx-line bg-nx-surface text-nx-ink"
        data-testid="executive-report-preview-dialog"
      >
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="text-[10px]">
              {tc("trigger.demoTag")}
            </Badge>
            <Badge variant="info" className="text-[10px]">
              {tc("header.previewBadge")}
            </Badge>
          </div>
          <DialogTitle className="mt-1 text-base font-semibold">
            {tc("financial.execModalTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-3">
            {tc("financial.execModalSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1 text-xs">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
              <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiRevenue")}</p>
              <p className="mt-1 font-bold tabular-nums text-nx-ink">
                {isAr ? FINANCIAL_KPIS.revenueFormattedAr : FINANCIAL_KPIS.revenueFormattedEn}
              </p>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
              <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiExpenses")}</p>
              <p className="mt-1 font-bold tabular-nums text-nx-ink">
                {isAr ? FINANCIAL_KPIS.expensesFormattedAr : FINANCIAL_KPIS.expensesFormattedEn}
              </p>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
              <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiSurplus")}</p>
              <p className="mt-1 font-bold tabular-nums text-success">
                {isAr ? FINANCIAL_KPIS.surplusFormattedAr : FINANCIAL_KPIS.surplusFormattedEn}
              </p>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
              <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiReceivables")}</p>
              <p className="mt-1 font-bold tabular-nums text-nx-warning-strong">
                {isAr
                  ? FINANCIAL_KPIS.receivablesFormattedAr
                  : FINANCIAL_KPIS.receivablesFormattedEn}
              </p>
            </div>
          </div>

          <Separator className="bg-nx-line" />

          <div className="space-y-2">
            <h4 className="font-semibold text-nx-ink">{tc("financial.insightsTitle")}</h4>
            <ul className="space-y-1.5 text-nx-ink-2">
              {EXECUTIVE_INSIGHTS.map((ins) => (
                <li key={ins.id} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      ins.tone === "success"
                        ? "bg-success"
                        : ins.tone === "warning"
                          ? "bg-warning"
                          : "bg-info"
                    )}
                  />
                  <span>
                    <strong className="text-nx-ink">{tc(ins.titleKey)}:</strong>{" "}
                    {tc(ins.summaryKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3 text-[11px] text-nx-ink-3">
            {tc("financial.execModalDisclaimer")}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="cursor-pointer gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tc("financial.printPreviewHint")}</span>
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer font-semibold"
          >
            {tc("academy.closeLabel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
