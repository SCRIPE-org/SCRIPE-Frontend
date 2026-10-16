"use client";

import React from "react";
import { Archive, CheckCircle2, Clock, Layers, RefreshCw } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldVersionSummary } from "../../domain/entities/FieldInsight";

/**
 * Documentation for module export
 */
export interface FieldVersionTimelineProps {
  sortedVersions: readonly FieldVersionSummary[];
  isLoading: boolean;
  formatDate: (dateStr?: string | null) => string;
}

/**
 * Documentation for FieldVersionTimeline
 */
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
          <Badge variant="default" className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            {t("customField.versions.statusPublished", { defaultValue: "Published" })}
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="gap-1 border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <Clock className="h-3 w-3" />
            {t("customField.versions.statusDraft", { defaultValue: "Draft" })}
          </Badge>
        );
      case "deprecated":
        return (
          <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
            <Archive className="h-3 w-3" />
            {t("customField.versions.statusDeprecated", { defaultValue: "Deprecated" })}
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="gap-1 border-dashed text-muted-foreground/60">
            {t("customField.versions.statusArchived", { defaultValue: "Archived" })}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Layers className="h-3.5 w-3.5" />
        {t("customField.versions.timelineTitle", {
          defaultValue: "Version Timeline",
        })}
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-center text-xs text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          {t("common.loading", { defaultValue: "Loading versions..." })}
        </div>
      ) : sortedVersions.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
          {t("customField.versions.empty", {
            defaultValue: "No versions recorded for this field definition.",
          })}
        </div>
      ) : (
        <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-border">
          {sortedVersions.map((version) => {
            const isDraft = version.status.toLowerCase() === "draft";
            const isLive = version.status.toLowerCase() === "published";

            return (
              <div
                key={version.id}
                className="group relative space-y-2 rounded-lg border bg-card p-3.5 transition-colors hover:border-primary/40"
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
                    <span className="text-sm font-bold text-foreground">
                      v{version.versionNumber}
                    </span>
                    {getStatusBadge(version.status)}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(version.publishedAtUtc ?? version.effectiveFromUtc)}
                  </span>
                </div>

                {/* Effective Duration */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {t("customField.versions.effective", { defaultValue: "Effective:" })}{" "}
                    {formatDate(version.effectiveFromUtc)}
                    {version.effectiveToUtc ? ` — ${formatDate(version.effectiveToUtc)}` : ""}
                  </span>
                </div>

                {/* Counts */}
                <div className="flex items-center gap-4 border-t pt-1 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">{version.optionCount}</span>{" "}
                    {t("customField.versions.options", { defaultValue: "options" })}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{version.ruleCount}</span>{" "}
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
