"use client";

import React from "react";
import { ArrowLeft, ArrowRight, FileSpreadsheet, Layers, X } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { StudioStep } from "../../viewmodels/useDataExchangeStudioViewModel";

export interface StudioHeaderProps {
  entityKey: string;
  entityLabel: string;
  isMultiSheet: boolean;
  step: StudioStep;
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
}

/**
 * Top elevated studio header displaying entity badge, multi-sheet indicator,
 * directional step back trigger, and top-right close action.
 */
export function StudioHeader({
  entityKey,
  entityLabel,
  isMultiSheet,
  step,
  canGoBack,
  onBack,
  onClose,
}: StudioHeaderProps) {
  const { direction, t } = useI18n();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-nx-line bg-nx-surface px-6 py-3.5 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-nx-control border border-nx-line bg-nx-raised text-nx-accent shrink-0">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-nx-ink">
              {t("dataExchange.title")}
            </h2>
            <Badge variant="default" className="text-xs">
              {entityLabel}
            </Badge>
            <Badge
              variant="outline"
              dir="ltr"
              className="font-mono text-[10px] text-nx-ink-3"
            >
              {entityKey}
            </Badge>
            {isMultiSheet && (
              <Badge variant="info" className="text-xs">
                <Layers className="me-1 h-3 w-3" />
                {t("dataExchange.upload.multiSheetBadge")}
              </Badge>
            )}
          </div>
          <p className="text-xs text-nx-ink-2 mt-0.5">
            {t("dataExchange.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canGoBack && step !== "upload" && step !== "results" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            data-testid="studio-back-btn"
            className="h-8 gap-1.5 text-xs border-nx-line"
          >
            <BackIcon className="h-3.5 w-3.5" />
            <span>{t("dataExchange.actions.back")}</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label={t("dataExchange.actions.close")}
          data-testid="studio-close-btn"
          className="h-8 w-8 p-0 text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised rounded-nx-control"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
