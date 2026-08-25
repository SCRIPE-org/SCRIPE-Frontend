/**
 * Field Version History & Drafts Drawer (Step 1.3)
 *
 * Slide-out drawer displaying the full version history timeline for a custom field definition,
 * highlighting the active draft (if one exists), and providing actions to mint new drafts,
 * publish drafts to live production, or discard unneeded drafts.
 */
"use client";

import React, { useMemo } from "react";
import {
  GitBranch,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  Layers,
  ArrowUpRight,
  Archive,
  RefreshCw,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { ScrollArea } from "@core/ui/scroll-area";
import type { FieldVersionsTarget } from "../viewmodels/useFieldVersionsViewModel";
import type {
  FieldVersionsResponse,
  FieldVersionSummary,
} from "../../domain/entities/FieldInsight";

export interface FieldVersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  target: FieldVersionsTarget | null;
  versionsData: FieldVersionsResponse | null;
  isLoading: boolean;
  isCreatingDraft: boolean;
  isPublishing: boolean;
  isDiscarding: boolean;
  canPublish: boolean;
  onCreateDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscard: () => Promise<void>;
}

export function FieldVersionHistoryDrawer({
  isOpen,
  onClose,
  target,
  versionsData,
  isLoading,
  isCreatingDraft,
  isPublishing,
  isDiscarding,
  canPublish,
  onCreateDraft,
  onPublish,
  onDiscard,
}: FieldVersionHistoryDrawerProps) {
  const { t, language } = useI18n();

  const isMutating = isCreatingDraft || isPublishing || isDiscarding;

  const sortedVersions = useMemo(() => {
    if (!versionsData?.versions) return [];
    return [...versionsData.versions].sort((a, b) => b.versionNumber - a.versionNumber);
  }, [versionsData]);

  const activeDraft = useMemo(() => {
    return versionsData?.versions.find(
      (v) => v.status.toLowerCase() === "draft"
    ) ?? null;
  }, [versionsData]);

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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="end" className="w-full sm:max-w-xl flex flex-col h-full p-0">
        {/* Header */}
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>
                {t("customField.versions.drawerTitle", {
                  defaultValue: "Version History & Drafts",
                })}
              </SheetTitle>
              <SheetDescription className="text-xs font-mono mt-0.5">
                {target?.fieldLabel} ({target?.fieldKey})
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Field Meta Summary */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border text-xs">
              <div>
                <span className="text-muted-foreground block">
                  {t("customField.columns.entityType", { defaultValue: "Entity Type" })}
                </span>
                <span className="font-medium text-foreground">{target?.entityTypeKey}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  {t("customField.versions.publishedVersion", { defaultValue: "Published Version" })}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {versionsData?.publishedVersionNumber
                    ? `v${versionsData.publishedVersionNumber}`
                    : t("customField.versions.noPublished", { defaultValue: "None" })}
                </span>
              </div>
            </div>

            {/* Active Draft Management Section */}
            {versionsData?.hasDraft && activeDraft ? (
              <div className="rounded-xl border-2 border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-amber-950 dark:text-amber-200">
                      {t("customField.versions.activeDraftTitle", {
                        version: activeDraft.versionNumber,
                        defaultValue: `Active Draft (v${activeDraft.versionNumber})`,
                      })}
                    </span>
                    <Badge variant="secondary" className="bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100 text-xs">
                      {t("customField.versions.pendingPublish", { defaultValue: "Pending Publish" })}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activeDraft.publishedAtUtc ?? activeDraft.effectiveFromUtc)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                  <div>
                    <span className="font-medium text-foreground">{activeDraft.optionCount}</span>{" "}
                    {t("customField.versions.optionsCount", { defaultValue: "options configured" })}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{activeDraft.ruleCount}</span>{" "}
                    {t("customField.versions.rulesCount", { defaultValue: "rules configured" })}
                  </div>
                </div>

                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {t("customField.versions.draftNotice", {
                    defaultValue:
                      "This draft is isolated. Changes will not affect live production forms until published.",
                  })}
                </p>

                {canPublish && (
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-900/60">
                    <Button
                      size="sm"
                      onClick={onPublish}
                      disabled={isMutating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      {isPublishing
                        ? t("common.publishing", { defaultValue: "Publishing..." })
                        : t("customField.versions.publishDraftButton", {
                            defaultValue: "Publish to Live",
                          })}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onDiscard}
                      disabled={isMutating}
                      className="text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isDiscarding
                        ? t("common.discarding", { defaultValue: "Discarding..." })
                        : t("customField.versions.discardDraftButton", {
                            defaultValue: "Discard Draft",
                          })}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              canPublish && (
                <div className="p-4 rounded-xl border border-dashed bg-card flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-foreground">
                      {t("customField.versions.noActiveDraft", {
                        defaultValue: "No Active Draft",
                      })}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t("customField.versions.createDraftExplanation", {
                        defaultValue:
                          "Mint a draft copy from the live definition to edit options and visibility rules safely.",
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={onCreateDraft}
                    disabled={isMutating || isLoading}
                    className="shrink-0 gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    {isCreatingDraft
                      ? t("common.creating", { defaultValue: "Creating..." })
                      : t("customField.versions.createDraftButton", {
                          defaultValue: "Create Draft",
                        })}
                  </Button>
                </div>
              )
            )}

            {/* Version Timeline Chain */}
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
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="p-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t("common.close", { defaultValue: "Close" })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
