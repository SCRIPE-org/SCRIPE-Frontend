/**
 * Field Version History & Drafts Drawer (Step 1.3)
 *
 * Slide-out drawer displaying the full version history timeline for a custom field definition,
 * highlighting the active draft (if one exists), and providing actions to mint new drafts,
 * publish drafts to live production, or discard unneeded drafts.
 */
"use client";

import React, { useMemo } from "react";
import { GitBranch } from "lucide-react";
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
import { ScrollArea } from "@core/ui/scroll-area";
import type { FieldVersionsTarget } from "../viewmodels/useFieldVersionsViewModel";
import type { FieldVersionsResponse } from "../../domain/entities/FieldInsight";
import { FieldVersionDraftCard } from "./FieldVersionDraftCard";
import { FieldVersionTimeline } from "./FieldVersionTimeline";

/**
 * Documentation for module export
 */
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
  isPlatformContext?: boolean;
  onCreateDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscard: () => Promise<void>;
}

/**
 * Documentation for FieldVersionHistoryDrawer
 */
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
  isPlatformContext = false,
  onCreateDraft,
  onPublish,
  onDiscard,
}: FieldVersionHistoryDrawerProps) {
  const { t, language } = useI18n();

  const isMutating = isCreatingDraft || isPublishing || isDiscarding;
  const canMutateVersion = canPublish && (isPlatformContext || !target?.isGlobal);

  const sortedVersions = useMemo(() => {
    if (!versionsData?.versions) return [];
    return [...versionsData.versions].sort((a, b) => b.versionNumber - a.versionNumber);
  }, [versionsData]);

  const activeDraft = useMemo(() => {
    return versionsData?.versions.find((v) => v.status.toLowerCase() === "draft") ?? null;
  }, [versionsData]);

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
      <SheetContent side="end" className="flex h-full w-full flex-col p-0 sm:max-w-xl">
        {/* Header */}
        <SheetHeader className="border-b p-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>
                {t("customField.versions.drawerTitle", {
                  defaultValue: "Version History & Drafts",
                })}
              </SheetTitle>
              <SheetDescription className="mt-0.5 font-mono text-xs">
                {target?.fieldLabel} ({target?.fieldKey})
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Field Meta Summary */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/50 p-3 text-xs">
              <div>
                <span className="block text-muted-foreground">
                  {t("customField.columns.entityType", { defaultValue: "Entity Type" })}
                </span>
                <span className="font-medium text-foreground">{target?.entityTypeKey}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">
                  {t("customField.versions.publishedVersion", {
                    defaultValue: "Published Version",
                  })}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {versionsData?.publishedVersionNumber
                    ? `v${versionsData.publishedVersionNumber}`
                    : t("customField.versions.noPublished", { defaultValue: "None" })}
                </span>
              </div>
            </div>

            {/* Active Draft Management Section */}
            <FieldVersionDraftCard
              hasDraft={Boolean(versionsData?.hasDraft)}
              activeDraft={activeDraft}
              canMutateVersion={canMutateVersion}
              isMutating={isMutating}
              isLoading={isLoading}
              isPublishing={isPublishing}
              isDiscarding={isDiscarding}
              isCreatingDraft={isCreatingDraft}
              onPublish={onPublish}
              onDiscard={onDiscard}
              onCreateDraft={onCreateDraft}
              formatDate={formatDate}
            />

            {/* Version Timeline Chain */}
            <FieldVersionTimeline
              sortedVersions={sortedVersions}
              isLoading={isLoading}
              formatDate={formatDate}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="border-t bg-muted/20 p-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t("common.close", { defaultValue: "Close" })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
