"use client";

import React from "react";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldVersionSummary } from "../../domain/entities/FieldInsight";

export interface FieldVersionDraftCardProps {
  hasDraft: boolean;
  activeDraft: FieldVersionSummary | null;
  canMutateVersion: boolean;
  isMutating: boolean;
  isLoading: boolean;
  isPublishing: boolean;
  isDiscarding: boolean;
  isCreatingDraft: boolean;
  onPublish: () => Promise<void>;
  onDiscard: () => Promise<void>;
  onCreateDraft: () => Promise<void>;
  formatDate: (dateStr?: string | null) => string;
}

export function FieldVersionDraftCard({
  hasDraft,
  activeDraft,
  canMutateVersion,
  isMutating,
  isLoading,
  isPublishing,
  isDiscarding,
  isCreatingDraft,
  onPublish,
  onDiscard,
  onCreateDraft,
  formatDate,
}: FieldVersionDraftCardProps): React.ReactElement | null {
  const { t } = useI18n();

  if (hasDraft && activeDraft) {
    return (
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
              "This draft is a snapshot from when it was created. It will not pick up any edits made to the live version while it stays open. Publishing replaces the live version with this draft, discarding any live edits made in the meantime.",
          })}
        </p>

        {canMutateVersion && (
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
    );
  }

  if (canMutateVersion) {
    return (
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
                "Mint a draft copy from the live definition to edit options and visibility rules safely. Publish it quickly: it won't pick up live edits made while it's open, and publishing overwrites the live version with the draft as it stood at creation.",
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
    );
  }

  return null;
}
