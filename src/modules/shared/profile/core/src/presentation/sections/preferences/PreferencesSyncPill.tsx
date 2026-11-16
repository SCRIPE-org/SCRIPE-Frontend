"use client";

import { Badge } from "@core/ui/badge";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Props for PreferencesSyncPill.
 */
export interface PreferencesSyncPillProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  syncStatus: "idle" | "saving" | "saved" | "error";
  pendingCount: number;
}

/**
 * Continuous auto-save telemetry status pill showing queued, saving, saved, or error states.
 */
export function PreferencesSyncPill({
  t,
  syncStatus,
  pendingCount,
}: PreferencesSyncPillProps) {
  return (
    <div className="flex items-center gap-2 shrink-0" data-testid="preferences-sync-pill">
      {syncStatus === "saving" && (
        <Badge
          variant="outline"
          className="border-nx-accent/40 text-nx-ink bg-nx-accent-wash text-xs gap-1.5 py-1 px-2.5"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-nx-accent" />
          <span>
            {pendingCount > 1
              ? t("profile.preferences.pendingChangesCount", { count: String(pendingCount) })
              : t("profile.common.saving")}
          </span>
        </Badge>
      )}
      {syncStatus === "saved" && (
        <Badge
          variant="outline"
          className="border-success/30 text-success bg-success/10 text-xs gap-1.5 py-1 px-2.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{t("profile.common.saved")}</span>
        </Badge>
      )}
      {syncStatus === "error" && (
        <Badge
          variant="outline"
          className="border-destructive/40 text-destructive bg-destructive/10 text-xs gap-1.5 py-1 px-2.5"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{t("profile.common.syncError")}</span>
        </Badge>
      )}
      {syncStatus === "idle" && (
        <Badge
          variant="outline"
          className="border-nx-line text-nx-ink-2 bg-nx-raised text-xs gap-1.5 py-1 px-2.5"
          title={t("profile.preferences.autoSaveHint")}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-nx-accent" />
          <span>{t("profile.common.syncIdle")}</span>
        </Badge>
      )}
    </div>
  );
}
