"use client";

import React from "react";
import {
  Archive,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldVersionSummary } from "../../domain/entities/FieldInsight";

export interface FieldVersionTimelineProps {
  sortedVersions: readonly FieldVersionSummary[];
  isLoading: boolean;
  formatDate: (dateStr?: string | null) => string;
}

export function FieldVersionTimeline({
  sortedVersions,
  isLoading,
  formatDate,
}: FieldVersionTimelineProps): React.ReactElement {
  const { t } = useI18n();

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "published":
        return (
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t("customField.versions.statusPublished", { defaultValue: "Published" })}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 gap-1">
            <Clock className="h-3 w-3" />
            {t("customField.versions.statusDraft", { defaultValue: "Draft" })}
          </Badge>
        );
      case "deprecated":
        return (
          <Badge variant="outline" className="text-muted-foreground border-border gap-1">
            <Archive className="h-3 w-3" />
            {t("customField.versions.statusDeprecated", { defaultValue: "Deprecated" })}
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-muted-foreground/60 border-dashed gap-1">
            {t("customField.versions.statusArchived", { defaultValue: "Archived" })}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5" />
        {t("customField.versions.timelineTitle", {
          defaultValue: "Version Timeline",
        })}
      </h3>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          {t("common.loading", { defaultValue: "Loading versions..." })}
        </div>
      ) : sortedVersions.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
          {t("customField.versions.empty", {
            defaultValue: "No versions recorded for this field definition.",
          })}
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {sortedVersions.map((version) => {
            const isDraft = version.status.toLowerCase() === "draft";
            const isLive = version.status.toLowerCase() === "published";

            return (
              <div
                key={version.id}
                className="relative group rounded-lg border bg-card p-3.5 space-y-2 hover:border-primary/40 transition-colors"
              >
                {/* Timeline Node Icon */}
                <div
                  className={`absolute -left-[27px] top-3.5 h-3.5 w-3.5 rounded-full border-2 bg-background ${
                    isLive
                      ? "border-emerald-500 bg-emerald-500"
                      : isDraft
                      ? "border-amber-500 bg-amber-500"
                      : "border-muted-foreground"
                  }`}
                />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      v{version.versionNumber}
                    </span>
                    {getStatusBadge(version.status)}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(version.publishedAtUtc ?? version.effectiveFromUtc)}
                  </span>
                </div>

                {/* Effective Duration */}
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>
                    {t("customField.versions.effective", { defaultValue: "Effective:" })}{" "}
                    {formatDate(version.effectiveFromUtc)}
                    {version.effectiveToUtc ? ` — ${formatDate(version.effectiveToUtc)}` : ""}
                  </span>
                </div>

                {/* Counts */}
                <div className="flex items-center gap-4 text-xs pt-1 border-t text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">
                      {version.optionCount}
                    </span>{" "}
                    {t("customField.versions.options", { defaultValue: "options" })}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {version.ruleCount}
                    </span>{" "}
                    {t("customField.versions.rules", { defaultValue: "rules" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
