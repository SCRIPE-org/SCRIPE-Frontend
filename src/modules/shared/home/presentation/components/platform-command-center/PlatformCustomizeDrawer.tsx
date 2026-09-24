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
        t("platformCommandCenter.customizeDrawer.sections.activity") ||
        "Global activity & health",
    },
    {
      key: "attention",
      label:
        t("platformCommandCenter.customizeDrawer.sections.attention") || "Needs attention",
    },
    {
      key: "serviceHealth",
      label:
        t("platformCommandCenter.customizeDrawer.sections.serviceHealth") || "Service health",
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
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("platformCommandCenter.customizeDrawer.title") || "Customize dashboard"}
        className="fixed right-0 top-0 bottom-0 w-[350px] max-w-full bg-card border-l border-border p-6 z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                {t("platformCommandCenter.customizeDrawer.personalize") || "Personalize"}
              </span>
              <h3 className="text-base font-bold text-foreground tracking-tight">
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

          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {t("platformCommandCenter.customizeDrawer.description") ||
              "Curate your command center layout by toggling components on or off. Settings are saved locally."}
          </p>

          {/* Toggles */}
          <div className="divide-y divide-border/80 mt-6 border-y border-border/80">
            {sections.map((sec) => {
              const isOn = visibleSections[sec.key];
              return (
                <div key={sec.key} className="py-3 flex items-center justify-between">
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
          className="w-full h-9 gap-2 text-xs font-semibold text-foreground border-border hover:bg-accent"
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
