"use client";

import { Sparkles, X } from "lucide-react";
import { Button } from "@core/ui/button";

export function CrmSmartTipRibbon({
  t,
  activeTab = "settings",
  onOpenGuide,
  onDismiss,
}: {
  t: (key: string) => string;
  activeTab?: string;
  onOpenGuide: () => void;
  onDismiss: () => void;
}) {
  const tipKey =
    activeTab === "overview"
      ? "crm.toolbar.tipOverview"
      : activeTab === "pipelines"
        ? "crm.toolbar.tipPipelines"
        : activeTab === "deals"
          ? "crm.toolbar.tipDeals"
          : "crm.toolbar.tipSettings";

  return (
    <div
      className="rounded-nx-md border border-nx-line bg-nx-surface px-3 py-1.5 flex items-center justify-between gap-2 text-xs"
      data-testid="crm-smart-tip-ribbon"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="size-3.5 text-nx-accent shrink-0" />
        <span className="text-nx-ink-2 truncate">{t(tipKey)}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] text-nx-accent"
          onClick={onOpenGuide}
        >
          {t("crm.toolbar.interactiveTourBtn")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-nx-ink-3"
          onClick={onDismiss}
        >
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}
