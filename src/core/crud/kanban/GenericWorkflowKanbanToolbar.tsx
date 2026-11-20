"use client";

import React from "react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { AlertCircle, SlidersHorizontal, X } from "lucide-react";
import { useCrudI18n } from "../hooks/useCrudI18n";
import type { CardDensity } from "./types";

interface GenericWorkflowKanbanToolbarProps {
  stageCount: number;
  itemCount: number;
  currentDensity: CardDensity;
  onDensityChange: (density: CardDensity) => void;
  activeError: string | null;
  onDismissError: () => void;
}

/** Displays validation alerts alongside board counts and card density controls. */
export function GenericWorkflowKanbanToolbar({
  stageCount,
  itemCount,
  currentDensity,
  onDensityChange,
  activeError,
  onDismissError,
}: GenericWorkflowKanbanToolbarProps) {
  const { t } = useCrudI18n();

  return (
    <>
      {activeError && (
        <Alert variant="destructive" className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <AlertDescription className="text-sm font-medium">{activeError}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-nx-danger/20"
            onClick={onDismissError}
            aria-label={t("crud.kanban.dismissError", { defaultValue: "Dismiss error" })}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-nx-ink-3 px-1 select-none">
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {stageCount}{" "}
            {stageCount === 1
              ? t("crud.kanban.stage", { defaultValue: "Stage" })
              : t("crud.kanban.stages", { defaultValue: "Stages" })}
          </span>
          <span aria-hidden="true">•</span>
          <span className="tabular-nums">
            {itemCount}{" "}
            {itemCount === 1
              ? t("crud.kanban.card", { defaultValue: "Card" })
              : t("crud.kanban.cards", { defaultValue: "Cards" })}
          </span>
        </div>

        <fieldset
          className="m-0 min-w-0 flex items-center gap-1 border-0 p-0"
          aria-label={t("crud.kanban.density", { defaultValue: "Density" })}
        >
          <SlidersHorizontal className="size-3.5 text-nx-ink-3" aria-hidden="true" />
          <span className="text-[11px] font-medium text-nx-ink-3 me-0.5">
            {t("crud.kanban.density", { defaultValue: "Density:" })}
          </span>
          {(["compact", "standard", "comfortable"] as CardDensity[]).map((d) => (
            <Button
              key={d}
              type="button"
              variant={currentDensity === d ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={currentDensity === d}
              className={cn(
                "h-8 px-2.5 text-[11px] capitalize",
                currentDensity === d && "font-semibold text-nx-ink border border-nx-line"
              )}
              onClick={() => onDensityChange(d)}
            >
              {t(`crud.kanban.density_${d}`, { defaultValue: d })}
            </Button>
          ))}
        </fieldset>
      </div>
    </>
  );
}
