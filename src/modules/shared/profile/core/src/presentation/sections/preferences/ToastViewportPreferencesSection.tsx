"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Bell, Play } from "lucide-react";

/**
 * Supported logical toast viewport positions.
 */
export type LogicalToastPosition = "top-end" | "top-center" | "bottom-end" | "bottom-center";

/**
 * Props for ToastViewportPreferencesSection.
 */
export interface ToastViewportPreferencesSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  currentLogicalPosition: LogicalToastPosition;
  onSelectPosition: (position: LogicalToastPosition) => void;
  onTriggerTestToast: () => void;
}

const POSITION_OPTIONS: Array<{
  id: LogicalToastPosition;
  labelKey: string;
  subKey: string;
}> = [
  {
    id: "top-end",
    labelKey: "profile.preferences.toastPositionTopEnd",
    subKey: "profile.preferences.toastPositionTopEndSub",
  },
  {
    id: "top-center",
    labelKey: "profile.preferences.toastPositionTopCenter",
    subKey: "profile.preferences.toastPositionTopCenterSub",
  },
  {
    id: "bottom-end",
    labelKey: "profile.preferences.toastPositionBottomEnd",
    subKey: "profile.preferences.toastPositionBottomEndSub",
  },
  {
    id: "bottom-center",
    labelKey: "profile.preferences.toastPositionBottomCenter",
    subKey: "profile.preferences.toastPositionBottomCenterSub",
  },
];

/**
 * Toast viewport anchor and live RTL-aware preview trigger card.
 */
export function ToastViewportPreferencesSection({
  t,
  isRtl,
  currentLogicalPosition,
  onSelectPosition,
  onTriggerTestToast,
}: ToastViewportPreferencesSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-nx-accent shrink-0" />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.preferences.toastPositionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.preferences.toastPositionDesc")}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            data-testid="toast-mirror-badge"
            className="text-[11px] font-medium border-nx-line bg-nx-raised text-nx-ink-2 self-start sm:self-auto max-w-full whitespace-normal text-start"
          >
            {isRtl
              ? t("profile.preferences.toastMirrorBadgeRtl")
              : t("profile.preferences.toastMirrorBadgeLtr")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 min-w-0">
        <div className="p-3 rounded-lg border border-nx-line bg-nx-ground/60 space-y-3 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
            {POSITION_OPTIONS.map((pos) => {
              const isSelected = currentLogicalPosition === pos.id;
              return (
                <Button
                  key={pos.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectPosition(pos.id)}
                  data-testid={`toast-position-${pos.id}`}
                  className={`min-h-14 h-auto py-2 px-2.5 min-w-0 whitespace-normal text-center flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                    isSelected
                      ? "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill font-bold"
                      : "bg-nx-surface hover:bg-nx-hover text-nx-ink"
                  }`}
                >
                  <span>{t(pos.labelKey)}</span>
                  <span
                    className={`text-[10px] truncate max-w-full px-1 ${
                      isSelected ? "text-nx-on-fill opacity-90 font-medium" : "text-nx-ink-3"
                    }`}
                  >
                    {t(pos.subKey)}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-xs text-nx-ink-3">{t("profile.preferences.triggerSmartTestDesc")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTriggerTestToast}
            data-testid="trigger-smart-test-toast-btn"
            className="gap-1.5 text-xs font-semibold border-nx-line-hi bg-nx-raised hover:bg-nx-hover shrink-0 self-start sm:self-auto"
          >
            <Play className="h-3.5 w-3.5 text-nx-accent" />
            <span>{t("profile.preferences.triggerSmartTest")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
