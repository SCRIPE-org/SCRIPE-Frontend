"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import type { VisibleSectionsState } from "../../viewmodels/usePlatformCommandCenterViewModel";

interface PlatformCustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visibleSections: VisibleSectionsState;
  onToggleSection: (key: keyof VisibleSectionsState) => void;
  onReset: () => void;
}

export function PlatformCustomizeDrawer({
  isOpen,
  onClose,
  visibleSections,
  onToggleSection,
  onReset,
}: PlatformCustomizeDrawerProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const sections: Array<{
    key: keyof VisibleSectionsState;
    label: string;
  }> = [
    {
      key: "activity",
      label:
        t("platformCommandCenter.customizeDrawer.sections.activity") || "Global activity & health",
    },
    {
      key: "attention",
      label: t("platformCommandCenter.customizeDrawer.sections.attention") || "Needs attention",
    },
    {
      key: "serviceHealth",
      label: t("platformCommandCenter.customizeDrawer.sections.serviceHealth") || "Service health",
    },
    {
      key: "recommendedActions",
      label:
        t("platformCommandCenter.customizeDrawer.sections.recommendedActions") ||
        "Recommended actions",
    },
    {
      key: "operationalActivity",
      label:
        t("platformCommandCenter.customizeDrawer.sections.operationalActivity") ||
        "Operational activity",
    },
  ];

  return (
    <>
      {/* Scrim / Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("platformCommandCenter.customizeDrawer.title") || "Customize dashboard"}
        className="fixed bottom-0 right-0 top-0 z-50 flex w-[350px] max-w-full flex-col justify-between border-l border-border bg-card p-6 shadow-2xl duration-200 animate-in slide-in-from-right"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">
                {t("platformCommandCenter.customizeDrawer.personalize") || "Personalize"}
              </span>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                {t("platformCommandCenter.customizeDrawer.title") || "Customize dashboard"}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {t("platformCommandCenter.customizeDrawer.description") ||
              "Curate your command center layout by toggling components on or off. Settings are saved locally."}
          </p>

          {/* Toggles */}
          <div className="mt-6 divide-y divide-border/80 border-y border-border/80">
            {sections.map((sec) => {
              const isOn = visibleSections[sec.key];
              return (
                <div key={sec.key} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-foreground">{sec.label}</span>
                  <Switch
                    checked={isOn}
                    onCheckedChange={() => onToggleSection(sec.key)}
                    aria-label={sec.label}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={onReset}
          className="h-9 w-full gap-2 border-border text-xs font-semibold text-foreground hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            {t("platformCommandCenter.customizeDrawer.reset") || "Reset to canonical layout"}
          </span>
        </Button>
      </div>
    </>
  );
}
